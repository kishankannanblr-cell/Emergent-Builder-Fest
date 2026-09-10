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

export interface ValuationComps {
  name: string;
  sector: string;
  ev_revenue: number;
  ev_ebitda: number;
  deal_type: string;
  notes: string;
}

export interface QoEAddBack {
  name: string;
  category: string;
  amount_range: string;
  rationale: string;
}

export interface AICalibrationRequest {
  sector: string;
  revenue: number;
  ebitda: number;
  enterprise_value?: number;
  target_name?: string;
}

export interface AICalibrationResponse {
  sector: string;
  target_name: string;
  recommended_wacc: number;
  wacc_rationale: string;
  recommended_exit_multiple: number;
  multiple_rationale: string;
  recommended_cagr_pct: number;
  cagr_rationale: string;
  recommended_ebitda_margin_pct: number;
  margin_rationale: string;
  market_risk_profile: string;
  comps_summary: string;
  top_comps: ValuationComps[];
  suggested_qoe_add_backs: QoEAddBack[];
  source_benchmarks: string;
  ai_powered: boolean;
}

export interface MrWonderfulCritiqueRequest {
  target_name: string;
  revenue: number;
  ebitda: number;
  investment_amount: number;
  royalty_pct: number;
  payback_cap_mult: number;
  residual_equity_pct: number;
  payback_months: number;
  investor_irr_pct: number;
}

export interface MrWonderfulCritiqueResponse {
  verdict_title: string;
  shark_quote: string;
  verdict_sentiment: "deal" | "caution" | "dead_to_me";
  deal_analysis: string;
  founder_takeaway: string;
  suggested_counter_offer: string;
  ai_powered: boolean;
}

