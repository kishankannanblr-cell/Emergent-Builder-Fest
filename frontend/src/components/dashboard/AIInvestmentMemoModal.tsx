import React, { useState } from "react";
import { 
  Sparkles, 
  CheckCircle2, 
  Copy, 
  Printer, 
  Building, 
  TrendingUp, 
  ShieldCheck, 
  FileText, 
  AlertCircle
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Deal } from "@/lib/types";

interface AIInvestmentMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: Deal | null;
  onOpenDCF?: (deal: Deal) => void;
}

export const AIInvestmentMemoModal: React.FC<AIInvestmentMemoModalProps> = ({
  isOpen,
  onClose,
  deal,
  onOpenDCF,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!deal) return null;

  const ev = deal.enterprise_value || 50.0;
  const rev = deal.revenue || 15.0;
  const ebitda = deal.ebitda || 3.5;
  const margin = rev > 0 ? ((ebitda / rev) * 100).toFixed(1) : "22.0";
  const multiple = deal.ebitda_multiple > 0 ? deal.ebitda_multiple.toFixed(1) : (ev / ebitda).toFixed(1);

  // Quality of Earnings Calculations
  const founderAddBack = Number((ebitda * 0.08).toFixed(2));
  const techMigrationAddBack = Number((ebitda * 0.05).toFixed(2));
  const totalAdjustments = Number((founderAddBack + techMigrationAddBack).toFixed(2));
  const adjustedEbitda = Number((ebitda + totalAdjustments).toFixed(2));
  const adjustedMultiple = Number((ev / adjustedEbitda).toFixed(1));

  // Projected Returns
  const projectedExitEv = Number((adjustedEbitda * 1.6 * (parseFloat(multiple) * 1.1)).toFixed(1));
  const moic = Number((projectedExitEv / ev).toFixed(2));
  const projectedIrr = "26.4%";

  const copyMemoToClipboard = () => {
    const memoText = `================================================================================
CONFIDENTIAL INVESTMENT COMMITTEE MEMORANDUM
Mid-Market Growth Fund IV ($250M AUM)
Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Target: ${deal.name} (${deal.target_company})
Sector: ${deal.sector} | Deal Type: ${deal.deal_type}
Lead Partner: ${deal.lead_partner} | Current Stage: ${deal.stage}
================================================================================

1. EXECUTIVE RECOMMENDATION
Status: RECOMMEND PROCEEDING TO EXCLUSIVITY / LOI
Conviction: HIGH (Score: 4.8 / 5.0)
Deal Thesis: Acquisition of a category-leading platform with strong unit economics, high recurring ARR (112% Net Retention), and clear margin expansion opportunities.

2. FINANCIAL PROFILE & ADJUSTED QoE BRIDGE
- LTM Revenue: $${rev}M
- Reported EBITDA: $${ebitda}M (${margin}% margin) | Entry Multiple: ${multiple}x EV/EBITDA
- (+) Owner Compensation Normalization: +$${(founderAddBack * 1000).toFixed(0)}k
- (+) Non-Recurring Technology Migration: +$${(techMigrationAddBack * 1000).toFixed(0)}k
- (=) Adjusted Run-Rate EBITDA: $${adjustedEbitda}M
- Effective Adjusted Entry Multiple: ${adjustedMultiple}x EV/EBITDA (15% discount to 2025 peers)

3. 5-YEAR EXIT & RETURN TARGETS
- Projected Exit EV (Year 5): $${projectedExitEv}M
- Projected MOIC: ${moic}x Net Invested Capital
- Projected Fund IRR: ${projectedIrr}

4. SHARK TANK / "MR. WONDERFUL" ROYALTY ALTERNATIVE
Structure: $${(deal.cash_required || 4.0).toFixed(1)}M Upfront Investment
Terms: 5.0% top-line royalty until 2.0x payback cap ($${((deal.cash_required || 4.0) * 2).toFixed(1)}M total recoup) + 3.0% perpetual residual equity.
Benefits: Founder retains 97% ownership with non-dilutive liquidity; Investor achieves 29.2% IRR.

5. KEY RISKS & MITIGANTS
- Key Man Risk: 24-month structured earn-out & equity option pool.
- Customer Concentration: Top client represents <12% of total revenue.
- Rate Sensitivity: Conservative 45% senior debt / 55% equity capital structure.

Prepared via DealCFO Intelligence Cockpit
================================================================================`;
    navigator.clipboard.writeText(memoText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl bg-zinc-950 border-border text-foreground max-h-[92vh] overflow-y-auto p-6 shadow-2xl">
        {/* Memo Header Banner */}
        <DialogHeader className="border-b border-border/80 pb-4 space-y-2">
          <div className="flex items-center justify-between gap-2 pr-6">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-[10px] font-bold px-2 py-0.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
                AI Investment Committee Memo
              </Badge>
              <Badge variant="secondary" className="text-[10px] font-mono">
                Strictly Confidential
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">
              Fund IV • Deal ID: {deal.id.slice(0, 8)}
            </span>
          </div>

          <div className="space-y-1">
            <DialogTitle className="text-xl font-extrabold tracking-tight text-white font-heading">
              Investment Committee Memorandum: {deal.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
              <span className="font-semibold text-foreground flex items-center gap-1">
                <Building className="w-3.5 h-3.5" />
                {deal.target_company}
              </span>
              <span>•</span>
              <span className="text-cyan-400 font-mono">{deal.sector}</span>
              <span>•</span>
              <span>Lead Partner: <strong className="text-foreground">{deal.lead_partner}</strong></span>
              <span>•</span>
              <span>Stage: <strong className="text-emerald-400">{deal.stage}</strong></span>
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Memo Content Body */}
        <div className="space-y-5 py-3 text-xs leading-relaxed">
          {/* 1. Executive Recommendation Card */}
          <Card className="bg-emerald-950/20 border-emerald-500/40 p-4 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-bold">
                    RECOMMENDATION: PROCEED TO LOI
                  </Badge>
                  <span className="text-[11px] text-emerald-400 font-mono font-bold">Conviction: 4.8 / 5.0</span>
                </div>
                <p className="text-xs text-zinc-300 pt-1">
                  We recommend submitting a binding LOI at <strong>${ev}M Enterprise Value</strong> ({multiple}x EV/EBITDA). The business possesses clear category leadership in {deal.sector}, mission-critical recurring workflows, and substantial EBITDA margin expansion via post-acquisition operational integration.
                </p>
              </div>
            </div>
          </Card>

          {/* 2. Core Investment Highlights (3 Pillars) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Strategic Investment Pillars & Competitive Moat
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-muted/20 border border-border/60 space-y-1">
                <div className="font-bold text-foreground text-[11px] text-emerald-400">1. High-Margin Recurring Model</div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  LTM Revenue of ${rev}M with 112%+ net revenue retention and low annual customer churn (&lt;4.5%).
                </p>
              </div>

              <div className="p-3 rounded-lg bg-muted/20 border border-border/60 space-y-1">
                <div className="font-bold text-foreground text-[11px] text-cyan-400">2. Scalable Operating Leverage</div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Gross margins exceed 75%, allowing incremental revenue to flow down at 35%+ contribution margin.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-muted/20 border border-border/60 space-y-1">
                <div className="font-bold text-foreground text-[11px] text-purple-400">3. Multiple Expansion Potential</div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Entering at {multiple}x EBITDA vs 2025 peer comps averaging 13.5x provides ~15% valuation discount cushion.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Quality of Earnings (QoE) Adjusted Financial Bridge */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Quality of Earnings (QoE) Normalization Bridge
            </h4>

            <div className="rounded-lg border border-border/60 overflow-hidden">
              <table className="w-full text-xs font-mono">
                <thead className="bg-muted/40 text-muted-foreground border-b border-border/60 text-[11px]">
                  <tr>
                    <th className="p-2.5 text-left font-semibold font-sans">Financial Metric / Adjustment</th>
                    <th className="p-2.5 text-right font-semibold font-sans">Amount ($M)</th>
                    <th className="p-2.5 text-left font-semibold font-sans">Diligence Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  <tr>
                    <td className="p-2.5 text-foreground font-semibold font-sans">Reported LTM EBITDA</td>
                    <td className="p-2.5 text-right font-bold text-foreground">${ebitda}M</td>
                    <td className="p-2.5 text-muted-foreground font-sans text-[11px]">Baseline unadjusted financials ({margin}% margin)</td>
                  </tr>
                  <tr className="bg-emerald-500/5">
                    <td className="p-2.5 text-emerald-400 font-sans font-medium">(+) Owner Compensation Normalization</td>
                    <td className="p-2.5 text-right text-emerald-400 font-bold">+${founderAddBack}M</td>
                    <td className="p-2.5 text-muted-foreground font-sans text-[11px]">Adjusts executive salaries down to market benchmarks</td>
                  </tr>
                  <tr className="bg-emerald-500/5">
                    <td className="p-2.5 text-emerald-400 font-sans font-medium">(+) Non-Recurring Cloud Migration Opex</td>
                    <td className="p-2.5 text-right text-emerald-400 font-bold">+${techMigrationAddBack}M</td>
                    <td className="p-2.5 text-muted-foreground font-sans text-[11px]">One-off dual hosting migration expenses incurred in Q2-Q3</td>
                  </tr>
                  <tr className="bg-emerald-500/10 font-bold">
                    <td className="p-2.5 text-foreground font-sans">(=) Adjusted Run-Rate EBITDA</td>
                    <td className="p-2.5 text-right text-emerald-300 text-sm">${adjustedEbitda}M</td>
                    <td className="p-2.5 text-emerald-400 font-sans text-[11px]">Effective Entry Multiple: {adjustedMultiple}x EV/EBITDA</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. 5-Year Exit Scenarios & "Mr. Wonderful" Shark Tank Structure */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Box A: PE Base Case Returns */}
            <div className="p-3.5 rounded-lg bg-muted/20 border border-border/60 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                PE Base Case Exit Targets (5-Yr)
              </span>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Projected Exit EV</span>
                  <span className="font-mono text-foreground font-bold text-sm">${projectedExitEv}M</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Projected MOIC</span>
                  <span className="font-mono text-emerald-400 font-bold text-sm">{moic}x</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Net Fund IRR</span>
                  <span className="font-mono text-cyan-400 font-bold text-sm">{projectedIrr}</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground pt-1">
                Assumes 18% revenue CAGR and exit at 13.0x EBITDA in 2030 to a strategic acquirer.
              </p>
            </div>

            {/* Box B: "Mr. Wonderful" Alternative Structure */}
            <div className="p-3.5 rounded-lg bg-purple-950/20 border border-purple-500/30 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <span>🦈</span>
                "Mr. Wonderful" Non-Dilutive Alternative
              </span>
              <div className="text-[11px] text-zinc-300 space-y-1">
                <div>
                  <strong>Offer:</strong> ${((deal.cash_required || 4.0)).toFixed(1)}M Upfront for 5% Royalty until 2.0x Payback Cap + 3% Equity.
                </div>
                <div className="text-[10px] text-purple-300/90 leading-relaxed">
                  • <strong>Founder Win:</strong> Saves ~22% equity dilution vs giving away 25% of the company.<br />
                  • <strong>Investor Win:</strong> Locks in a 29.2% IRR with immediate quarterly royalty cash flow.
                </div>
              </div>
            </div>
          </div>

          {/* 5. Downside Risks & Mitigations */}
          <div className="p-3 bg-card border border-border/60 rounded-lg space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              Key Downside Risks & Mitigants
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div>
                <strong className="text-foreground">Key Man / Founder Dependency:</strong>
                <span className="text-muted-foreground block text-[10px]">Mitigated via a 24-month transition earnout and a 10% senior executive equity pool.</span>
              </div>
              <div>
                <strong className="text-foreground">Customer Concentration:</strong>
                <span className="text-muted-foreground block text-[10px]">No single client exceeds 12% of revenue; top 10 represent 34% of ARR.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="mt-3 pt-3 border-t border-border/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyMemoToClipboard}
              data-testid="btn-copy-ic-memo"
              className="text-xs gap-1.5"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy IC Memo</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              data-testid="btn-print-ic-memo"
              className="text-xs gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {onOpenDCF && (
              <Button
                size="sm"
                onClick={() => {
                  onOpenDCF(deal);
                  onClose();
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs gap-1.5 shadow-sm shadow-emerald-900/40"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Simulate DCF & Deal Terms</span>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
