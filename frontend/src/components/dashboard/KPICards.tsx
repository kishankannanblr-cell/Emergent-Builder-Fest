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
        className="relative overflow-hidden bg-[#121520] border-white/[0.08] hover:border-orange-500/40 transition-all duration-200 group hover:shadow-xl hover:shadow-orange-500/10"
      >
        <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Pipeline Value
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-white">
              ${totalEv.toFixed(1)}M
            </span>
            <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30 text-[11px] font-medium">
              <ArrowUpRight className="w-3 h-3 mr-0.5 inline" />
              +18.4% YoY
            </Badge>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-white/[0.06] pt-2.5">
            <span>{activeCount} active opportunities</span>
            <span className="text-orange-400/90 font-mono font-medium">
              ${(totalEv * 0.58).toFixed(1)}M Weighted
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 2. EV / EBITDA Multiple */}
      <Card 
        data-testid="kpi-card-ev-multiple"
        className="relative overflow-hidden bg-[#121520] border-white/[0.08] hover:border-amber-500/40 transition-all duration-200 group hover:shadow-xl hover:shadow-amber-500/10"
      >
        <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Avg EV / EBITDA Multiple
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-white">
              {avgMultiple.toFixed(1)}x
            </span>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[11px] font-medium">
              Target: 10-14x
            </Badge>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-white/[0.06] pt-2.5">
            <span>Range: 8.5x – 13.6x</span>
            <span className="text-amber-400/90 font-mono font-medium">-0.8x vs Index</span>
          </div>
        </CardContent>
      </Card>

      {/* 3. Portfolio Cash Runway */}
      <Card 
        data-testid="kpi-card-cash-runway"
        className="relative overflow-hidden bg-[#121520] border-white/[0.08] hover:border-emerald-500/40 transition-all duration-200 group hover:shadow-xl hover:shadow-emerald-500/10"
      >
        <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Portfolio Cash Runway
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-white">
              {runwayMonths.toFixed(1)} <span className="text-base font-normal text-slate-400">Mos</span>
            </span>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[11px] font-medium">
              Healthy
            </Badge>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-white/[0.06] pt-2.5">
            <span>${cashBalance.toFixed(1)}M Reserves</span>
            <span className="text-emerald-400/90 font-mono font-medium">
              -${monthlyBurn.toFixed(2)}M /mo Net
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 4. YTD Closed Deal Volume */}
      <Card 
        data-testid="kpi-card-closed-volume"
        className="relative overflow-hidden bg-[#121520] border-white/[0.08] hover:border-purple-500/40 transition-all duration-200 group hover:shadow-xl hover:shadow-purple-500/10"
      >
        <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              YTD Closed Volume
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Trophy className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-white">
              ${closedVolume.toFixed(1)}M
            </span>
            <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-[11px] font-medium">
              1 Completed
            </Badge>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-white/[0.06] pt-2.5">
            <span>Target: $120M Fund</span>
            <span className="text-purple-400/90 font-mono font-medium">
              {((closedVolume / 120) * 100).toFixed(1)}% Deployed
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
