from fastapi import APIRouter, HTTPException
from typing import List, Optional
import csv
import io
import re
from lib.db import db
from models.financials import (
    EBITDAAdjustment,
    EBITDAAdjustmentCreate,
    DCFRequest,
    DCFResponse,
    CashFlowProjection,
    SensitivityCell,
    CashRunwayResponse,
    RunwayMonth,
    FinancialOverview,
    StageSummary,
    SectorSummary,
    PLRowItem,
    PLImportRequest,
    PLImportResponse,
    QoEAddbackItem,
    DealWithAdjustmentsCreate,
    PresetTemplate
)
from models.deal import Deal
import math

router = APIRouter(prefix="/financials", tags=["financials"])


STAGES_ORDER = [
    "Lead Sourcing",
    "Initial Review",
    "NDA Signed",
    "CIM Review",
    "IOI Submitted",
    "LOI / Exclusivity",
    "Due Diligence",
    "Definitive Docs",
    "Closed Won",
    "Passed"
]

@router.get("/overview", response_model=FinancialOverview)
async def get_financial_overview():
    deals_docs = await db.deals.find({}, {"_id": 0}).to_list(1000)
    deals = [Deal(**d) for d in deals_docs]
    
    active_deals = [d for d in deals if d.stage not in ["Closed Won", "Passed"]]
    closed_deals = [d for d in deals if d.stage == "Closed Won"]
    
    total_pipeline_ev = sum(d.enterprise_value for d in active_deals)
    closed_deal_volume_ytd = sum(d.enterprise_value for d in closed_deals)
    
    multiples = [d.ebitda_multiple for d in active_deals if d.ebitda_multiple > 0]
    avg_ebitda_multiple = round(sum(multiples) / len(multiples), 2) if multiples else 10.5
    
    # Stage breakdown
    stage_map = {}
    for s in STAGES_ORDER:
        stage_map[s] = {"count": 0, "total_ev": 0.0, "weighted_ev": 0.0}
        
    for d in deals:
        if d.stage not in stage_map:
            stage_map[d.stage] = {"count": 0, "total_ev": 0.0, "weighted_ev": 0.0}
        stage_map[d.stage]["count"] += 1
        stage_map[d.stage]["total_ev"] += d.enterprise_value
        stage_map[d.stage]["weighted_ev"] += round(d.enterprise_value * (d.probability_pct / 100.0), 2)
        
    stage_breakdown = [
        StageSummary(
            stage=k,
            count=v["count"],
            total_ev=round(v["total_ev"], 2),
            weighted_ev=round(v["weighted_ev"], 2)
        )
        for k, v in stage_map.items() if v["count"] > 0 or k in STAGES_ORDER[:8]
    ]
    
    # Sector breakdown
    sector_map = {}
    for d in deals:
        if d.sector not in sector_map:
            sector_map[d.sector] = {"count": 0, "total_ev": 0.0}
        sector_map[d.sector]["count"] += 1
        sector_map[d.sector]["total_ev"] += d.enterprise_value
        
    sector_breakdown = [
        SectorSummary(
            sector=k,
            count=v["count"],
            total_ev=round(v["total_ev"], 2)
        )
        for k, v in sector_map.items()
    ]
    
    # Portfolio cash metrics
    portfolio_cash_balance = 34.5  # $34.5M dry powder / reserves
    monthly_burn_rate = 1.35      # $1.35M net monthly burn/overhead & deal ops
    weighted_runway_months = round(portfolio_cash_balance / monthly_burn_rate, 1)
    
    return FinancialOverview(
        total_pipeline_ev=round(total_pipeline_ev, 2),
        active_deals_count=len(active_deals),
        avg_ebitda_multiple=avg_ebitda_multiple,
        closed_deal_volume_ytd=round(closed_deal_volume_ytd, 2),
        portfolio_cash_balance=portfolio_cash_balance,
        monthly_burn_rate=monthly_burn_rate,
        weighted_runway_months=weighted_runway_months,
        stage_breakdown=stage_breakdown,
        sector_breakdown=sector_breakdown
    )

@router.get("/runway", response_model=CashRunwayResponse)
async def get_cash_runway():
    current_cash = 34.5  # $34.5M
    monthly_net_burn = 1.35  # $1.35M
    runway_months = round(current_cash / monthly_net_burn, 1)  # ~25.5 months
    stress_test_runway = round(current_cash / (monthly_net_burn * 1.3), 1)  # +30% burn scenario
    
    # Generate 12-month projection
    months = ["Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6", 
              "Month 7", "Month 8", "Month 9", "Month 10", "Month 11", "Month 12"]
    
    projections = []
    rem_cash = current_cash
    gross_burn_base = 2.10
    rev_base = 0.75
    
    for i, m in enumerate(months):
        gross_burn = round(gross_burn_base + (i * 0.03), 2)
        rev = round(rev_base + (i * 0.05), 2)
        net = round(gross_burn - rev, 2)
        rem_cash = max(0.0, round(rem_cash - net, 2))
        
        alert = "Healthy (> 18m)"
        if rem_cash < 10.0:
            alert = "Warning (< 8m)"
        elif rem_cash < 18.0:
            alert = "Moderate (12-18m)"
            
        projections.append(RunwayMonth(
            month=m,
            cash_balance=rem_cash,
            gross_burn=gross_burn,
            revenue=rev,
            net_burn=net,
            runway_alert=alert
        ))
        
    return CashRunwayResponse(
        current_cash=current_cash,
        monthly_net_burn=monthly_net_burn,
        runway_months=runway_months,
        zero_cash_date="Q3 2027",
        stress_test_runway=stress_test_runway,
        projections=projections
    )

@router.post("/dcf-calculate", response_model=DCFResponse)
async def calculate_dcf(req: DCFRequest):
    # 5-year Free Cash Flow Projections
    projected_cfs = []
    current_rev = req.revenue_base
    growth_rate = req.growth_rate_pct / 100.0
    ebitda_margin = req.ebitda_margin_pct / 100.0
    wacc = req.discount_rate_wacc / 100.0
    tax_rate = req.tax_rate_pct / 100.0
    capex_rate = req.capex_pct / 100.0
    nwc_rate = req.nwc_pct / 100.0
    
    total_pv_fcf = 0.0
    last_year_ebitda = 0.0
    
    for year in range(1, 6):
        current_rev = current_rev * (1 + growth_rate)
        ebitda = current_rev * ebitda_margin
        # D&A approx 4% rev, EBIT = EBITDA - D&A
        da = current_rev * 0.04
        ebit = max(0.0, ebitda - da)
        tax = ebit * tax_rate
        nopat = ebit - tax
        capex = current_rev * capex_rate
        change_nwc = current_rev * nwc_rate
        fcf = nopat + da - capex - change_nwc
        
        discount_factor = 1.0 / math.pow(1 + wacc, year)
        pv_fcf = fcf * discount_factor
        total_pv_fcf += pv_fcf
        last_year_ebitda = ebitda
        
        projected_cfs.append(CashFlowProjection(
            year=year,
            revenue=round(current_rev, 2),
            ebitda=round(ebitda, 2),
            fcf=round(fcf, 2),
            discount_factor=round(discount_factor, 4),
            pv_fcf=round(pv_fcf, 2)
        ))
        
    # Terminal Value using Exit Multiple method
    terminal_value = last_year_ebitda * req.exit_multiple
    pv_terminal_value = terminal_value / math.pow(1 + wacc, 5)
    
    implied_ev = total_pv_fcf + pv_terminal_value
    implied_equity_val = implied_ev - req.net_debt
    
    # 5x5 Sensitivity Matrix (WACC vs Exit Multiple)
    wacc_steps = [
        round(req.discount_rate_wacc - 2.0, 1),
        round(req.discount_rate_wacc - 1.0, 1),
        round(req.discount_rate_wacc, 1),
        round(req.discount_rate_wacc + 1.0, 1),
        round(req.discount_rate_wacc + 2.0, 1),
    ]
    
    multiple_steps = [
        round(req.exit_multiple - 2.0, 1),
        round(req.exit_multiple - 1.0, 1),
        round(req.exit_multiple, 1),
        round(req.exit_multiple + 1.0, 1),
        round(req.exit_multiple + 2.0, 1),
    ]
    
    sensitivity_matrix = []
    for w in wacc_steps:
        w_dec = w / 100.0
        # recalculate pv of cashflows for this wacc
        pv_cf_matrix = sum(
            cf.fcf / math.pow(1 + w_dec, cf.year) for cf in projected_cfs
        )
        for m in multiple_steps:
            tv_matrix = last_year_ebitda * m
            pv_tv_matrix = tv_matrix / math.pow(1 + w_dec, 5)
            ev_cell = pv_cf_matrix + pv_tv_matrix
            eq_cell = ev_cell - req.net_debt
            sensitivity_matrix.append(SensitivityCell(
                wacc=w,
                exit_multiple=m,
                implied_ev=round(ev_cell, 2),
                implied_equity_val=round(eq_cell, 2)
            ))
            
    return DCFResponse(
        implied_enterprise_value=round(implied_ev, 2),
        implied_equity_value=round(implied_equity_val, 2),
        pv_cash_flows=round(total_pv_fcf, 2),
        terminal_value=round(terminal_value, 2),
        pv_terminal_value=round(pv_terminal_value, 2),
        projected_cash_flows=projected_cfs,
        sensitivity_matrix=sensitivity_matrix
    )

@router.get("/ebitda-adjustments", response_model=List[EBITDAAdjustment])
async def get_ebitda_adjustments():
    docs = await db.ebitda_adjustments.find({}, {"_id": 0}).to_list(1000)
    return [EBITDAAdjustment(**doc) for doc in docs]

@router.post("/ebitda-adjustments", response_model=EBITDAAdjustment, status_code=201)
async def create_ebitda_adjustment(payload: EBITDAAdjustmentCreate):
    adj = EBITDAAdjustment(**payload.model_dump())
    await db.ebitda_adjustments.insert_one(adj.model_dump())
    return adj

@router.delete("/ebitda-adjustments/{id}")
async def delete_ebitda_adjustment(id: str):
    res = await db.ebitda_adjustments.delete_one({"id": id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Adjustment not found")
    return {"message": "Adjustment deleted successfully", "id": id}

@router.post("/seed-data")
async def seed_data():
    from seed import run_seed
    await run_seed()
    return {"message": "Seed data successfully populated"}

PRESET_TEMPLATES = [
    PresetTemplate(
        id="saas-cloudmetrics",
        title="CloudMetrics B2B SaaS",
        tagline="Enterprise Observability & DevSecOps Platform (124% NRR)",
        sector="SaaS / Enterprise Software",
        target_company="CloudMetrics Systems Inc.",
        enterprise_value=55.0,
        revenue=15.4,
        cogs=2.9,
        opex=8.7,
        unadjusted_ebitda=3.8,
        addbacks_total=0.82,
        adjusted_ebitda=4.62,
        default_wacc=9.8,
        default_exit_multiple=14.5,
        csv_content="""Account Name,Category,Amount
Recurring Platform Subscriptions (ARR),Revenue,13800000
Professional Onboarding & Services,Revenue,1600000
Cloud Hosting & AWS Multi-Region Infrastructure,COGS,2100000
Customer Support & Technical Tier-3 Ops,COGS,800000
Sales & Marketing Enterprise Go-To-Market,OpEx,4800000
R&D Core Engine Engineering Payroll,OpEx,2700000
General & Administrative Overhead,OpEx,1200000
Founder Above-Market Compensation,Owner Compensation,350000
Legacy Monolith to AWS EKS Migration,One-Time Expense,280000
Discontinued Dev Tools Beta Line,One-Time Expense,190000
Depreciation & Amortization,D&A,450000""",
        addbacks=[
            QoEAddbackItem(name="Founder Above-Market Compensation", category="Owner Compensation", amount=0.35, rationale="Normalize founder comp ($700k) to middle-market CEO benchmark ($350k)."),
            QoEAddbackItem(name="Legacy Monolith to AWS EKS Migration", category="One-Time Technology", amount=0.28, rationale="Non-recurring 6-month dual hosting costs incurred during cloud transition."),
            QoEAddbackItem(name="Discontinued Dev Tools Beta Line", category="Discontinued Operations", amount=0.19, rationale="Isolated development burn for deprecated consumer tooling experiment.")
        ]
    ),
    PresetTemplate(
        id="medtech-cardiopulse",
        title="CardioPulse MedTech Diagnostics",
        tagline="AI-Assisted Remote Patient Monitoring & Clinic Network",
        sector="Healthcare / MedTech",
        target_company="CardioPulse Healthcare Corp",
        enterprise_value=95.0,
        revenue=28.2,
        cogs=16.5,
        opex=4.3,
        unadjusted_ebitda=7.4,
        addbacks_total=0.75,
        adjusted_ebitda=8.15,
        default_wacc=8.9,
        default_exit_multiple=13.0,
        csv_content="""Account Name,Category,Amount
Clinical Diagnostic Billing & Payor Receipts,Revenue,24500000
Remote Monitoring Software Licensing,Revenue,3700000
Medical Devices & Consumable Sensor Supplies,COGS,12800000
Clinic Nursing & Technician Operations,COGS,3700000
Specialist Sales & Hospital Outreach,OpEx,2400000
Regulatory Compliance & Quality Assurance,OpEx,1100000
Corporate Administration & Facilities,OpEx,800000
FDA / HIPAA Audit Advisory Retainers,One-Time Expense,420000
Clinic Consolidation Severance Packages,One-Time Expense,330000
Medical Device Depreciation,D&A,850000""",
        addbacks=[
            QoEAddbackItem(name="FDA / HIPAA Audit Advisory Retainers", category="Regulatory & Legal", amount=0.42, rationale="One-off external audit preparation fees for 510(k) clearance."),
            QoEAddbackItem(name="Clinic Consolidation Severance Packages", category="Restructuring", amount=0.33, rationale="One-time severance payouts following the integration of 2 regional clinics.")
        ]
    ),
    PresetTemplate(
        id="consumer-apexd2c",
        title="ApexDirect Omnichannel Brands",
        tagline="High-Growth Consumer Wellness & Wholesale Distribution",
        sector="Consumer / E-Commerce",
        target_company="ApexDirect Brand Holdings",
        enterprise_value=14.5,
        revenue=8.5,
        cogs=4.2,
        opex=2.8,
        unadjusted_ebitda=1.5,
        addbacks_total=0.36,
        adjusted_ebitda=1.86,
        default_wacc=11.8,
        default_exit_multiple=8.5,
        csv_content="""Account Name,Category,Amount
Shopify Direct-to-Consumer Digital Sales,Revenue,5400000
Target & Specialty Wholesale Purchase Orders,Revenue,3100000
Contract Manufacturing & Formulation,COGS,2900000
Fulfillment Logistics & 3PL Warehousing,COGS,1300000
Digital Performance Marketing & Ad Spend,OpEx,1900000
Brand Team & Corporate Operations,OpEx,900000
Ocean Freight Spot Surcharge Spike,One-Time Expense,240000
Legacy Agency Contract Early Termination Fee,One-Time Expense,120000
Warehouse Equipment Depreciation,D&A,180000""",
        addbacks=[
            QoEAddbackItem(name="Ocean Freight Spot Surcharge Spike", category="Supply Chain Anomalies", amount=0.24, rationale="Historical spot shipping spike exceeding normalized contract freight rates."),
            QoEAddbackItem(name="Agency Early Termination Fee", category="Marketing Restructuring", amount=0.12, rationale="One-time contractual penalty to bring digital marketing in-house.")
        ]
    )
]

@router.get("/preset-templates", response_model=List[PresetTemplate])
async def get_preset_templates():
    return PRESET_TEMPLATES

def parse_pl_csv_text(csv_text: str, default_asking_ev: float, company_name: str, sector: str) -> PLImportResponse:
    lines = [line.strip() for line in csv_text.strip().splitlines() if line.strip()]
    if not lines:
        raise HTTPException(status_code=400, detail="Provided CSV text is empty")
    
    total_rev = 0.0
    total_cogs = 0.0
    total_opex = 0.0
    total_da = 0.0
    addbacks: List[QoEAddbackItem] = []
    
    # Try using csv reader
    reader = csv.reader(io.StringIO(csv_text))
    rows = list(reader)
    
    header_skipped = False
    parsed_count = 0
    
    for row in rows:
        if not row or len(row) < 2:
            continue
        
        # Check if first row is header
        first_cell = str(row[0]).strip().lower()
        if not header_skipped and ("account" in first_cell or "name" in first_cell or "item" in first_cell or "description" in first_cell):
            header_skipped = True
            continue
        
        account_name = str(row[0]).strip()
        category_str = str(row[1]).strip().lower() if len(row) >= 3 else ""
        amount_raw = str(row[2] if len(row) >= 3 else row[1]).strip()
        
        # Clean amount
        clean_num = re.sub(r"[^\d.-]", "", amount_raw)
        if not clean_num or clean_num == "-" or clean_num == ".":
            continue
        
        try:
            amt = float(clean_num)
        except ValueError:
            continue
            
        parsed_count += 1
        acc_lower = account_name.lower()
        
        # Normalize dollar units if in full dollars (e.g. 15,400,000 -> 15.4M)
        amt_millions = amt / 1_000_000.0 if abs(amt) >= 50_000 else amt
        
        # Categorize
        if "revenue" in category_str or any(k in acc_lower for k in ["revenue", "sales", "arr", "mrr", "subscription", "billing", "receipts"]):
            total_rev += amt_millions
        elif "cogs" in category_str or "cost" in category_str or any(k in acc_lower for k in ["cogs", "hosting", "cloud infrastructure", "sensor", "supplies", "manufacturing", "fulfillment"]):
            total_cogs += amt_millions
        elif "d&a" in category_str or "depreciation" in category_str or any(k in acc_lower for k in ["depreciation", "amortization", "d&a"]):
            total_da += amt_millions
        elif "owner" in category_str or any(k in acc_lower for k in ["founder", "owner compensation", "ceo salary", "executive excess"]):
            total_opex += amt_millions
            addbacks.append(QoEAddbackItem(
                name=account_name,
                category="Owner Compensation",
                amount=round(amt_millions * 0.5 if amt_millions > 0.5 else amt_millions, 2),
                rationale="Normalize executive compensation down to middle-market benchmark standard."
            ))
        elif "one-time" in category_str or "non-recurring" in category_str or any(k in acc_lower for k in ["migration", "severance", "audit", "one-time", "lawsuit", "penalty", "restructuring", "surcharge"]):
            total_opex += amt_millions
            addbacks.append(QoEAddbackItem(
                name=account_name,
                category="One-Time / Non-Recurring",
                amount=round(amt_millions, 2),
                rationale="Identified as non-recurring transitional or abnormal operating expense."
            ))
        else:
            total_opex += amt_millions
            
    # Compute summaries
    gross_profit = round(total_rev - total_cogs, 2)
    gross_margin_pct = round((gross_profit / total_rev * 100), 1) if total_rev > 0 else 0.0
    unadjusted_ebitda = round(gross_profit - total_opex, 2)
    unadjusted_ebitda_margin_pct = round((unadjusted_ebitda / total_rev * 100), 1) if total_rev > 0 else 0.0
    total_addbacks = round(sum(a.amount for a in addbacks), 2)
    adjusted_ebitda = round(unadjusted_ebitda + total_addbacks, 2)
    adjusted_ebitda_margin_pct = round((adjusted_ebitda / total_rev * 100), 1) if total_rev > 0 else 0.0
    implied_ev_multiple = round(default_asking_ev / adjusted_ebitda, 2) if adjusted_ebitda > 0 else 10.0
    
    return PLImportResponse(
        company_name=company_name,
        sector=sector,
        revenue=round(total_rev, 2),
        cogs=round(total_cogs, 2),
        gross_profit=gross_profit,
        gross_margin_pct=gross_margin_pct,
        operating_expenses=round(total_opex, 2),
        da=round(total_da, 2),
        unadjusted_ebitda=unadjusted_ebitda,
        unadjusted_ebitda_margin_pct=unadjusted_ebitda_margin_pct,
        suggested_addbacks=addbacks,
        total_addbacks=total_addbacks,
        adjusted_ebitda=adjusted_ebitda,
        adjusted_ebitda_margin_pct=adjusted_ebitda_margin_pct,
        implied_ev_ebitda_multiple=implied_ev_multiple,
        parsed_rows_count=parsed_count
    )

@router.post("/parse-pl", response_model=PLImportResponse)
async def parse_pl(req: PLImportRequest):
    """
    Parses raw CSV or line-item P&L text, auto-calculates Gross Profit, EBITDA,
    detects candidate QoE Add-Backs (Owner Comp, One-Time Costs), and computes
    normalized financial metrics.
    """
    if req.csv_text:
        return parse_pl_csv_text(
            csv_text=req.csv_text,
            default_asking_ev=req.asking_price_ev,
            company_name=req.company_name,
            sector=req.sector
        )
    
    # Custom rows parsing
    if req.custom_rows:
        total_rev = 0.0
        total_cogs = 0.0
        total_opex = 0.0
        total_da = 0.0
        addbacks: List[QoEAddbackItem] = []
        
        for r in req.custom_rows:
            amt_millions = r.amount / 1_000_000.0 if abs(r.amount) >= 50_000 else r.amount
            if r.category == "revenue":
                total_rev += amt_millions
            elif r.category == "cogs":
                total_cogs += amt_millions
            elif r.category == "da":
                total_da += amt_millions
            else:
                total_opex += amt_millions
                if r.is_addback_candidate:
                    addbacks.append(QoEAddbackItem(
                        name=r.account_name,
                        category="Owner Compensation" if "owner" in r.category else "One-Time Expense",
                        amount=round(amt_millions, 2),
                        rationale=r.suggested_addback_reason or "Identified non-recurring expense"
                    ))
                    
        gross_profit = round(total_rev - total_cogs, 2)
        gross_margin_pct = round((gross_profit / total_rev * 100), 1) if total_rev > 0 else 0.0
        unadjusted_ebitda = round(gross_profit - total_opex, 2)
        unadjusted_ebitda_margin_pct = round((unadjusted_ebitda / total_rev * 100), 1) if total_rev > 0 else 0.0
        total_addbacks = round(sum(a.amount for a in addbacks), 2)
        adjusted_ebitda = round(unadjusted_ebitda + total_addbacks, 2)
        adjusted_ebitda_margin_pct = round((adjusted_ebitda / total_rev * 100), 1) if total_rev > 0 else 0.0
        implied_ev_multiple = round(req.asking_price_ev / adjusted_ebitda, 2) if adjusted_ebitda > 0 else 10.0
        
        return PLImportResponse(
            company_name=req.company_name,
            sector=req.sector,
            revenue=round(total_rev, 2),
            cogs=round(total_cogs, 2),
            gross_profit=gross_profit,
            gross_margin_pct=gross_margin_pct,
            operating_expenses=round(total_opex, 2),
            da=round(total_da, 2),
            unadjusted_ebitda=unadjusted_ebitda,
            unadjusted_ebitda_margin_pct=unadjusted_ebitda_margin_pct,
            suggested_addbacks=addbacks,
            total_addbacks=total_addbacks,
            adjusted_ebitda=adjusted_ebitda,
            adjusted_ebitda_margin_pct=adjusted_ebitda_margin_pct,
            implied_ev_ebitda_multiple=implied_ev_multiple,
            parsed_rows_count=len(req.custom_rows)
        )
        
    raise HTTPException(status_code=400, detail="Must provide either csv_text or custom_rows")

@router.post("/import-deal-with-adjustments")
async def import_deal_with_adjustments(payload: DealWithAdjustmentsCreate):
    """
    Atomically inserts a new deal opportunity into `deals` and adds all detected
    QoE add-backs to `ebitda_adjustments` linked by deal id.
    """
    deal_dict = {
        "name": payload.name,
        "target_company": payload.target_company,
        "sector": payload.sector,
        "deal_type": payload.deal_type,
        "stage": payload.stage,
        "enterprise_value": payload.enterprise_value,
        "revenue": payload.revenue,
        "ebitda": payload.ebitda,
        "ebitda_multiple": payload.ebitda_multiple,
        "lead_partner": payload.lead_partner,
        "probability_pct": payload.probability_pct,
        "cash_required": payload.cash_required,
        "target_close_date": payload.target_close_date,
        "notes": payload.notes or ""
    }
    new_deal = Deal(**deal_dict)
    await db.deals.insert_one(new_deal.model_dump())
    
    created_adjustments = []
    if payload.adjustments:
        for adj_data in payload.adjustments:
            adj = EBITDAAdjustment(
                deal_id=new_deal.id,
                name=adj_data.name,
                category=adj_data.category,
                amount=adj_data.amount,
                adjustment_type=adj_data.adjustment_type,
                notes=adj_data.notes or f"Imported with deal {new_deal.name}"
            )
            await db.ebitda_adjustments.insert_one(adj.model_dump())
            created_adjustments.append(adj)
            
    return {
        "message": "Deal and QoE Adjustments imported successfully",
        "deal": new_deal,
        "adjustments": created_adjustments
    }

