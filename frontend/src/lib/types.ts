export interface Deal {
  id: string;
  name: string;
  target_company: string;
  sector: string;
  deal_type: string;
  stage: string;
  enterprise_value: number;
  revenue: number;
  ebitda: number;
  ebitda_multiple: number;
  lead_partner: string;
  probability_pct: number;
  cash_required: number;
  target_close_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DealCreate {
  name: string;
  target_company: string;
  sector?: string;
  deal_type?: string;
  stage?: string;
  enterprise_value: number;
  revenue: number;
  ebitda: number;
  ebitda_multiple?: number;
  lead_partner?: string;
  probability_pct?: number;
  cash_required?: number;
  target_close_date?: string;
  notes?: string;
}

export interface DealUpdate {
  name?: string;
  target_company?: string;
  sector?: string;
  deal_type?: string;
  stage?: string;
  enterprise_value?: number;
  revenue?: number;
  ebitda?: number;
  ebitda_multiple?: number;
  lead_partner?: string;
  probability_pct?: number;
  cash_required?: number;
  target_close_date?: string;
  notes?: string;
}

export interface StageSummary {
  stage: string;
  count: number;
  total_ev: number;
  weighted_ev: number;
}

export interface SectorSummary {
  sector: string;
  count: number;
  total_ev: number;
}

export interface FinancialOverview {
  total_pipeline_ev: number;
  active_deals_count: number;
  avg_ebitda_multiple: number;
  closed_deal_volume_ytd: number;
  portfolio_cash_balance: number;
  monthly_burn_rate: number;
  weighted_runway_months: number;
  stage_breakdown: StageSummary[];
  sector_breakdown: SectorSummary[];
}

export interface RunwayMonth {
  month: string;
  cash_balance: number;
  gross_burn: number;
  revenue: number;
  net_burn: number;
  runway_alert: string;
}

export interface CashRunwayResponse {
  current_cash: number;
  monthly_net_burn: number;
  runway_months: number;
  zero_cash_date: string;
  stress_test_runway: number;
  projections: RunwayMonth[];
}

export interface CashFlowProjection {
  year: number;
  revenue: number;
  ebitda: number;
  fcf: number;
  discount_factor: number;
  pv_fcf: number;
}

export interface SensitivityCell {
  wacc: number;
  exit_multiple: number;
  implied_ev: number;
  implied_equity_val: number;
}

export interface DCFRequest {
  revenue_base: number;
  growth_rate_pct: number;
  ebitda_margin_pct: number;
  discount_rate_wacc: number;
  terminal_growth_pct: number;
  exit_multiple: number;
  tax_rate_pct?: number;
  capex_pct?: number;
  nwc_pct?: number;
  net_debt?: number;
}

export interface DCFResponse {
  implied_enterprise_value: number;
  implied_equity_value: number;
  pv_cash_flows: number;
  terminal_value: number;
  pv_terminal_value: number;
  projected_cash_flows: CashFlowProjection[];
  sensitivity_matrix: SensitivityCell[];
}

export interface EBITDAAdjustment {
  id: string;
  deal_id?: string | null;
  name: string;
  category: string;
  amount: number;
  adjustment_type: "add_back" | "deduction";
  notes?: string;
  created_at: string;
}

export interface EBITDAAdjustmentCreate {
  deal_id?: string | null;
  name: string;
  category: string;
  amount: number;
  adjustment_type: "add_back" | "deduction";
  notes?: string;
}
