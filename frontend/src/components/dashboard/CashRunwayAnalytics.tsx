import React, { useState, useEffect } from "react";
import { 
  Clock, 
  TrendingDown, 
  ShieldAlert, 
  Flame, 
  ArrowUpCircle 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from "recharts";
import type { CashRunwayResponse, RunwayMonth } from "@/lib/types";
import { apiGet } from "@/lib/api";

interface CashRunwayAnalyticsProps {
  initialRunway?: CashRunwayResponse | null;
}

export const CashRunwayAnalytics: React.FC<CashRunwayAnalyticsProps> = ({ initialRunway }) => {
  const [data, setData] = useState<CashRunwayResponse | null>(initialRunway || null);
  const [scenario, setScenario] = useState<"base" | "aggressive" | "lean" | "stress">("base");

  useEffect(() => {
    const fetchRunway = async () => {
      try {
        const res = await apiGet<CashRunwayResponse>("/financials/runway");
        setData(res);
      } catch {
        // Fallback default
        if (!data) {
          const months = ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9", "M10", "M11", "M12"];
          let cash = 34.5;
          const projections: RunwayMonth[] = months.map((m, i) => {
            const gross = 2.1 + (i * 0.03);
            const rev = 0.75 + (i * 0.05);
            const net = gross - rev;
            cash = Math.max(0, cash - net);
            return {
              month: m,
              cash_balance: Number(cash.toFixed(2)),
              gross_burn: Number(gross.toFixed(2)),
              revenue: Number(rev.toFixed(2)),
              net_burn: Number(net.toFixed(2)),
              runway_alert: cash < 10 ? "Warning (< 8m)" : cash < 18 ? "Moderate (12-18m)" : "Healthy (> 18m)"
            };
          });
          setData({
            current_cash: 34.5,
            monthly_net_burn: 1.35,
            runway_months: 25.5,
            zero_cash_date: "Q3 2027",
            stress_test_runway: 19.6,
            projections
          });
        }
      }
    };
    fetchRunway();
  }, []);

  const baseCash = data?.current_cash ?? 34.5;
  const baseBurn = data?.monthly_net_burn ?? 1.35;

  // Compute scenario multipliers
  const scenarioMultiplier = {
    base: { burn: 1.0, label: "Base Case Plan", badge: "Standard" },
    aggressive: { burn: 1.3, label: "Aggressive Expansion (+30% Burn)", badge: "Growth Mode" },
    lean: { burn: 0.8, label: "Lean Capital Preservation (-20% Burn)", badge: "Defensive" },
    stress: { burn: 1.6, label: "Severe Downside / Zero Rev Shock", badge: "Stress Test" }
  }[scenario];

  const activeNetBurn = Number((baseBurn * scenarioMultiplier.burn).toFixed(2));
  const activeRunway = Number((baseCash / activeNetBurn).toFixed(1));

  // Dynamically recalculate 12-month projections based on selected scenario
  const displayedProjections = (data?.projections || []).map((p, idx) => {
    const adjGross = Number((p.gross_burn * (scenario === "stress" ? 1.2 : scenarioMultiplier.burn)).toFixed(2));
    const adjRev = Number((p.revenue * (scenario === "stress" ? 0.3 : 1.0)).toFixed(2));
    const adjNet = Number((adjGross - adjRev).toFixed(2));
    
    // Recalculate rolling cash
    let prevCash = baseCash;
    for (let j = 0; j <= idx; j++) {
      const g = (data?.projections[j]?.gross_burn || 2.1) * (scenario === "stress" ? 1.2 : scenarioMultiplier.burn);
      const r = (data?.projections[j]?.revenue || 0.75) * (scenario === "stress" ? 0.3 : 1.0);
      prevCash = Math.max(0, prevCash - (g - r));
    }

    return {
      ...p,
      gross_burn: adjGross,
      revenue: adjRev,
      net_burn: adjNet,
      cash_balance: Number(prevCash.toFixed(2)),
      runway_alert: prevCash < 12 ? "Warning (< 8m)" : prevCash < 20 ? "Moderate" : "Healthy"
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Scenario Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/20 border border-border/80 p-4 rounded-xl">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            Cash Runway & Burn Rate Analytics
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor liquidity horizons, gross vs net burn curves, and test capital runway under operating scenarios
          </p>
        </div>

        {/* Scenario Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <Button
            data-testid="runway-scenario-base"
            variant={scenario === "base" ? "default" : "outline"}
            size="xs"
            onClick={() => setScenario("base")}
            className={`text-xs ${scenario === "base" ? "bg-emerald-500 text-slate-950 font-bold" : ""}`}
          >
            Base Case
          </Button>
          <Button
            data-testid="runway-scenario-aggressive"
            variant={scenario === "aggressive" ? "default" : "outline"}
            size="xs"
            onClick={() => setScenario("aggressive")}
            className={`text-xs ${scenario === "aggressive" ? "bg-amber-500 text-slate-950 font-bold" : ""}`}
          >
            +30% Burn
          </Button>
          <Button
            data-testid="runway-scenario-lean"
            variant={scenario === "lean" ? "default" : "outline"}
            size="xs"
            onClick={() => setScenario("lean")}
            className={`text-xs ${scenario === "lean" ? "bg-cyan-500 text-slate-950 font-bold" : ""}`}
          >
            -20% Lean
          </Button>
          <Button
            data-testid="runway-scenario-stress"
            variant={scenario === "stress" ? "default" : "outline"}
            size="xs"
            onClick={() => setScenario("stress")}
            className={`text-xs ${scenario === "stress" ? "bg-rose-500 text-white font-bold" : ""}`}
          >
            Stress Test
          </Button>
        </div>
      </div>

      {/* KPI Cards for Runway */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/60 border-border/80 p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Current Reserves</span>
            <ArrowUpCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold font-heading text-foreground">
            ${baseCash.toFixed(1)}M
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Available Dry Powder</p>
        </Card>

        <Card className="bg-card/60 border-border/80 p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Net Monthly Burn</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold font-heading text-foreground font-mono">
            ${activeNetBurn.toFixed(2)}M
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">{scenarioMultiplier.label}</p>
        </Card>

        <Card className="bg-card/60 border-border/80 p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Calculated Runway</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div 
            data-testid="runway-months-display"
            className="mt-2 text-2xl font-extrabold font-heading text-amber-400 font-mono"
          >
            {activeRunway} <span className="text-sm font-normal text-muted-foreground">Months</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              {activeRunway > 18 ? "Safe Buffer" : activeRunway > 12 ? "Moderate" : "Critical"}
            </Badge>
          </div>
        </Card>

        <Card className="bg-card/60 border-border/80 p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Zero-Cash Horizon</span>
            <ShieldAlert className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold font-heading text-foreground">
            {scenario === "stress" ? "Q4 2026" : "Q3 2027"}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Target Next Capital Call</p>
        </Card>
      </div>

      {/* Visual Charts: Cash Trajectory & Burn Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cash Balance Area Chart */}
        <Card className="lg:col-span-7 border-border/80 bg-card/60 p-4">
          <div className="flex items-center justify-between pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              12-Month Projected Cash Balance ($M)
            </h3>
            <Badge variant="secondary" className="text-[10px] font-mono">
              {scenarioMultiplier.badge}
            </Badge>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayedProjections} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
                <XAxis dataKey="month" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(val: any) => [`$${val}M`, "Cash Balance"]}
                />
                <Area type="monotone" dataKey="cash_balance" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#cashGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Gross Burn vs Revenue Bar Chart */}
        <Card className="lg:col-span-5 border-border/80 bg-card/60 p-4">
          <div className="flex items-center justify-between pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Monthly Burn vs Revenue Inflows ($M)
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayedProjections.slice(0, 6)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
                <XAxis dataKey="month" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(val: any) => [`$${val}M`, ""]}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }} />
                <Bar dataKey="gross_burn" name="Gross Burn" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="revenue" name="Inflows" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Projection Table */}
      <Card className="border-border/80 bg-card/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Monthly Liquidity Schedule Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 border-y border-border/60 text-muted-foreground font-semibold">
              <tr>
                <th className="p-3">Period</th>
                <th className="p-3 font-mono">Gross Burn</th>
                <th className="p-3 font-mono">Revenue / Inflows</th>
                <th className="p-3 font-mono">Net Burn</th>
                <th className="p-3 font-mono">End Cash Balance</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {displayedProjections.map((row) => (
                <tr key={row.month} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3 font-semibold text-foreground">{row.month}</td>
                  <td className="p-3 font-mono text-rose-400">-${row.gross_burn.toFixed(2)}M</td>
                  <td className="p-3 font-mono text-emerald-400">+${row.revenue.toFixed(2)}M</td>
                  <td className="p-3 font-mono font-bold text-foreground">-${row.net_burn.toFixed(2)}M</td>
                  <td className="p-3 font-mono font-extrabold text-foreground">${row.cash_balance.toFixed(2)}M</td>
                  <td className="p-3">
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        row.cash_balance > 18
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : row.cash_balance > 10
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      }`}
                    >
                      {row.runway_alert}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
