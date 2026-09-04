# DealCFO - Living Product Specification

## Overview
DealCFO is an institutional-grade M&A Deal & Financial Intelligence Single Page Application for private equity, corporate development, and CFOs. It provides real-time deal pipeline tracking across canonical M&A stages, interactive 5-year Discounted Cash Flow (DCF) & exit multiple valuation models, cash runway & burn rate scenario analytics, and Quality of Earnings (QoE) EBITDA adjustments schedules.

## Key Architecture & Stacks
- **Frontend**: React 19, Vite, TypeScript Strict, Tailwind CSS v4, Lucide React, Recharts, @fontsource (Plus Jakarta Sans, Inter, JetBrains Mono), shadcn/ui.
- **Backend**: FastAPI, Pydantic v2, motor (Async MongoDB), Python 3.11.
- **Routing & Proxy**: All backend endpoints mounted under `/api` (`/api/deals`, `/api/financials/*`). Vite proxies `/api` to port 8001.

## Core Modules & Key Flows
1. **Executive Overview**: High-level portfolio KPIs (Active Pipeline Value, Weighted EV/EBITDA Multiple, Portfolio Cash Runway, YTD Closed Deals), Sector allocation chart, Stage breakdown bar chart, and top diligence deals.
2. **Deal Pipeline Tracker**: 10-stage M&A Kanban flow (Lead Sourcing -> Closed Won / Passed) with drag/advance buttons, stage value summaries, probability bars, and direct link to DCF simulator.
3. **Valuation & DCF Estimator**: Interactive 5-year DCF forecasting engine with adjustable Revenue Base, CAGR %, EBITDA Margin %, WACC / Discount %, Terminal Growth %, and Exit Multiples. Includes dynamic 5x5 WACC vs Exit Multiple sensitivity matrix and bar chart.
4. **Cash Runway & Burn Rate Analytics**: 12-month rolling cash balance and net burn trajectory with interactive operating scenario toggles (Base Case, +30% Burn, -20% Lean, Downside Stress Test).
5. **Quality of Earnings (QoE) EBITDA Adjustments**: Schedule for tracking add-backs (owner comp normalization, carve-out legal, IT cloud migration) and deductions with live Adjusted EBITDA and EV delta calculation.
6. **All Deals Datatable**: Multi-column sorting, filtering by sector and stage, search, inline stage updater, CSV export, and New Opportunity Intake dialog.
7. **Theme Switcher**: Dark slate executive theme with emerald accents by default, with instant toggle to light mode.

## Data Models
- `Deal`: id, name, target_company, sector, deal_type, stage, enterprise_value, revenue, ebitda, ebitda_multiple, lead_partner, probability_pct, cash_required, target_close_date, notes, created_at, updated_at
- `FinancialOverview`: total_pipeline_ev, active_deals_count, avg_ebitda_multiple, closed_deal_volume_ytd, portfolio_cash_balance, monthly_burn_rate, weighted_runway_months, stage_breakdown, sector_breakdown
- `CashRunwayResponse`: current_cash, monthly_net_burn, runway_months, zero_cash_date, stress_test_runway, projections
- `DCFRequest` & `DCFResponse`: 5-year FCF projection, terminal value, implied EV & equity value, 5x5 sensitivity matrix
- `EBITDAAdjustment`: id, deal_id, name, category, amount, adjustment_type (add_back | deduction), notes, created_at
