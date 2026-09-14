from pydantic import BaseModel, Field
from typing import List, Optional

class ValuationComps(BaseModel):
    name: str
    sector: str
    ev_revenue: float
    ev_ebitda: float
    deal_type: str
    notes: str

class QoEAddBack(BaseModel):
    name: str
    category: str
    amount_range: str
    rationale: str

class AICalibrationRequest(BaseModel):
    sector: str = "B2B SaaS / Enterprise Software"
    revenue: float = 25.0
    ebitda: float = 6.0
    enterprise_value: Optional[float] = None
    target_name: Optional[str] = "Target Corp"

class AICalibrationResponse(BaseModel):
    sector: str
    target_name: str
    recommended_wacc: float
    wacc_rationale: str
    recommended_exit_multiple: float
    multiple_rationale: str
    recommended_cagr_pct: float
    cagr_rationale: str
    recommended_ebitda_margin_pct: float
    margin_rationale: str
    market_risk_profile: str
    comps_summary: str
    top_comps: List[ValuationComps]
    suggested_qoe_add_backs: List[QoEAddBack]
    source_benchmarks: str
    ai_powered: bool = True

class MrWonderfulCritiqueRequest(BaseModel):
    target_name: str = "Target Corp"
    revenue: float = 25.0
    ebitda: float = 6.0
    investment_amount: float = 2.0
    royalty_pct: float = 5.0
    payback_cap_mult: float = 2.0
    residual_equity_pct: float = 3.0
    payback_months: float = 24.0
    investor_irr_pct: float = 38.5

class MrWonderfulCritiqueResponse(BaseModel):
    verdict_title: str
    shark_quote: str
    verdict_sentiment: str  # "deal", "caution", "dead_to_me"
    deal_analysis: str
    founder_takeaway: str
    suggested_counter_offer: str
    ai_powered: bool = True

class AICopilotAction(BaseModel):
    label: str
    action_type: str  # e.g., "set_wacc", "set_multiple", "navigate_tab", "run_dcf", "open_memo"
    payload: dict = Field(default_factory=dict)

class AICopilotChatRequest(BaseModel):
    query: str
    model: str = "gemini-1.5-flash"  # "gemini-1.5-flash", "gemini-1.5-pro", "institutional-offline"
    persona: str = "cfo"  # "cfo" or "mr_wonderful"
    context: Optional[dict] = None  # active deal, dcf parameters, runway overview
    history: Optional[List[dict]] = None

class AICopilotChatResponse(BaseModel):
    reply: str
    model_used: str
    persona: str
    latency_ms: int
    suggested_actions: List[AICopilotAction] = Field(default_factory=list)
    sources: List[str] = Field(default_factory=list)
    ai_powered: bool = True

