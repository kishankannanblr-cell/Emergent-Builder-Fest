import React from "react";
import { 
  Building, 
  Calculator, 
  Edit3, 
  Trash2,
  Sparkles 
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
import type { Deal } from "@/lib/types";

interface DealDetailModalProps {
  deal: Deal | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (deal: Deal) => void;
  onDelete: (id: string) => void;
  onOpenDCF: (deal: Deal) => void;
  onStageChange: (id: string, newStage: string) => void;
  onGenerateMemo?: (deal: Deal) => void;
}

export const DealDetailModal: React.FC<DealDetailModalProps> = ({
  deal,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onOpenDCF,
  onStageChange,
  onGenerateMemo,
}) => {
  if (!deal) return null;

  const weightedEV = (deal.enterprise_value * (deal.probability_pct / 100)).toFixed(1);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 pr-6">
            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold">
              {deal.stage}
            </Badge>
            <Badge variant="secondary" className="text-xs font-mono">
              {deal.deal_type}
            </Badge>
          </div>
          <DialogTitle className="text-xl font-extrabold text-foreground tracking-tight mt-1">
            {deal.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <Building className="w-3.5 h-3.5" />
            <span className="font-semibold text-foreground">{deal.target_company}</span>
            <span>•</span>
            <span>{deal.sector}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Key Financial Profile Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/30 p-3.5 rounded-xl border border-border/80">
            <div className="space-y-0.5">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase">Enterprise Value</span>
              <div className="text-xl font-bold font-mono text-foreground">${deal.enterprise_value.toFixed(1)}M</div>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase">EV / EBITDA</span>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {deal.ebitda_multiple > 0 ? `${deal.ebitda_multiple.toFixed(1)}x` : "N/A"}
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase">LTM Revenue</span>
              <div className="text-xl font-bold font-mono text-foreground">${deal.revenue.toFixed(1)}M</div>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase">LTM EBITDA</span>
              <div className="text-xl font-bold font-mono text-foreground">${deal.ebitda.toFixed(1)}M</div>
            </div>
          </div>

          {/* Deal Dynamics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-card border border-border/60 rounded-lg">
              <span className="text-[10px] text-muted-foreground block font-medium">Equity / Cash Needed</span>
              <span className="text-base font-bold font-mono text-cyan-400">${deal.cash_required.toFixed(1)}M</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">Fund allocation check</p>
            </div>

            <div className="p-3 bg-card border border-border/60 rounded-lg">
              <span className="text-[10px] text-muted-foreground block font-medium">Deal Probability</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-base font-bold font-mono text-foreground">{deal.probability_pct}%</span>
                <span className="text-[10px] font-mono text-emerald-400">(${weightedEV}M Weighted)</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1 mt-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-1" style={{ width: `${deal.probability_pct}%` }} />
              </div>
            </div>

            <div className="p-3 bg-card border border-border/60 rounded-lg">
              <span className="text-[10px] text-muted-foreground block font-medium">Target Completion Date</span>
              <span className="text-base font-bold font-mono text-foreground">{deal.target_close_date}</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">Lead: {deal.lead_partner}</p>
            </div>
          </div>

          {/* Investment Thesis & Diligence Notes */}
          <div className="p-3.5 bg-muted/20 border border-border/60 rounded-lg space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Investment Thesis & Strategic Overview
            </span>
            <p className="text-xs text-foreground leading-relaxed">
              {deal.notes || "No detailed notes recorded for this target yet."}
            </p>
          </div>

          {/* Quick Stage Progression Trigger */}
          <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border border-border/60">
            <span className="text-xs font-medium text-muted-foreground">Pipeline Stage Assignment:</span>
            <select
              data-testid="detail-stage-select"
              value={deal.stage}
              onChange={(e) => onStageChange(deal.id, e.target.value)}
              className="text-xs bg-card border border-border rounded-md px-2.5 py-1 text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="Lead Sourcing">Lead Sourcing</option>
              <option value="Initial Review">Initial Review</option>
              <option value="NDA Signed">NDA Signed</option>
              <option value="CIM Review">CIM Review</option>
              <option value="IOI Submitted">IOI Submitted</option>
              <option value="LOI / Exclusivity">LOI / Exclusivity</option>
              <option value="Due Diligence">Due Diligence</option>
              <option value="Definitive Docs">Definitive Docs</option>
              <option value="Closed Won">Closed Won</option>
              <option value="Passed">Passed</option>
            </select>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <Button
              data-testid="detail-launch-dcf-btn"
              size="sm"
              onClick={() => {
                onOpenDCF(deal);
                onClose();
              }}
              className="text-xs gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Simulate DCF Valuation</span>
            </Button>
            <Button
              data-testid="detail-edit-deal-btn"
              variant="outline"
              size="sm"
              onClick={() => {
                onEdit(deal);
                onClose();
              }}
              className="text-xs gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </Button>
            {onGenerateMemo && (
              <Button
                data-testid="detail-generate-ic-memo-btn"
                variant="outline"
                size="sm"
                onClick={() => {
                  onGenerateMemo(deal);
                }}
                className="text-xs gap-1.5 border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span>AI Investment Memo (1-Pager)</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              data-testid="detail-delete-deal-btn"
              variant="ghost"
              size="sm"
              onClick={() => {
                onDelete(deal.id);
                onClose();
              }}
              className="text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              <span>Delete</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
