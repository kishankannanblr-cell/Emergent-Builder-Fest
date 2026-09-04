from fastapi import APIRouter, HTTPException
from typing import List
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
    SectorSummary
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
