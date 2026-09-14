import React from "react";
import { 
  Building, 
  ChevronRight, 
  Calculator, 
  Layers,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowUpRight,
  UserCheck,
  Flame
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  CartesianGrid 
} from "recharts";
import type { Deal, FinancialOverview } from "@/lib/types";

interface ExecutiveOverviewProps {
  overview?: FinancialOverview | null;
  deals: Deal[];
  onSelectDeal: (deal: Deal) => void;
  onOpenDCF: (deal: Deal) => void;
  onNavigateTab: (tab: string) => void;
  onNewDealClick: () => void;
  onGenerateMemo?: (deal: Deal) => void;
  onLaunchSharkTank?: () => void;
  onOpenAICopilot?: (prompt?: string) => void;
  onOpenAboutModal?: () => void;
}

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  overview,
  deals,
  onSelectDeal,
  onOpenDCF,
  onNavigateTab,
  onGenerateMemo,
  onLaunchSharkTank,
  onOpenAICopilot,
  onOpenAboutModal,
}) => {
  const topDeals = deals
    .filter((d) => d.stage !== "Passed" && d.stage !== "Closed Won")
    .sort((a, b) => b.enterprise_value - a.enterprise_value)
    .slice(0, 4);

  const spotlightDeal = deals.find((d) => d.name.includes("Apex")) || topDeals[0] || deals[0];

  // Stage funnel data for Peak Bar Chart
  const stageData = (overview?.stage_breakdown || [
    { stage: "Initial Review", total_ev: 64.0, weighted_ev: 19.2 },
    { stage: "CIM Review", total_ev: 28.5, weighted_ev: 11.4 },
    { stage: "IOI Submitted", total_ev: 32.0, weighted_ev: 14.4 },
    { stage: "LOI / Exclusivity", total_ev: 85.0, weighted_ev: 55.25 },
    { stage: "Due Diligence", total_ev: 48.5, weighted_ev: 36.38 },
    { stage: "Definitive Docs", total_ev: 115.0, weighted_ev: 103.5 },
  ]).slice(0, 6).map((st) => ({
    stage: st.stage.replace(" / ", "/").replace("Submitted", "Sub"),
    ev: st.total_ev,
    weighted: st.weighted_ev,
  }));

  // Find peak stage EV for gradient highlight (Template 8 style)
  const maxStageEv = Math.max(...stageData.map((d) => d.ev), 1);

  // M&A Action Center priority gating actions
  const pendingActions = [
    {
      id: "act-1",
      dealName: "Apex Cloud Security",
      type: "Exclusivity Window Expiring",
      deadline: "In 12 Days (Aug 30)",
      actionLabel: "⚡ Run QoE Audit",
      actionType: "copilot_qoe",
      priority: "high",
      dealRef: deals.find((d) => d.name.includes("Apex")),
    },
    {
      id: "act-2",
      dealName: "NexaPay Embedded Core",
      type: "LOI Submitted - Legal Review",
      deadline: "Awaiting Seller Response",
      actionLabel: "📄 Review IC Memo",
      actionType: "open_memo",
      priority: "urgent",
      dealRef: deals.find((d) => d.name.includes("NexaPay")),
    },
    {
      id: "act-3",
      dealName: "BioStream AI Diagnostics",
      type: "Valuation Multiple Gap (13.3x)",
      deadline: "Due Diligence Gating",
      actionLabel: "🦈 Structure Royalty Deal",
      actionType: "copilot_shark",
      priority: "medium",
      dealRef: deals.find((d) => d.name.includes("BioStream")),
    },
  ];

  const totalEv = overview?.total_pipeline_ev ?? 373.0;
  const activeCount = overview?.active_deals_count ?? 8;
  const avgMultiple = overview?.avg_ebitda_multiple ?? 11.2;
  const cashBalance = overview?.portfolio_cash_balance ?? 34.5;
  const monthlyBurn = overview?.monthly_burn_rate ?? 1.35;
  const runwayMonths = overview?.weighted_runway_months ?? 25.5;

  return (
    <div className="space-y-6">
      {/* 1. Top Row: 3 Spacious Metric Cards matching Screenshot 2026-09-13 200703.png */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Active Pipeline Value */}
        <Card 
          data-testid="kpi-card-pipeline-value"
          className="relative overflow-hidden bg-[#111420] border-white/[0.08] hover:border-orange-500/40 transition-all duration-300 group hover:shadow-xl hover:shadow-orange-500/10 rounded-xl"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Pipeline Value
              </span>
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-2.5">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading text-white">
                ${totalEv.toFixed(1)}M
              </span>
              <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30 text-xs font-semibold px-2 py-0.5">
                <ArrowUpRight className="w-3 h-3 mr-0.5 inline" />
                +18.4% YoY
              </Badge>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-white/[0.06] pt-3">
              <span>{activeCount} active opportunities</span>
              <span className="text-orange-400/90 font-mono font-medium">
                ${(totalEv * 0.58).toFixed(1)}M Weighted
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Avg EV / EBITDA Multiple */}
        <Card 
          data-testid="kpi-card-ev-multiple"
          className="relative overflow-hidden bg-[#111420] border-white/[0.08] hover:border-amber-500/40 transition-all duration-300 group hover:shadow-xl hover:shadow-amber-500/10 rounded-xl"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Avg EV / EBITDA Multiple
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-2.5">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading text-white">
                {avgMultiple.toFixed(1)}x
              </span>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs font-semibold px-2 py-0.5">
                Target: 10-14x
              </Badge>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-white/[0.06] pt-3">
              <span>Range: 8.5x – 13.6x</span>
              <span className="text-amber-400/90 font-mono font-medium">-0.8x vs Index</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Portfolio Cash Runway */}
        <Card 
          data-testid="kpi-card-cash-runway"
          className="relative overflow-hidden bg-[#111420] border-white/[0.08] hover:border-emerald-500/40 transition-all duration-300 group hover:shadow-xl hover:shadow-emerald-500/10 rounded-xl"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Portfolio Cash Runway
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-2.5">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading text-white">
                {runwayMonths.toFixed(1)} <span className="text-base font-normal text-slate-400">Mos</span>
              </span>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs font-semibold px-2 py-0.5">
                Healthy
              </Badge>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-white/[0.06] pt-3">
              <span>${cashBalance.toFixed(1)}M Reserves</span>
              <span className="text-emerald-400/90 font-mono font-medium">
                -${monthlyBurn.toFixed(2)}M /mo Net
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Middle Row: 60% Glowing Peak Bar Chart + 40% Holographic Deal Spotlight Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 cols / ~60%): Stage Funnel with Peak Highlight Gradient */}
        <Card className="lg:col-span-7 border-white/[0.08] bg-[#111420] p-5 flex flex-col justify-between shadow-xl rounded-xl">
          <div className="flex items-center justify-between pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Pipeline Value by Stage ($M Total vs Weighted)
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Volume conversion across M&A stage gates</p>
            </div>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onNavigateTab("pipeline")}
              className="text-xs text-orange-400 hover:text-orange-300 gap-1 font-semibold"
            >
              <span>View Pipeline</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} margin={{ top: 15, right: 10, left: -20, bottom: 25 }}>
                <defs>
                  {/* Glowing peak vertical gradient from Template 8 */}
                  <linearGradient id="peakBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity={1} />
                    <stop offset="25%" stopColor="#ff9500" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#ff5722" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222636" opacity={0.6} />
                <XAxis dataKey="stage" stroke="#94a3b8" fontSize={10} angle={-20} textAnchor="end" interval={0} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#151826", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px", color: "#f8fafc" }}
                  formatter={(val: any) => [`$${val}M`, ""]}
                />
                <Bar dataKey="ev" name="Total EV ($M)" radius={[4, 4, 0, 0]}>
                  {stageData.map((entry, index) => {
                    const isPeak = entry.ev === maxStageEv;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={isPeak ? "url(#peakBarGradient)" : "#222738"}
                      />
                    );
                  })}
                </Bar>
                <Bar dataKey="weighted" name="Weighted EV ($M)" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* In-Chart AI Exploration Bar */}
          <div className="mt-3 p-3 rounded-lg bg-[#161a28] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-orange-400 shrink-0 animate-pulse" />
              <span className="font-semibold text-white">AI Pipeline Exploration:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onOpenAICopilot && onOpenAICopilot("Analyze IOI to Exclusivity conversion bottlenecks across our deals")}
                className="text-[11px] px-2.5 py-1 rounded-md bg-white/5 hover:bg-orange-500/20 text-orange-300 border border-orange-500/30 transition-all font-medium"
              >
                🔍 Analyze IOI Drop-off
              </button>
              <button
                onClick={() => onOpenAICopilot && onOpenAICopilot("Run downside liquidity simulation if closing slips by 60 days")}
                className="text-[11px] px-2.5 py-1 rounded-md bg-white/5 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all font-medium"
              >
                ⚡ 60-Day Slip Runway
              </button>
            </div>
          </div>
        </Card>

        {/* Right (5 cols / ~40%): Holographic Deal Spotlight Card */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          {spotlightDeal && (
            <Card 
              data-testid="spotlight-deal-card"
              className="relative overflow-hidden bg-white dark:bg-gradient-to-br dark:from-[#151928] dark:via-[#121522] dark:to-[#181122] border border-slate-200 dark:border-orange-500/30 p-5 shadow-sm dark:shadow-2xl rounded-xl flex-1 flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-orange-500/15 via-amber-500/5 to-transparent rounded-bl-full pointer-events-none" />
              
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/40 text-[10px] font-bold px-2 py-0.5">
                    ✨ DEAL SPOTLIGHT • {spotlightDeal.stage}
                  </Badge>
                  <span className="text-base font-mono font-extrabold text-slate-900 dark:text-white">
                    ${spotlightDeal.enterprise_value.toFixed(1)}M EV
                  </span>
                </div>

                <div>
                  <h4 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {spotlightDeal.name}
                  </h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    <span>{spotlightDeal.target_company}</span>
                    <span>•</span>
                    <span className="text-orange-400/90 font-medium">{spotlightDeal.sector}</span>
                  </p>
                </div>

                {/* Progress & Metrics */}
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Deal Probability</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{spotlightDeal.probability_pct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-emerald-400 h-1.5 rounded-full" 
                      style={{ width: `${spotlightDeal.probability_pct}%` }} 
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1.5 text-center font-mono text-xs">
                    <div className="bg-slate-100 dark:bg-white/5 rounded p-1.5">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-sans">EV/EBITDA</span>
                      <span className="font-bold text-orange-600 dark:text-orange-400">{spotlightDeal.ebitda_multiple}x</span>
                    </div>
                    <div className="bg-slate-100 dark:bg-white/5 rounded p-1.5">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-sans">Revenue</span>
                      <span className="font-bold text-slate-900 dark:text-white">${spotlightDeal.revenue}M</span>
                    </div>
                    <div className="bg-slate-100 dark:bg-white/5 rounded p-1.5">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-sans">Cash Req.</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">${spotlightDeal.cash_required}M</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                    <span>Lead: {spotlightDeal.lead_partner}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">Close: {spotlightDeal.target_close_date}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-3 border-t border-slate-200 dark:border-white/[0.08] flex items-center gap-2 relative z-10">
                <Button
                  data-testid="spotlight-dcf-btn"
                  size="sm"
                  onClick={() => onOpenDCF(spotlightDeal)}
                  className="flex-1 h-8 text-xs gap-1.5 amber-gradient-btn font-bold shadow-md shadow-orange-500/20"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Analyze in DCF</span>
                </Button>

                {onGenerateMemo && (
                  <Button
                    data-testid="spotlight-memo-btn"
                    variant="outline"
                    size="sm"
                    onClick={() => onGenerateMemo(spotlightDeal)}
                    className="h-8 text-xs gap-1 border-purple-500/30 text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-500/20 bg-purple-50/50 dark:bg-[#161a26]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                    <span>AI Memo</span>
                  </Button>
                )}

                <Button
                  data-testid="spotlight-view-details-btn"
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectDeal(spotlightDeal)}
                  className="h-8 text-xs border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  <span>Details</span>
                </Button>
              </div>
            </Card>
          )}

          {/* Quick Kevin O'Leary Deal Structurer Tile */}
          <div 
            onClick={onLaunchSharkTank}
            className="p-4 rounded-xl bg-purple-50/80 dark:bg-gradient-to-r dark:from-purple-950/60 dark:via-purple-900/30 dark:to-[#141824] border border-purple-200 dark:border-purple-500/30 hover:border-purple-400 cursor-pointer transition-all flex items-center justify-between group shadow-sm dark:shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-lg shrink-0">
                🦈
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                    Kevin O'Leary Royalty Structurer
                  </span>
                  <Badge className="bg-purple-500/20 text-purple-600 dark:text-purple-300 text-[9px] px-1 py-0 border-purple-500/30">
                    Shark Mode
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Model cash upfront + % royalty until 2x return</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-purple-500 dark:text-purple-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: M&A Executive Action Center Table */}
      <Card className="border-white/[0.08] bg-[#111420] p-5 shadow-xl rounded-xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-ping" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              M&A Executive Action Center
            </h3>
            <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-orange-500/30 text-orange-400 font-mono">
              3 Pending Gating Items
            </Badge>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">Priority actions requiring CFO / Partner sign-off</span>
        </div>

        <div className="divide-y divide-white/[0.06] mt-1">
          {pendingActions.map((item) => (
            <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-white/[0.02] px-2 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full ${item.priority === "urgent" ? "bg-rose-500 animate-pulse" : item.priority === "high" ? "bg-orange-500" : "bg-amber-400"}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white group-hover:text-orange-400 transition-colors">
                      {item.dealName}
                    </span>
                    <Badge variant="secondary" className="text-[10px] bg-white/5 border border-white/10 text-slate-300 font-mono">
                      {item.type}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Target Closing Gating Item • <span className="text-orange-400/90 font-medium">{item.deadline}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button
                  size="xs"
                  onClick={() => {
                    if (item.actionType === "open_memo" && item.dealRef && onGenerateMemo) {
                      onGenerateMemo(item.dealRef);
                    } else if (item.actionType === "copilot_shark" && onLaunchSharkTank) {
                      onLaunchSharkTank();
                    } else if (onOpenAICopilot) {
                      onOpenAICopilot(`Run Quality of Earnings (QoE) audit for ${item.dealName}`);
                    }
                  }}
                  className="h-7 text-xs px-3 amber-gradient-btn font-semibold shadow-sm transition-transform active:scale-95"
                >
                  {item.actionLabel}
                </Button>
                {item.dealRef && (
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => onSelectDeal(item.dealRef!)}
                    className="h-7 text-xs px-2.5 bg-[#161a26] border-white/10 text-slate-300 hover:text-white"
                  >
                    View Deal
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 4. Priority Deals Quick Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Deal Pipeline Quick Access
            </h3>
          </div>
          <Button
            data-testid="overview-view-all-deals-btn"
            variant="ghost"
            size="xs"
            onClick={() => onNavigateTab("deals")}
            className="text-xs text-orange-400 hover:text-orange-300 gap-1 font-semibold"
          >
            <span>View All {deals.length} Deals</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topDeals.map((deal) => (
            <Card
              key={deal.id}
              data-testid={`overview-top-deal-${deal.id}`}
              className="bg-[#111420] border-white/[0.08] hover:border-orange-500/40 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-200 cursor-pointer group rounded-xl"
              onClick={() => onSelectDeal(deal)}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className="text-[10px] bg-orange-500/10 text-orange-400 border-orange-500/30">
                    {deal.stage}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-white">
                    ${deal.enterprise_value.toFixed(1)}M
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1">
                    {deal.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                    <Building className="w-3 h-3 flex-shrink-0" />
                    {deal.target_company}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-1.5 bg-[#171b28] p-2 rounded text-[11px] font-mono border border-white/[0.04]">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">EV/EBITDA</span>
                    <span className="font-bold text-orange-400">{deal.ebitda_multiple > 0 ? `${deal.ebitda_multiple.toFixed(1)}x` : "--"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Probability</span>
                    <span className="font-bold text-white">{deal.probability_pct}%</span>
                  </div>
                </div>

                <div 
                  className="flex items-center justify-between pt-1 border-t border-white/[0.06] gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-[10px] text-slate-400 truncate max-w-[80px]">
                    {deal.lead_partner}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {onGenerateMemo && (
                      <Button
                        data-testid={`overview-btn-memo-${deal.id}`}
                        variant="outline"
                        size="xs"
                        onClick={() => onGenerateMemo(deal)}
                        className="h-6 text-[10px] px-2 gap-1 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 bg-[#161a26]"
                        title="AI Investment Memo (1-Pager)"
                      >
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <span>AI Memo</span>
                      </Button>
                    )}
                    <Button
                      data-testid={`overview-btn-dcf-${deal.id}`}
                      variant="outline"
                      size="xs"
                      onClick={() => onOpenDCF(deal)}
                      className="h-6 text-[10px] px-2 gap-1 border-orange-500/30 text-orange-400 hover:bg-orange-500/10 bg-[#161a26]"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>DCF</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
