import React from "react";
import { 
  Building, 
  ChevronRight, 
  Calculator, 
  Layers,
  Sparkles,
  PieChart as PieChartIcon
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
  PieChart, 
  Pie, 
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
}

const SECTOR_COLORS = ["#10b981", "#06b6d4", "#f59e0b", "#8b5cf6", "#ec4899", "#3b82f6", "#14b8a6", "#f43f5e"];

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  overview,
  deals,
  onSelectDeal,
  onOpenDCF,
  onNavigateTab,
}) => {
  const topDeals = deals
    .filter((d) => d.stage !== "Passed" && d.stage !== "Closed Won")
    .sort((a, b) => b.enterprise_value - a.enterprise_value)
    .slice(0, 4);

  // Sector breakdown data for Pie Chart
  const sectorData = (overview?.sector_breakdown || [
    { sector: "SaaS / Cybersecurity", total_ev: 48.5, count: 1 },
    { sector: "FinTech / Payments", total_ev: 85.0, count: 1 },
    { sector: "HealthTech", total_ev: 46.5, count: 2 },
    { sector: "SaaS / Cloud", total_ev: 115.0, count: 1 },
    { sector: "Industrial IoT", total_ev: 64.0, count: 1 },
    { sector: "CleanTech / Energy", total_ev: 28.5, count: 1 },
  ]).map((s, idx) => ({
    id: `${s.sector}-${idx}`,
    name: s.sector,
    value: s.total_ev,
    count: s.count,
  }));

  // Stage funnel data
  const stageData = (overview?.stage_breakdown || []).slice(0, 7).map((st) => ({
    stage: st.stage.replace(" / ", "/").replace("Submitted", "Sub"),
    ev: st.total_ev,
    weighted: st.weighted_ev,
  }));

  return (
    <div className="space-y-6">
      {/* Top Welcome / Action Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-emerald-950/40 border border-border/80 p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Institutional Portfolio & Valuation Cockpit</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
              Welcome to DealCFO Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Real-time M&A pipeline tracking, dynamic discounted cash flow & EBITDA multiples modeling, liquidity runway stress tests, and QoE EBITDA bridge schedules.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              data-testid="hero-launch-dcf-btn"
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab("valuation")}
              className="text-xs gap-1.5 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Valuation Model</span>
            </Button>
            <Button
              data-testid="hero-view-pipeline-btn"
              size="sm"
              onClick={() => onNavigateTab("pipeline")}
              className="text-xs gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Deal Pipeline</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Visual Analytics: Stage Funnel & Sector Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stage Value Breakdown */}
        <Card className="lg:col-span-7 border-border/80 bg-card/60 p-4">
          <div className="flex items-center justify-between pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                Pipeline Value by Stage ($M Total vs Weighted)
              </h3>
            </div>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onNavigateTab("pipeline")}
              className="text-xs text-emerald-400 hover:text-emerald-300 gap-1"
            >
              <span>Full Pipeline</span>
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
                <XAxis dataKey="stage" stroke="#71717a" fontSize={10} angle={-25} textAnchor="end" interval={0} />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(val: any) => [`$${val}M`, ""]}
                />
                <Bar dataKey="ev" name="Total EV ($M)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="weighted" name="Weighted EV ($M)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Sector Allocation Pie Chart */}
        <Card className="lg:col-span-5 border-border/80 bg-card/60 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <PieChartIcon className="w-4 h-4 text-cyan-400" />
              Sector Exposure Breakdown
            </h3>
            <Badge variant="secondary" className="text-[10px] font-mono">
              {sectorData.length} Sectors
            </Badge>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {sectorData.map((s, index) => (
                    <Cell key={`cell-${s.id}`} fill={SECTOR_COLORS[index % SECTOR_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(val: any) => [`$${val}M EV`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-border/40">
            {sectorData.slice(0, 4).map((s, idx) => (
              <div key={s.id} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: SECTOR_COLORS[idx % SECTOR_COLORS.length] }} />
                <span className="text-muted-foreground truncate">{s.name.split("/")[0].trim()}:</span>
                <span className="font-mono font-bold text-foreground">${s.value.toFixed(1)}M</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Priority Deals Quick Action Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Top Priority Opportunities Under Active Diligence
          </h3>
          <Button
            data-testid="overview-view-all-deals-btn"
            variant="ghost"
            size="xs"
            onClick={() => onNavigateTab("deals")}
            className="text-xs text-emerald-400 hover:text-emerald-300 gap-1"
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
              className="bg-card/60 border-border/80 hover:border-emerald-500/40 hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => onSelectDeal(deal)}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                    {deal.stage}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-foreground">
                    ${deal.enterprise_value.toFixed(1)}M
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-foreground group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {deal.name}
                  </h4>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                    <Building className="w-3 h-3 flex-shrink-0" />
                    {deal.target_company}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-1.5 bg-muted/40 p-2 rounded text-[11px] font-mono">
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-sans">EV/EBITDA</span>
                    <span className="font-bold text-emerald-400">{deal.ebitda_multiple > 0 ? `${deal.ebitda_multiple.toFixed(1)}x` : "--"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-sans">Probability</span>
                    <span className="font-bold text-foreground">{deal.probability_pct}%</span>
                  </div>
                </div>

                <div 
                  className="flex items-center justify-between pt-1 border-t border-border/40"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">
                    {deal.lead_partner}
                  </span>
                  <Button
                    data-testid={`overview-btn-dcf-${deal.id}`}
                    variant="outline"
                    size="xs"
                    onClick={() => onOpenDCF(deal)}
                    className="h-6 text-[10px] px-2 gap-1 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>DCF Model</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
