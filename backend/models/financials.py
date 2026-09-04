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
