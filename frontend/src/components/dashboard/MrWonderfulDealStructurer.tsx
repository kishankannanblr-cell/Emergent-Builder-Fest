import React, { useState, useMemo } from "react";
import { 
  Sparkles, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  Copy
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { Deal, MrWonderfulCritiqueResponse } from "@/lib/types";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";

export function evaluateKevinStructure(
  investmentAmount: number,
  royaltyPct: number,
  paybackCapMult: number,
  residualEquityPct: number,
  deal: Partial<Deal> & { name: string; revenue: number; ebitda: number; target_company?: string; enterprise_value?: number },
  calc: {
    monthsToPayback: number;
    paybackYears: string;
    irrPct: string;
    annualRoyaltyYear1: string;
    royaltyCoverageEbitda: string;
    founderDilutionSaved: string;
  }
): MrWonderfulCritiqueResponse {
  const irr = parseFloat(calc.irrPct) || 0;
  const months = calc.monthsToPayback;
  const ebitdaCoverage = parseFloat(calc.royaltyCoverageEbitda) || 0;
  const totalCapAmount = (investmentAmount * paybackCapMult).toFixed(1);

  // Scenario 1: EBITDA Choke Warning (Royalty takes > 45% of EBITDA)
  if (ebitdaCoverage > 45 && deal.ebitda > 0) {
    return {
      verdict_sentiment: "choke_warning",
      verdict_title: "Financial Suffocation: You're Strangling The Golden Goose!",
      shark_quote: `Hold on! You generate $${deal.ebitda}M in EBITDA, and this ${royaltyPct}% royalty takes $${calc.annualRoyaltyYear1}M (${ebitdaCoverage}% of your entire profit)! You'll choke this business of oxygen and go bankrupt before I get my cap. Lower the royalty rate or tie payments to gross profit!`,
      deal_analysis: `At ${royaltyPct}% top-line royalty, debt service eats ${ebitdaCoverage}% of EBITDA, leaving virtually no cash buffer for reinvestment or working capital shocks.`,
      founder_takeaway: `Lower royalty to ${Math.max(royaltyPct - 3, 2)}% or introduce a seasonal floor so debt doesn't cause operational insolvency.`,
      suggested_counter_offer: `$${investmentAmount}M upfront for ${Math.max(royaltyPct - 3, 2.5)}% royalty until ${paybackCapMult}x cap, plus ${Math.min(residualEquityPct + 2, 10)}% equity.`,
      ai_powered: false,
    };
  }

  // Scenario 2: Monster Return / High Yield (IRR >= 24% or (Cap >= 2.5x with IRR >= 20%))
  // Matches user's screenshot: 27.5% IRR with 3.0x Cap ($21.8M returned!)
  if (irr >= 24 || (paybackCapMult >= 2.5 && irr >= 20)) {
    const isVampire = paybackCapMult >= 2.5;
    return {
      verdict_sentiment: "deal",
      verdict_title: isVampire 
        ? "Now You're Speaking My Language: 3x Money Back & A Golden Royalty!"
        : "Shark Feeding Frenzy: An Extraordinary Return!",
      shark_quote: isVampire
        ? `You want $${investmentAmount}M and you're willing to pay me a ${paybackCapMult}x cap until I collect $${totalCapAmount}M back at a ${irr}% IRR? Mark Cuban will say I'm a vampire, and he's right! I don't want your board seat, and I don't want to attend your Zoom calls. I just want royalty checks rolling into my account. Shake my hand!`
        : `Money is binary: it either sleeps or it works. A ${irr}% IRR is better than any index fund on Wall Street. Plus with ${residualEquityPct}% equity, I ride your upside forever. That's why they call me Mr. Wonderful! We have a deal!`,
      deal_analysis: `High-yield structure: ${royaltyPct}% royalty on $${deal.revenue}M revenue generates $${calc.annualRoyaltyYear1}M in Year 1. Investor earns ${irr}% annualized IRR while the founder preserves +${calc.founderDilutionSaved}% equity vs institutional buyout.`,
      founder_takeaway: `Exceptional win-win: non-dilutive capital secured without surrendering majority governance or operational control.`,
      suggested_counter_offer: `Lock in terms: $${investmentAmount}M upfront for ${royaltyPct}% royalty until ${paybackCapMult}x ($${totalCapAmount}M total), then ${residualEquityPct}% perpetual equity.`,
      ai_powered: false,
    };
  }

  // Scenario 3: Clean Sweet-Spot Deal (Payback <= 44 mo and IRR >= 16%)
  if (months <= 44 && irr >= 16) {
    return {
      verdict_sentiment: "deal",
      verdict_title: "Royalty Checks Every Morning: It's A Deal!",
      shark_quote: `This is music to my ears. My $${investmentAmount}M comes back in ~${calc.paybackYears} years (${months} months), and then I ride ${residualEquityPct}% equity into the sunset. No boardroom politics, no equity squabbles. Clean, disciplined, beautiful. Let's write the check!`,
      deal_analysis: `Rapid capital velocity: capital is fully recouped in ${months} months. Low EBITDA impact (${ebitdaCoverage}%) ensures company cash runway remains intact.`,
      founder_takeaway: `Clean payback horizon avoids debt covenants while giving Mr. Wonderful his signature cashflow.`,
      suggested_counter_offer: `Proceed with $${investmentAmount}M upfront at ${royaltyPct}% royalty until ${paybackCapMult}x cap.`,
      ai_powered: false,
    };
  }

  // Scenario 4: Counter-Offer / Squeeze (Payback 44-72 mo with modest IRR 13-23%)
  if (months <= 72 && irr >= 13) {
    const needMoreEquity = residualEquityPct < 4;
    return {
      verdict_sentiment: "counter_offer",
      verdict_title: "I Like The Business, But My Money Is Walking Back With A Cane",
      shark_quote: needMoreEquity
        ? `Look, I like ${deal.target_company || deal.name}, but taking ${calc.paybackYears} years to get my capital returned is too slow for pure cash. If I'm waiting that long, I need dessert! Give me a ${Math.max(residualEquityPct + 3, 5)}% perpetual equity kicker and I'll fund the $${investmentAmount}M today. Deal or no deal?`
        : `I don't hate this, but ${calc.paybackYears} years is a long time in tech. Here's my counter-offer: bump the royalty to ${Math.min(royaltyPct + 2, 12)}% until my $${investmentAmount}M principal is recouped, then drop it to 2% until the ${paybackCapMult}x cap. That protects my downside!`,
      deal_analysis: `Borderline payback speed (${months} months). Projected IRR of ${irr}% is acceptable but requires downside acceleration or an increased equity sweetener.`,
      founder_takeaway: `Counter with a step-down royalty (higher rate during Year 1-2, dropping sharply once principal is safe).`,
      suggested_counter_offer: `$${investmentAmount}M for ${Math.min(royaltyPct + 1.5, 10)}% early royalty stepped down to 2.5% after principal, with ${Math.max(residualEquityPct, 5)}% equity.`,
      ai_powered: false,
    };
  }

  // Scenario 5: Truly Dead To Me (IRR < 13% or Payback > 72 mo / 6+ years)
  return {
    verdict_sentiment: "dead_to_me",
    verdict_title: "Take It Behind The Barn And Shoot It!",
    shark_quote: `Stop the madness! You want $${investmentAmount}M of my money, and it will take ${calc.paybackYears} years (${months} months) just to crawl back at a pathetic ${irr}% return? I can buy 10-year US Treasuries and sleep on a beach in St. Barts without dealing with your headaches! You are dead to me!`,
    deal_analysis: `Unacceptable capital lockup: ${months} months to reach payback cap generates an anemic ${irr}% IRR. The opportunity cost of capital makes this mathematically unviable for private equity.`,
    founder_takeaway: `Substantially increase the royalty rate, reduce the cash ask, or increase the growth forecast to compress the payback horizon.`,
    suggested_counter_offer: `Reduce cash ask to $${(investmentAmount * 0.6).toFixed(1)}M or increase royalty to ${Math.min(royaltyPct + 3, 12)}% to achieve a <48-month payback.`,
    ai_powered: false,
  };
}

interface MrWonderfulDealStructurerProps {
  deals: Deal[];
  selectedDeal?: Deal | null;
}

export const MrWonderfulDealStructurer: React.FC<MrWonderfulDealStructurerProps> = ({
  deals,
  selectedDeal = null,
}) => {
  const [activeDealId, setActiveDealId] = useState<string>(selectedDeal?.id ?? (deals[0]?.id || ""));
  
  const currentDeal = useMemo(() => {
    return deals.find((d) => d.id === activeDealId) || selectedDeal || {
      id: "custom",
      name: "Acme Cloud Technologies",
      target_company: "Acme Corp",
      sector: "B2B SaaS",
      revenue: 25.0,
      ebitda: 6.0,
      enterprise_value: 75.0,
    };
  }, [deals, activeDealId, selectedDeal]);

  // Kevin O'Leary Deal Structure Parameters
  const [investmentAmount, setInvestmentAmount] = useState<number>(2.0); // $M upfront
  const [royaltyPct, setRoyaltyPct] = useState<number>(5.0); // % of top-line revenue
  const [paybackCapMult, setPaybackCapMult] = useState<number>(2.0); // e.g. 2.0x payback ($4.0M)
  const [residualEquityPct, setResidualEquityPct] = useState<number>(3.0); // % permanent equity
  const [annualGrowthPct, setAnnualGrowthPct] = useState<number>(20.0); // % revenue CAGR

  // AI Critique State
  const [critiqueLoading, setCritiqueLoading] = useState<boolean>(false);
  const [critique, setCritique] = useState<MrWonderfulCritiqueResponse | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Financial Calculations
  const calculations = useMemo(() => {
    const rev = currentDeal.revenue || 25.0;
    const ebitda = currentDeal.ebitda || 6.0;
    const targetPaybackTotal = investmentAmount * paybackCapMult;
    
    // Simulate month-by-month payback
    let cumulativePaid = 0;
    let monthsToPayback = 0;
    let currentAnnualRev = rev;
    const monthlyGrowthFactor = Math.pow(1 + annualGrowthPct / 100, 1 / 12);

    for (let m = 1; m <= 120; m++) {
      const monthlyRev = (currentAnnualRev / 12);
      const monthlyRoyalty = monthlyRev * (royaltyPct / 100);
      cumulativePaid += monthlyRoyalty;

      if (cumulativePaid >= targetPaybackTotal && monthsToPayback === 0) {
        monthsToPayback = m;
      }
      currentAnnualRev *= monthlyGrowthFactor;
    }

    if (monthsToPayback === 0) monthsToPayback = 120;

    // Approximate IRR based on payback horizon + residual equity value
    const years = monthsToPayback / 12;
    const annualRoyaltyYear1 = rev * (royaltyPct / 100);
    const residualEquityValue = (currentDeal.enterprise_value || (ebitda * 12)) * (residualEquityPct / 100);
    
    // Rough annualized IRR: (Total Return / Investment) ^ (1 / years) - 1
    const totalReturn = targetPaybackTotal + residualEquityValue;
    const irrPct = years > 0 ? (Math.pow(totalReturn / investmentAmount, 1 / Math.max(years, 1.5)) - 1) * 100 : 0;

    // Coverage & Founder Dilution
    const royaltyCoverageEbitda = ebitda > 0 ? (annualRoyaltyYear1 / ebitda) * 100 : 999;
    const founderDilutionSaved = Math.max(0, 25.0 - residualEquityPct); // vs typical 25% VC/PE round

    // 5-Year Cashflow Schedule for Chart
    const schedule = [];
    let r = rev;
    let paidSoFar = 0;

    for (let y = 1; y <= 5; y++) {
      const yearRoyaltyPotential = r * (royaltyPct / 100);
      let yearRoyaltyActual = 0;

      if (paidSoFar < targetPaybackTotal) {
        const remainingCap = targetPaybackTotal - paidSoFar;
        yearRoyaltyActual = Math.min(remainingCap, yearRoyaltyPotential);
        paidSoFar += yearRoyaltyActual;
      }

      const ebitdaProjected = r * (ebitda / rev);
      const netCashToCompany = ebitdaProjected - yearRoyaltyActual;

      schedule.push({
        year: `Year ${y}`,
        revenue: Number(r.toFixed(1)),
        ebitda: Number(ebitdaProjected.toFixed(1)),
        royaltyPaid: Number(yearRoyaltyActual.toFixed(2)),
        netEbitdaRetained: Number(netCashToCompany.toFixed(2)),
      });

      r *= (1 + annualGrowthPct / 100);
    }

    return {
      targetPaybackTotal,
      monthsToPayback,
      paybackYears: (monthsToPayback / 12).toFixed(1),
      irrPct: Math.min(Math.max(irrPct, 8), 120).toFixed(1),
      annualRoyaltyYear1: annualRoyaltyYear1.toFixed(2),
      royaltyCoverageEbitda: royaltyCoverageEbitda.toFixed(0),
      founderDilutionSaved: founderDilutionSaved.toFixed(0),
      schedule,
    };
  }, [currentDeal, investmentAmount, royaltyPct, paybackCapMult, residualEquityPct, annualGrowthPct]);

  // Live dynamic critique reactive to every slider movement
  const activeCritique = useMemo(() => {
    return evaluateKevinStructure(
      investmentAmount,
      royaltyPct,
      paybackCapMult,
      residualEquityPct,
      currentDeal,
      calculations
    );
  }, [investmentAmount, royaltyPct, paybackCapMult, residualEquityPct, currentDeal, calculations]);

  // If user clicked "Ask Kevin", use that snapshot; otherwise use reactive live critique
  const displayedCritique = critique || activeCritique;

  const handleAskKevin = async () => {
    setCritiqueLoading(true);
    try {
      const res = await apiPost<MrWonderfulCritiqueResponse>("/ai/mr-wonderful-critique", {
        target_name: currentDeal.name,
        revenue: currentDeal.revenue,
        ebitda: currentDeal.ebitda,
        investment_amount: investmentAmount,
        royalty_pct: royaltyPct,
        payback_cap_mult: paybackCapMult,
        residual_equity_pct: residualEquityPct,
        payback_months: calculations.monthsToPayback,
        investor_irr_pct: parseFloat(calculations.irrPct),
      });
      setCritique(res);
      if (res.verdict_sentiment === "deal") {
        toast.success(`🦈 Kevin O'Leary: "${res.verdict_title}"`);
      } else if (res.verdict_sentiment === "counter_offer" || res.verdict_sentiment === "caution") {
        toast.warning(`⚖️ Kevin O'Leary: "${res.verdict_title}"`);
      } else {
        toast.error(`☠️ Kevin O'Leary: "${res.verdict_title}"`);
      }
    } catch {
      // Offline fallback critique using rich multi-tier Shark Tank rules
      const fallback = evaluateKevinStructure(
        investmentAmount,
        royaltyPct,
        paybackCapMult,
        residualEquityPct,
        currentDeal,
        calculations
      );
      setCritique(fallback);
      if (fallback.verdict_sentiment === "deal") {
        toast.success(`🦈 Kevin O'Leary: "${fallback.verdict_title}"`);
      } else if (fallback.verdict_sentiment === "counter_offer" || fallback.verdict_sentiment === "caution") {
        toast.warning(`⚖️ Kevin O'Leary: "${fallback.verdict_title}"`);
      } else {
        toast.error(`☠️ Kevin O'Leary: "${fallback.verdict_title}"`);
      }
    } finally {
      setCritiqueLoading(false);
    }
  };

  const copyTermSheet = () => {
    const termSheet = `--- SHARK TANK / MR. WONDERFUL TERM SHEET ---
Target: ${currentDeal.name} (${currentDeal.sector})
Investment Amount: $${investmentAmount.toFixed(1)}M
Royalty Rate: ${royaltyPct.toFixed(1)}% of top-line revenue
Payback Cap: ${paybackCapMult.toFixed(1)}x ($${calculations.targetPaybackTotal.toFixed(1)}M total cash recouped)
Residual Equity: ${residualEquityPct.toFixed(1)}% permanent equity
Projected Payback Horizon: ${calculations.monthsToPayback} months (~${calculations.paybackYears} years)
Investor Projected IRR: ${calculations.irrPct}%
Founder Retained Equity: ${(100 - residualEquityPct).toFixed(1)}%
Generated via DealCFO Dashboard
---------------------------------------------`;
    navigator.clipboard.writeText(termSheet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-card to-card border border-purple-500/30 p-5 rounded-xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-purple-500/5 blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-[11px] font-bold px-2.5 py-0.5">
                🦈 Shark Tank Deal Structure
              </Badge>
              <Badge variant="outline" className="text-[11px] text-muted-foreground">
                Kevin O'Leary Signature Model
              </Badge>
            </div>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
              "Mr. Wonderful" Royalty & Growth Structurer
            </h2>
            <p className="text-xs text-muted-foreground italic">
              "I don't care about your emotional stories. I care about my money working 24 hours a day and coming home with friends."
            </p>
          </div>

          {/* Deal Target Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">Deal Target:</span>
            <select
              value={activeDealId}
              onChange={(e) => {
                setActiveDealId(e.target.value);
                setCritique(null);
              }}
              className="text-xs bg-muted/60 border border-border rounded-md px-3 py-1.5 text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              {deals.map((d) => (
                <option key={d.id} value={d.id}>
                  {`${d.name} ($${d.revenue}M Rev / $${d.ebitda}M EBITDA)`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Controls Left, Metrics & Cashflows Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Royalty Term Sliders */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-border/80 bg-card/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-purple-400" />
                  Shark Tank Deal Terms
                </span>
                <Badge variant="outline" className="text-[10px] text-purple-400 border-purple-500/30">
                  Instant Payback Engine
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 text-xs">
              {/* Signature Shark Presets */}
              <div className="space-y-1.5 pb-1 border-b border-border/40">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Signature Shark Presets
                  </span>
                  <span className="text-[10px] text-purple-400 font-medium">1-Click Apply</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setInvestmentAmount(2.0);
                      setRoyaltyPct(5.0);
                      setPaybackCapMult(2.0);
                      setResidualEquityPct(3.0);
                      setCritique(null);
                    }}
                    className="p-1.5 text-left rounded-md bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-all text-xs group"
                  >
                    <div className="font-bold text-purple-300 text-[11px] group-hover:text-purple-200">🦈 Classic</div>
                    <div className="text-[9px] text-muted-foreground font-mono">5% / 2x / 3% Eq</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInvestmentAmount(1.5);
                      setRoyaltyPct(8.0);
                      setPaybackCapMult(1.5);
                      setResidualEquityPct(1.5);
                      setCritique(null);
                    }}
                    className="p-1.5 text-left rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all text-xs group"
                  >
                    <div className="font-bold text-emerald-300 text-[11px] group-hover:text-emerald-200">⚡ Velocity</div>
                    <div className="text-[9px] text-muted-foreground font-mono">8% / 1.5x / 1.5% Eq</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInvestmentAmount(3.0);
                      setRoyaltyPct(4.0);
                      setPaybackCapMult(1.75);
                      setResidualEquityPct(0.0);
                      setCritique(null);
                    }}
                    className="p-1.5 text-left rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all text-xs group"
                  >
                    <div className="font-bold text-cyan-300 text-[11px] group-hover:text-cyan-200">🛡️ Shield</div>
                    <div className="text-[9px] text-muted-foreground font-mono">4% / 1.75x / 0% Eq</div>
                  </button>
                </div>
              </div>

              {/* 1. Cash Investment */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold">Cash Investment Offered ($M):</Label>
                  <span className="font-mono text-purple-400 font-bold text-sm">
                    ${investmentAmount.toFixed(1)}M
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="10.0"
                  step="0.25"
                  value={investmentAmount}
                  onChange={(e) => {
                    setInvestmentAmount(parseFloat(e.target.value));
                    setCritique(null);
                  }}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>$0.5M</span>
                  <span>$5.0M</span>
                  <span>$10.0M</span>
                </div>
              </div>

              {/* 2. Royalty % of Revenue */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold">Royalty Rate (% of Revenue):</Label>
                  <span className="font-mono text-emerald-400 font-bold text-sm">
                    {royaltyPct.toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="12.0"
                  step="0.5"
                  value={royaltyPct}
                  onChange={(e) => {
                    setRoyaltyPct(parseFloat(e.target.value));
                    setCritique(null);
                  }}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>1.0%</span>
                  <span>6.0%</span>
                  <span>12.0%</span>
                </div>
              </div>

              {/* 3. Payback Cap Multiple */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold">Payback Cap Multiple (x):</Label>
                  <span className="font-mono text-cyan-400 font-bold text-sm">
                    {paybackCapMult.toFixed(1)}x (${calculations.targetPaybackTotal.toFixed(1)}M)
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="3.5"
                  step="0.1"
                  value={paybackCapMult}
                  onChange={(e) => {
                    setPaybackCapMult(parseFloat(e.target.value));
                    setCritique(null);
                  }}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>1.0x (Principal only)</span>
                  <span>2.0x (Standard)</span>
                  <span>3.5x (Max)</span>
                </div>
              </div>

              {/* 4. Residual Equity Stake */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold">Residual Perpetual Equity (%):</Label>
                  <span className="font-mono text-amber-400 font-bold text-sm">
                    {residualEquityPct.toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="15.0"
                  step="0.5"
                  value={residualEquityPct}
                  onChange={(e) => {
                    setResidualEquityPct(parseFloat(e.target.value));
                    setCritique(null);
                  }}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>0% (Clean Royalty)</span>
                  <span>5.0%</span>
                  <span>15.0%</span>
                </div>
              </div>

              {/* 5. Projected Company Growth */}
              <div className="pt-2 border-t border-border/40 space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label className="text-[11px] text-muted-foreground font-semibold">Target 5-Yr Growth CAGR (%):</Label>
                  <span className="font-mono text-foreground font-bold">{annualGrowthPct}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  value={annualGrowthPct}
                  onChange={(e) => {
                    setAnnualGrowthPct(parseFloat(e.target.value));
                    setCritique(null);
                  }}
                  className="w-full accent-zinc-500 cursor-pointer"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleAskKevin}
                  disabled={critiqueLoading}
                  data-testid="btn-ask-mr-wonderful"
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-purple-900/40"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                  {critiqueLoading ? "Analyzing with Mr. Wonderful..." : "Ask Kevin O'Leary: Deal or No Deal?"}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyTermSheet}
                  data-testid="btn-copy-term-sheet"
                  className="text-xs px-3"
                  title="Copy Shark Tank Term Sheet"
                >
                  {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Key Deal Metrics & Visual Waterfall */}
        <div className="lg:col-span-7 space-y-4">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="bg-purple-500/10 border-purple-500/30 p-3">
              <span className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider block">
                Payback Horizon
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-foreground font-mono mt-1 flex items-baseline gap-1">
                <span>{calculations.monthsToPayback}</span>
                <span className="text-xs text-muted-foreground font-sans">mo ({calculations.paybackYears} yrs)</span>
              </div>
            </Card>

            <Card className="bg-emerald-500/10 border-emerald-500/30 p-3">
              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">
                Kevin's Projected IRR
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono mt-1">
                {calculations.irrPct}%
              </div>
            </Card>

            <Card className="bg-cyan-500/10 border-cyan-500/30 p-3">
              <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider block">
                Founder Equity Saved
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-cyan-400 font-mono mt-1">
                +{calculations.founderDilutionSaved}%
              </div>
              <span className="text-[9px] text-muted-foreground block mt-0.5">vs 25% VC buyout</span>
            </Card>

            <Card className="bg-card border-border p-3">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">
                EBITDA Royalty Bite
              </span>
              <div className={`text-xl sm:text-2xl font-extrabold font-mono mt-1 ${
                parseInt(calculations.royaltyCoverageEbitda) > 50 ? "text-rose-400" : "text-foreground"
              }`}>
                {calculations.royaltyCoverageEbitda}%
              </div>
              <span className="text-[9px] text-muted-foreground block mt-0.5">of Year 1 EBITDA</span>
            </Card>
          </div>

          {/* 5-Year Cashflow Waterfall BarChart */}
          <Card className="border-border/80 bg-card/60 p-4">
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                5-Year Trajectory: Royalty Paid vs Net EBITDA Retained ($M)
              </h3>
              <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 font-mono">
                ${calculations.targetPaybackTotal.toFixed(1)}M Cap
              </Badge>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={calculations.schedule} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
                  <XAxis dataKey="year" stroke="#71717a" fontSize={11} />
                  <YAxis stroke="#71717a" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(val: any) => [`$${val}M`, ""]}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }} />
                  <Bar dataKey="ebitda" name="Total EBITDA ($M)" fill="#3b82f6" opacity={0.4} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="royaltyPaid" name="Royalty to Kevin ($M)" fill="#a855f7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="netEbitdaRetained" name="Net Cash Retained by Company ($M)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* AI / Shark Tank Critique Box */}
          {displayedCritique && (
            <Card
              data-testid="shark-tank-critique-card"
              className={`border p-4 transition-all duration-300 ${
                displayedCritique.verdict_sentiment === "deal" 
                  ? "bg-emerald-950/20 border-emerald-500/40 shadow-sm shadow-emerald-950/30" 
                  : displayedCritique.verdict_sentiment === "dead_to_me"
                  ? "bg-rose-950/20 border-rose-500/40 shadow-sm shadow-rose-950/30"
                  : displayedCritique.verdict_sentiment === "choke_warning"
                  ? "bg-amber-950/25 border-amber-500/40 shadow-sm shadow-amber-950/30"
                  : "bg-purple-950/20 border-purple-500/40 shadow-sm shadow-purple-950/30"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      data-testid="shark-verdict-badge"
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        displayedCritique.verdict_sentiment === "deal"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : displayedCritique.verdict_sentiment === "dead_to_me"
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                          : displayedCritique.verdict_sentiment === "choke_warning"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-purple-500/20 text-purple-300 border-purple-500/40"
                      }`}
                    >
                      {displayedCritique.verdict_sentiment === "deal" 
                        ? "🦈 It's a Deal!" 
                        : displayedCritique.verdict_sentiment === "dead_to_me" 
                        ? "☠️ You're Dead to Me" 
                        : displayedCritique.verdict_sentiment === "choke_warning"
                        ? "⚠️ EBITDA Choke Risk"
                        : "⚖️ Shark Counter-Offer"}
                    </Badge>
                    <span data-testid="shark-verdict-title" className="text-xs font-bold text-foreground">
                      {displayedCritique.verdict_title}
                    </span>
                  </div>
                  <p data-testid="shark-quote-text" className="text-xs italic text-foreground/90 font-serif pt-1 leading-relaxed">
                    "{displayedCritique.shark_quote}"
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border/40 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-muted-foreground block">Financial Critique:</span>
                  <p className="text-[11px] text-foreground/80 mt-0.5 leading-relaxed">{displayedCritique.deal_analysis}</p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-muted-foreground block">Shark Counter-Offer / Advice:</span>
                  <p className="text-[11px] text-cyan-400 font-mono mt-0.5">{displayedCritique.suggested_counter_offer}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
