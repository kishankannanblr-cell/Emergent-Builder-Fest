import React from "react";
import { 
  Layers, 
  Clock, 
  Trophy, 
  TrendingUp, 
  ArrowUpRight 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FinancialOverview } from "@/lib/types";

interface KPICardsProps {
  overview?: FinancialOverview | null;
  isLoading?: boolean;
}

export const KPICards: React.FC<KPICardsProps> = ({ overview }) => {
  const totalEv = overview?.total_pipeline_ev ?? 373.0;
  const activeCount = overview?.active_deals_count ?? 8;
  const avgMultiple = overview?.avg_ebitda_multiple ?? 11.2;
  const closedVolume = overview?.closed_deal_volume_ytd ?? 52.0;
  const cashBalance = overview?.portfolio_cash_balance ?? 34.5;
  const monthlyBurn = overview?.monthly_burn_rate ?? 1.35;
  const runwayMonths = overview?.weighted_runway_months ?? 25.5;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Active Pipeline Value */}
      <Card 
        data-testid="kpi-card-pipeline-value"
        className="relative overflow-hidden bg-card/60 backdrop-blur-sm border-border/80 hover:border-emerald-500/40 transition-all duration-200 group hover:shadow-lg hover:shadow-emerald-500/5"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Pipeline Value
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
              ${totalEv.toFixed(1)}M
            </span>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[11px] font-medium">
              <ArrowUpRight className="w-3 h-3 mr-0.5 inline" />
              +18.4% YoY
            </Badge>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground border-t border-border/40 pt-2.5">
            <span>{activeCount} active opportunities</span>
            <span className="text-emerald-400/90 font-mono font-medium">
              ${(totalEv * 0.58).toFixed(1)}M Weighted
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 2. EV / EBITDA Multiple */}
      <Card 
        data-testid="kpi-card-ev-multiple"
        className="relative overflow-hidden bg-card/60 backdrop-blur-sm border-border/80 hover:border-cyan-500/40 transition-all duration-200 group hover:shadow-lg hover:shadow-cyan-500/5"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Avg EV / EBITDA Multiple
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
              {avgMultiple.toFixed(1)}x
            </span>
            <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-[11px] font-medium">
              Target: 10-14x
            </Badge>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground border-t border-border/40 pt-2.5">
            <span>Range: 8.5x – 13.6x</span>
            <span className="text-cyan-400/90 font-mono font-medium">-0.8x vs Index</span>
          </div>
        </CardContent>
      </Card>

      {/* 3. Portfolio Cash Runway */}
      <Card 
        data-testid="kpi-card-cash-runway"
        className="relative overflow-hidden bg-card/60 backdrop-blur-sm border-border/80 hover:border-amber-500/40 transition-all duration-200 group hover:shadow-lg hover:shadow-amber-500/5"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Portfolio Cash Runway
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
              {runwayMonths.toFixed(1)} <span className="text-base font-normal text-muted-foreground">Mos</span>
            </span>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[11px] font-medium">
              Healthy
            </Badge>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground border-t border-border/40 pt-2.5">
            <span>${cashBalance.toFixed(1)}M Reserves</span>
            <span className="text-amber-400/90 font-mono font-medium">
              -${monthlyBurn.toFixed(2)}M /mo Net
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 4. Closed Deal Volume YTD */}
      <Card 
        data-testid="kpi-card-closed-volume"
        className="relative overflow-hidden bg-card/60 backdrop-blur-sm border-border/80 hover:border-purple-500/40 transition-all duration-200 group hover:shadow-lg hover:shadow-purple-500/5"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              YTD Closed Volume
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Trophy className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
              ${closedVolume.toFixed(1)}M
            </span>
            <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-[11px] font-medium">
              1 Completed
            </Badge>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground border-t border-border/40 pt-2.5">
            <span>Target: $120M Fund</span>
            <span className="text-purple-400/90 font-mono font-medium">43.3% Deployed</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
