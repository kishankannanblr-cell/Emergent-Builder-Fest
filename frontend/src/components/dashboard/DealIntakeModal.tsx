import React, { useState, useEffect } from "react";
import { Plus, Edit3 } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Deal, DealCreate, DealUpdate } from "@/lib/types";

interface DealIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dealData: DealCreate | DealUpdate, isEdit: boolean) => Promise<void>;
  dealToEdit?: Deal | null;
}

export const DealIntakeModal: React.FC<DealIntakeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  dealToEdit = null,
}) => {
  const isEdit = !!dealToEdit;

  const [formData, setFormData] = useState<DealCreate>({
    name: "",
    target_company: "",
    sector: "SaaS / Cybersecurity",
    deal_type: "100% Buyout",
    stage: "Initial Review",
    enterprise_value: 35.0,
    revenue: 12.0,
    ebitda: 3.0,
    ebitda_multiple: 11.67,
    lead_partner: "Marcus Vance",
    probability_pct: 50,
    cash_required: 24.0,
    target_close_date: "2025-10-31",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (dealToEdit) {
      setFormData({
        name: dealToEdit.name,
        target_company: dealToEdit.target_company,
        sector: dealToEdit.sector,
        deal_type: dealToEdit.deal_type,
        stage: dealToEdit.stage,
        enterprise_value: dealToEdit.enterprise_value,
        revenue: dealToEdit.revenue,
        ebitda: dealToEdit.ebitda,
        ebitda_multiple: dealToEdit.ebitda_multiple,
        lead_partner: dealToEdit.lead_partner,
        probability_pct: dealToEdit.probability_pct,
        cash_required: dealToEdit.cash_required,
        target_close_date: dealToEdit.target_close_date,
        notes: dealToEdit.notes || "",
      });
    } else {
      setFormData({
        name: "",
        target_company: "",
        sector: "SaaS / Cybersecurity",
        deal_type: "100% Buyout",
        stage: "Initial Review",
        enterprise_value: 35.0,
        revenue: 12.0,
        ebitda: 3.0,
        ebitda_multiple: 11.67,
        lead_partner: "Marcus Vance",
        probability_pct: 50,
        cash_required: 24.0,
        target_close_date: "2025-10-31",
        notes: "",
      });
    }
  }, [dealToEdit, isOpen]);

  // Recalculate implied multiple live
  const impliedMultiple = formData.ebitda > 0
    ? (formData.enterprise_value / formData.ebitda).toFixed(1)
    : "0.0";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        ebitda_multiple: parseFloat(impliedMultiple),
      }, isEdit);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl bg-card border-border max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              {isEdit ? <Edit3 className="w-5 h-5 text-emerald-400" /> : <Plus className="w-5 h-5 text-emerald-400" />}
              {isEdit ? "Edit Deal Parameters" : "New M&A Deal Opportunity Intake"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Register deal metrics, target financial profile, and pipeline stage assignment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-3 text-xs">
            {/* Deal Name & Target Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="deal_name" className="text-xs font-semibold">Deal Project Code/Name</Label>
                <Input
                  id="deal_name"
                  data-testid="intake-deal-name"
                  placeholder="e.g. Apex Security Buyout"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-8 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="target_company" className="text-xs font-semibold">Target Entity / Company</Label>
                <Input
                  id="target_company"
                  data-testid="intake-target-company"
                  placeholder="e.g. ApexSecure Inc."
                  value={formData.target_company}
                  onChange={(e) => setFormData({ ...formData, target_company: e.target.value })}
                  className="h-8 text-xs"
                  required
                />
              </div>
            </div>

            {/* Sector, Type & Stage */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="intake_sector" className="text-xs font-semibold">Industry / Sector</Label>
                <select
                  id="intake_sector"
                  data-testid="intake-select-sector"
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="w-full h-8 text-xs bg-muted/60 border border-border rounded-md px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="SaaS / Cybersecurity">SaaS / Cybersecurity</option>
                  <option value="FinTech / Payments">FinTech / Payments</option>
                  <option value="HealthTech">HealthTech</option>
                  <option value="SaaS / Cloud">SaaS / Cloud</option>
                  <option value="Industrial IoT">Industrial IoT</option>
                  <option value="CleanTech / Energy">CleanTech / Energy</option>
                  <option value="MarTech / SaaS">MarTech / SaaS</option>
                  <option value="Defense & Aerospace">Defense & Aerospace</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="intake_type" className="text-xs font-semibold">Deal Structure</Label>
                <select
                  id="intake_type"
                  data-testid="intake-select-type"
                  value={formData.deal_type}
                  onChange={(e) => setFormData({ ...formData, deal_type: e.target.value })}
                  className="w-full h-8 text-xs bg-muted/60 border border-border rounded-md px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="100% Buyout">100% Buyout</option>
                  <option value="Majority Acquisition (80%)">Majority Acquisition (80%)</option>
                  <option value="Growth Equity">Growth Equity</option>
                  <option value="Bolt-On Add-on">Bolt-On Add-on</option>
                  <option value="Carve-Out">Carve-Out</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="intake_stage" className="text-xs font-semibold">Initial Stage</Label>
                <select
                  id="intake_stage"
                  data-testid="intake-select-stage"
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                  className="w-full h-8 text-xs bg-muted/60 border border-border rounded-md px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
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

            {/* Financial Metrics */}
            <div className="p-3 bg-muted/30 border border-border/80 rounded-lg space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                Target Financial Profile ($ Millions)
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="space-y-1">
                  <Label htmlFor="intake_ev" className="text-[11px] font-medium">Enterprise Value</Label>
                  <Input
                    id="intake_ev"
                    data-testid="intake-input-ev"
                    type="number"
                    step="0.5"
                    value={formData.enterprise_value}
                    onChange={(e) => setFormData({ ...formData, enterprise_value: parseFloat(e.target.value) || 0 })}
                    className="h-8 text-xs font-mono font-bold text-foreground"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="intake_revenue" className="text-[11px] font-medium">LTM Revenue</Label>
                  <Input
                    id="intake_revenue"
                    data-testid="intake-input-revenue"
                    type="number"
                    step="0.5"
                    value={formData.revenue}
                    onChange={(e) => setFormData({ ...formData, revenue: parseFloat(e.target.value) || 0 })}
                    className="h-8 text-xs font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="intake_ebitda" className="text-[11px] font-medium">LTM EBITDA</Label>
                  <Input
                    id="intake_ebitda"
                    data-testid="intake-input-ebitda"
                    type="number"
                    step="0.1"
                    value={formData.ebitda}
                    onChange={(e) => setFormData({ ...formData, ebitda: parseFloat(e.target.value) || 0 })}
                    className="h-8 text-xs font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-emerald-400">Implied Multiple</Label>
                  <div className="h-8 flex items-center px-2.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono font-bold text-xs">
                    {impliedMultiple}x EV/EBITDA
                  </div>
                </div>
              </div>
            </div>

            {/* Lead Partner, Probability, Cash Required, Target Close */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label htmlFor="intake_partner" className="text-xs font-semibold">Lead Partner</Label>
                <select
                  id="intake_partner"
                  data-testid="intake-select-partner"
                  value={formData.lead_partner}
                  onChange={(e) => setFormData({ ...formData, lead_partner: e.target.value })}
                  className="w-full h-8 text-xs bg-muted/60 border border-border rounded-md px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Marcus Vance">Marcus Vance</option>
                  <option value="Sarah Chen">Sarah Chen</option>
                  <option value="Elena Rostova">Elena Rostova</option>
                  <option value="David Kim">David Kim</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="intake_prob" className="text-xs font-semibold">Probability (%)</Label>
                <Input
                  id="intake_prob"
                  data-testid="intake-input-probability"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.probability_pct}
                  onChange={(e) => setFormData({ ...formData, probability_pct: parseInt(e.target.value) || 0 })}
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="intake_cash" className="text-xs font-semibold">Equity/Cash ($M)</Label>
                <Input
                  id="intake_cash"
                  data-testid="intake-input-cash-required"
                  type="number"
                  step="0.5"
                  value={formData.cash_required}
                  onChange={(e) => setFormData({ ...formData, cash_required: parseFloat(e.target.value) || 0 })}
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="intake_date" className="text-xs font-semibold">Target Close</Label>
                <Input
                  id="intake_date"
                  data-testid="intake-input-close-date"
                  type="date"
                  value={formData.target_close_date}
                  onChange={(e) => setFormData({ ...formData, target_close_date: e.target.value })}
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            {/* Notes / Thesis */}
            <div className="space-y-1">
              <Label htmlFor="intake_notes" className="text-xs font-semibold">Investment Thesis / Key Notes</Label>
              <Textarea
                id="intake_notes"
                data-testid="intake-textarea-notes"
                placeholder="Market positioning, growth drivers, QoE risks, synergy potential..."
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="text-xs min-h-[60px]"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              data-testid="intake-submit-button"
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="text-xs bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold"
            >
              {isSubmitting ? "Saving..." : isEdit ? "Update Deal" : "Create Deal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
