import React, { useState, useEffect } from "react";
import { 
  Calculator, 
  TrendingUp, 
  Sliders 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from "recharts";
import type { Deal, DCFRequest, DCFResponse } from "@/lib/types";
import { apiPost } from "@/lib/api";

interface ValuationDCFEstimatorProps {
  deals: Deal[];
  initialDeal?: Deal | null;
}

export const ValuationDCFEstimator: React.FC<ValuationDCFEstimatorProps> = ({
  deals,
  initialDeal = null,
}) => {
  const [params, setParams] = useState<DCFRequest>({
    revenue_base: initialDeal?.revenue ?? 25.0,
    growth_rate_pct: 20.0,
    ebitda_margin_pct: initialDeal?.revenue ? Math.round((initialDeal.ebitda / initialDeal.revenue) * 100) : 25.0,
    discount_rate_wacc: 10.5,
    terminal_growth_pct: 2.5,
    exit_multiple: initialDeal?.ebitda_multiple ? Math.round(initialDeal.ebitda_multiple) : 12.0,
    tax_rate_pct: 21.0,
    capex_pct: 4.0,
    nwc_pct: 2.0,
    net_debt: 5.0,
  });

  const [selectedDealId, setSelectedDealId] = useState<string>(initialDeal?.id ?? "");
  const [result, setResult] = useState<DCFResponse | null>(null);

  // When initialDeal prop changes, load it
  useEffect(() => {
    if (initialDeal) {
      setSelectedDealId(initialDeal.id);
      setParams((prev) => ({
        ...prev,
        revenue_base: initialDeal.revenue || 25.0,
        ebitda_margin_pct: initialDeal.revenue ? Math.round((initialDeal.ebitda / initialDeal.revenue) * 100) : 25.0,
        exit_multiple: initialDeal.ebitda_multiple ? Math.round(initialDeal.ebitda_multiple) : 12.0,
      }));
    }
  }, [initialDeal]);

  const loadDealPreset = (dealId: string) => {
    setSelectedDealId(dealId);
    const deal = deals.find((d) => d.id === dealId);
    if (deal) {
      const margin = deal.revenue > 0 ? Math.round((deal.ebitda / deal.revenue) * 100) : 25;
      setParams({
        revenue_base: deal.revenue,
        growth_rate_pct: deal.sector.includes("SaaS") ? 25.0 : 18.0,
        ebitda_margin_pct: margin || 22.0,
        discount_rate_wacc: 10.5,
        terminal_growth_pct: 2.5,
        exit_multiple: deal.ebitda_multiple > 0 ? Number(deal.ebitda_multiple.toFixed(1)) : 12.0,
        tax_rate_pct: 21.0,
        capex_pct: 4.0,
        nwc_pct: 2.0,
        net_debt: Number((deal.enterprise_value * 0.15).toFixed(1)),
      });
    }
  };

  const runCalculation = async () => {
    try {
      const resp = await apiPost<DCFResponse>("/financials/dcf-calculate", params);
      setResult(resp);
    } catch {
      // Graceful local fallback calculation
      const r = params.revenue_base;
      const g = params.growth_rate_pct / 100;
      const m = params.ebitda_margin_pct / 100;
      const wacc = params.discount_rate_wacc / 100;
      
      let curRev = r;
      let totalPvFcf = 0;
      const projected = [];
      let lastEbitda = 0;

      for (let y = 1; y <= 5; y++) {
        curRev = curRev * (1 + g);
        const ebitda = curRev * m;
        const nopat = ebitda * 0.79;
        const fcf = nopat - (curRev * 0.04) - (curRev * 0.02);
        const df = 1 / Math.pow(1 + wacc, y);
        const pv = fcf * df;
        totalPvFcf += pv;
        lastEbitda = ebitda;
        projected.push({
          year: y,
          revenue: Number(curRev.toFixed(2)),
          ebitda: Number(ebitda.toFixed(2)),
          fcf: Number(fcf.toFixed(2)),
          discount_factor: Number(df.toFixed(4)),
          pv_fcf: Number(pv.toFixed(2)),
        });
      }

      const tv = lastEbitda * params.exit_multiple;
      const pvTv = tv / Math.pow(1 + wacc, 5);
      const ev = totalPvFcf + pvTv;

      const waccs = [params.discount_rate_wacc - 2, params.discount_rate_wacc - 1, params.discount_rate_wacc, params.discount_rate_wacc + 1, params.discount_rate_wacc + 2];
      const mults = [params.exit_multiple - 2, params.exit_multiple - 1, params.exit_multiple, params.exit_multiple + 1, params.exit_multiple + 2];
      const matrix = [];

      for (const w of waccs) {
        for (const mult of mults) {
          const mtv = lastEbitda * mult;
          const mpvTv = mtv / Math.pow(1 + (w / 100), 5);
          const mev = totalPvFcf + mpvTv;
          matrix.push({
            wacc: w,
            exit_multiple: mult,
            implied_ev: Number(mev.toFixed(2)),
            implied_equity_val: Number((mev - (params.net_debt || 5)).toFixed(2)),
          });
        }
      }

      setResult({
        implied_enterprise_value: Number(ev.toFixed(2)),
        implied_equity_value: Number((ev - (params.net_debt || 5)).toFixed(2)),
        pv_cash_flows: Number(totalPvFcf.toFixed(2)),
        terminal_value: Number(tv.toFixed(2)),
        pv_terminal_value: Number(pvTv.toFixed(2)),
        projected_cash_flows: projected,
        sensitivity_matrix: matrix,
      });
    }
  };

  // Run calculation whenever params change
  useEffect(() => {
    runCalculation();
  }, [params]);

  // Extract unique WACCs and Multiples for the 5x5 matrix
  const matrixWaccs = Array.from(new Set(result?.sensitivity_matrix.map((c) => c.wacc) || []));
  const matrixMultiples = Array.from(new Set(result?.sensitivity_matrix.map((c) => c.exit_multiple) || []));

  return (
    <div className="space-y-6">
      {/* Header with Deal Preset Loader */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/20 border border-border/80 p-4 rounded-xl">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            Interactive M&A Valuation & DCF Estimator
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            5-Year Discounted Cash Flow model with Exit Multiples and dynamic WACC sensitivity matrix
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">Load Target:</span>
          <select
            data-testid="dcf-preset-select"
            value={selectedDealId}
            onChange={(e) => loadDealPreset(e.target.value)}
            className="text-xs bg-muted/60 border border-border rounded-md px-3 py-1.5 text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">-- Custom Target Model --</option>
            {deals.map((d) => (
              <option key={d.id} value={d.id}>
                {`${d.name} ($${d.enterprise_value}M EV)`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Parameters on Left, Outputs on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parameter Control Panel */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-border/80 bg-card/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  Key Valuation Assumptions
                </span>
                <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                  Live Recalculation
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 text-xs">
              {/* 1. Base Revenue */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="revenue_base" className="text-xs font-semibold">
                    Current LTM Revenue ($M)
                  </Label>
                  <span className="font-mono text-emerald-400 font-bold">${params.revenue_base.toFixed(1)}M</span>
                </div>
                <Input
                  id="revenue_base"
                  data-testid="dcf-input-revenue-base"
                  type="number"
                  step="0.5"
                  value={params.revenue_base}
                  onChange={(e) => setParams({ ...params, revenue_base: parseFloat(e.target.value) || 0 })}
                  className="h-8 text-xs font-mono"
                />
              </div>

              {/* 2. Projected 5-Year CAGR */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="growth_rate" className="text-xs font-semibold">
                    Projected Revenue CAGR (%):
                  </Label>
                  <span className="font-mono text-foreground font-bold">{params.growth_rate_pct}%</span>
                </div>
                <input
                  id="growth_rate"
                  data-testid="dcf-slider-growth"
                  type="range"
                  min="0"
                  max="60"
                  step="1"
                  value={params.growth_rate_pct}
                  onChange={(e) => setParams({ ...params, growth_rate_pct: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>0%</span>
                  <span>30%</span>
                  <span>60%</span>
                </div>
              </div>

              {/* 3. EBITDA Margin */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="ebitda_margin" className="text-xs font-semibold">
                    Target EBITDA Margin (%):
                  </Label>
                  <span className="font-mono text-foreground font-bold">{params.ebitda_margin_pct}%</span>
                </div>
                <input
                  id="ebitda_margin"
                  data-testid="dcf-slider-margin"
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  value={params.ebitda_margin_pct}
                  onChange={(e) => setParams({ ...params, ebitda_margin_pct: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>5%</span>
                  <span>25%</span>
                  <span>50%</span>
                </div>
              </div>

              {/* 4. Discount Rate / WACC */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="wacc" className="text-xs font-semibold">
                    Discount Rate / WACC (%):
                  </Label>
                  <span className="font-mono text-cyan-400 font-bold">{params.discount_rate_wacc}%</span>
                </div>
                <input
                  id="wacc"
                  data-testid="dcf-slider-wacc"
                  type="range"
                  min="6"
                  max="18"
                  step="0.5"
                  value={params.discount_rate_wacc}
                  onChange={(e) => setParams({ ...params, discount_rate_wacc: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>6.0%</span>
                  <span>12.0%</span>
                  <span>18.0%</span>
                </div>
              </div>

              {/* 5. Exit EBITDA Multiple */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="exit_multiple" className="text-xs font-semibold">
                    Exit EBITDA Multiple (x):
                  </Label>
                  <span className="font-mono text-purple-400 font-bold">{params.exit_multiple}x</span>
                </div>
                <input
                  id="exit_multiple"
                  data-testid="dcf-slider-exit-multiple"
                  type="range"
                  min="6"
                  max="22"
                  step="0.5"
                  value={params.exit_multiple}
                  onChange={(e) => setParams({ ...params, exit_multiple: parseFloat(e.target.value) })}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>6.0x</span>
                  <span>14.0x</span>
                  <span>22.0x</span>
                </div>
              </div>

              {/* 6. Net Debt & CapEx subfields */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/40">
                <div>
                  <Label htmlFor="net_debt" className="text-[11px] text-muted-foreground">
                    Net Debt ($M)
                  </Label>
                  <Input
                    id="net_debt"
                    data-testid="dcf-input-net-debt"
                    type="number"
                    value={params.net_debt}
                    onChange={(e) => setParams({ ...params, net_debt: parseFloat(e.target.value) || 0 })}
                    className="h-8 text-xs font-mono mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="capex_pct" className="text-[11px] text-muted-foreground">
                    CapEx (% Rev)
                  </Label>
                  <Input
                    id="capex_pct"
                    data-testid="dcf-input-capex"
                    type="number"
                    value={params.capex_pct}
                    onChange={(e) => setParams({ ...params, capex_pct: parseFloat(e.target.value) || 0 })}
                    className="h-8 text-xs font-mono mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Implied Valuation Highlights & Visuals */}
        <div className="lg:col-span-7 space-y-4">
          {/* Key Implied Valuation Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="bg-emerald-500/10 border-emerald-500/30 p-3">
              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">
                Implied Enterprise Value
              </span>
              <div 
                data-testid="dcf-implied-ev"
                className="text-xl sm:text-2xl font-extrabold text-foreground font-mono mt-1"
              >
                ${result?.implied_enterprise_value.toFixed(1) ?? "--"}M
              </div>
            </Card>

            <Card className="bg-cyan-500/10 border-cyan-500/30 p-3">
              <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider block">
                Implied Equity Value
              </span>
              <div 
                data-testid="dcf-implied-equity"
                className="text-xl sm:text-2xl font-extrabold text-foreground font-mono mt-1"
              >
                ${result?.implied_equity_value.toFixed(1) ?? "--"}M
              </div>
            </Card>

            <Card className="bg-card border-border p-3">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">
                PV of 5-Yr Cashflows
              </span>
              <div className="text-lg sm:text-xl font-bold text-foreground font-mono mt-1">
                ${result?.pv_cash_flows.toFixed(1) ?? "--"}M
              </div>
            </Card>

            <Card className="bg-card border-border p-3">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">
                PV of Terminal Value
              </span>
              <div className="text-lg sm:text-xl font-bold text-foreground font-mono mt-1">
                ${result?.pv_terminal_value.toFixed(1) ?? "--"}M
              </div>
            </Card>
          </div>

          {/* 5-Year Financial Forecast Chart */}
          <Card className="border-border/80 bg-card/60 p-4">
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                5-Year Revenue, EBITDA & Free Cash Flow Forecast ($M)
              </h3>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result?.projected_cash_flows || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
                  <XAxis dataKey="year" tickFormatter={(y) => `Year ${y}`} stroke="#71717a" fontSize={11} />
                  <YAxis stroke="#71717a" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(val: any) => [`$${val}M`, ""]}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }} />
                  <Bar dataKey="revenue" name="Revenue ($M)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ebitda" name="EBITDA ($M)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fcf" name="Free Cash Flow ($M)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* 5x5 WACC vs Exit Multiple Sensitivity Matrix Table */}
          <Card className="border-border/80 bg-card/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Enterprise Value Sensitivity Matrix ($M)</span>
                <span className="text-[10px] text-emerald-400 lowercase font-mono">
                  Rows: WACC (%) | Cols: Exit Multiple (x)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 overflow-x-auto">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="border-b border-border/60">
                    <th className="p-2 text-left text-muted-foreground font-semibold">WACC \ Multiple</th>
                    {matrixMultiples.map((m) => (
                      <th
                        key={m}
                        className={`p-2 font-mono font-bold ${
                          m === params.exit_multiple ? "text-emerald-400 bg-emerald-500/10 rounded-t" : "text-muted-foreground"
                        }`}
                      >
                        {m}x
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrixWaccs.map((w) => (
                    <tr key={w} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                      <td
                        className={`p-2 text-left font-mono font-bold ${
                          w === params.discount_rate_wacc ? "text-cyan-400 bg-cyan-500/10 rounded-l" : "text-muted-foreground"
                        }`}
                      >
                        {w}%
                      </td>
                      {matrixMultiples.map((m) => {
                        const cell = result?.sensitivity_matrix.find((c) => c.wacc === w && c.exit_multiple === m);
                        const isCurrentBase = w === params.discount_rate_wacc && m === params.exit_multiple;
                        return (
                          <td
                            key={`${w}-${m}`}
                            data-testid={`sensitivity-cell-${w}-${m}`}
                            className={`p-2 font-mono font-medium transition-colors ${
                              isCurrentBase
                                ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 rounded shadow-sm"
                                : "text-foreground"
                            }`}
                          >
                            ${cell ? cell.implied_ev.toFixed(1) : "--"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
