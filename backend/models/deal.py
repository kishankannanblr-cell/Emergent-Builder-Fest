from pydantic import BaseModel, Field
from typing import Optional
import uuid
from datetime import datetime, timezone

def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

class DealBase(BaseModel):
    name: str
    target_company: str
    sector: str = "SaaS / Software"
    deal_type: str = "100% Buyout"
    stage: str = "Initial Review"
    enterprise_value: float = 25.0
    revenue: float = 10.0
    ebitda: float = 2.5
    ebitda_multiple: float = 10.0
    lead_partner: str = "Marcus Vance"
    probability_pct: int = 50
    cash_required: float = 18.0
    target_close_date: str = "2025-09-30"
    notes: Optional[str] = ""

class DealCreate(DealBase):
    pass

class DealUpdate(BaseModel):
    name: Optional[str] = None
    target_company: Optional[str] = None
    sector: Optional[str] = None
    deal_type: Optional[str] = None
    stage: Optional[str] = None
    enterprise_value: Optional[float] = None
    revenue: Optional[float] = None
    ebitda: Optional[float] = None
    ebitda_multiple: Optional[float] = None
    lead_partner: Optional[str] = None
    probability_pct: Optional[int] = None
    cash_required: Optional[float] = None
    target_close_date: Optional[str] = None
    notes: Optional[str] = None

class DealStageUpdate(BaseModel):
    stage: str

class Deal(DealBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=utc_now_iso)
    updated_at: str = Field(default_factory=utc_now_iso)
