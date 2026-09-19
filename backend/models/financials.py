from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone

def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

class EBITDAAdjustmentCreate(BaseModel):
    deal_id: Optional[str] = None
    name: str
    category: str = "Owner Compensation"
    amount: float
    adjustment_type: str = "add_back"  # "add_back" or "deduction"
    notes: Optional[str] = ""

class EBITDAAdjustment(EBITDAAdjustmentCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=utc_now_iso)

class DCFRequest(BaseModel):
    revenue_base: float = 25.0
    growth_rate_pct: float = 20.0
    ebitda_margin_pct: float = 25.0
    discount_rate_wacc: float = 10.5
    terminal_growth_pct: float = 2.5
    exit_multiple: float = 12.0
    tax_rate_pct: float = 21.0
    capex_pct: float = 4.0
    nwc_pct: float = 2.0
    net_debt: float = 5.0

class CashFlowProjection(BaseModel):
    year: int
    revenue: float
    ebitda: float
    fcf: float
    discount_factor: float
    pv_fcf: float

class SensitivityCell(BaseModel):
    wacc: float
    exit_multiple: float
    implied_ev: float
    implied_equity_val: float

class DCFResponse(BaseModel):
    implied_enterprise_value: float
    implied_equity_value: float
    pv_cash_flows: float
    terminal_value: float
    pv_terminal_value: float
    projected_cash_flows: List[CashFlowProjection]
    sensitivity_matrix: List[SensitivityCell]

class RunwayMonth(BaseModel):
    month: str
    cash_balance: float
    gross_burn: float
    revenue: float
    net_burn: float
    runway_alert: str

class CashRunwayResponse(BaseModel):
    current_cash: float
    monthly_net_burn: float
    runway_months: float
    zero_cash_date: str
    stress_test_runway: float
    projections: List[RunwayMonth]

class StageSummary(BaseModel):
    stage: str
    count: int
    total_ev: float
    weighted_ev: float

class SectorSummary(BaseModel):
    sector: str
    count: int
    total_ev: float

class FinancialOverview(BaseModel):
    total_pipeline_ev: float
    active_deals_count: int
    avg_ebitda_multiple: float
    closed_deal_volume_ytd: float
    portfolio_cash_balance: float
    monthly_burn_rate: float
    weighted_runway_months: float
    stage_breakdown: List[StageSummary]
    sector_breakdown: List[SectorSummary]

class PLRowItem(BaseModel):
    account_name: str
    category: str  # "revenue", "cogs", "opex_sales", "opex_rd", "opex_ga", "da", "owner_comp", "one_time_expense", "other"
    amount: float
    is_addback_candidate: bool = False
    suggested_addback_reason: Optional[str] = None

class PLImportRequest(BaseModel):
    company_name: str = "Target Corp"
    sector: str = "SaaS / Software"
    deal_type: str = "100% Buyout"
    asking_price_ev: float = 35.0
    lead_partner: str = "Marcus Vance"
    csv_text: Optional[str] = None
    custom_rows: Optional[List[PLRowItem]] = None

class QoEAddbackItem(BaseModel):
    name: str
    category: str
    amount: float
    rationale: str

class PLImportResponse(BaseModel):
    company_name: str
    sector: str
    revenue: float
    cogs: float
    gross_profit: float
    gross_margin_pct: float
    operating_expenses: float
    da: float
    unadjusted_ebitda: float
    unadjusted_ebitda_margin_pct: float
    suggested_addbacks: List[QoEAddbackItem]
    total_addbacks: float
    adjusted_ebitda: float
    adjusted_ebitda_margin_pct: float
    implied_ev_ebitda_multiple: float
    parsed_rows_count: int

class DealWithAdjustmentsCreate(BaseModel):
    name: str
    target_company: str
    sector: str = "SaaS / Software"
    deal_type: str = "100% Buyout"
    stage: str = "Due Diligence"
    enterprise_value: float = 35.0
    revenue: float = 12.0
    ebitda: float = 3.0
    ebitda_multiple: float = 11.67
    lead_partner: str = "Marcus Vance"
    probability_pct: int = 60
    cash_required: float = 25.0
    target_close_date: str = "2025-11-30"
    notes: Optional[str] = ""
    adjustments: List[EBITDAAdjustmentCreate] = []

class PresetTemplate(BaseModel):
    id: str
    title: str
    tagline: str
    sector: str
    target_company: str
    enterprise_value: float
    revenue: float
    cogs: float
    opex: float
    unadjusted_ebitda: float
    addbacks_total: float
    adjusted_ebitda: float
    default_wacc: float
    default_exit_multiple: float
    csv_content: str
    addbacks: List[QoEAddbackItem]

