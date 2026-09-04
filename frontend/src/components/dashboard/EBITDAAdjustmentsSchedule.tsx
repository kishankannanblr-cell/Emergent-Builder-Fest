import React, { useState, useEffect } from "react";
import { 
  FileSpreadsheet, 
  Plus, 
  Trash2 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import type { EBITDAAdjustment, EBITDAAdjustmentCreate } from "@/lib/types";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { toast } from "sonner";

interface EBITDAAdjustmentsScheduleProps {
  initialAdjustments?: EBITDAAdjustment[];
}

export const EBITDAAdjustmentsSchedule: React.FC<EBITDAAdjustmentsScheduleProps> = ({
  initialAdjustments = [],
}) => {
  const [adjustments, setAdjustments] = useState<EBITDAAdjustment[]>(initialAdjustments);
  const [reportedEbitda, setReportedEbitda] = useState<number>(4.20);
  const [valuationMultiple, setValuationMultiple] = useState<number>(11.5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAdj, setNewAdj] = useState<EBITDAAdjustmentCreate>({
    name: "",
    category: "Owner Compensation",
    amount: 0.35,
    adjustment_type: "add_back",
    notes: "",
  });

  const fetchAdjustments = async () => {
    try {
      const res = await apiGet<EBITDAAdjustment[]>("/financials/ebitda-adjustments");
      setAdjustments(res);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchAdjustments();
  }, []);

  const handleAddAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdj.name.trim()) {
      toast.error("Please provide an adjustment name");
      return;
    }

    try {
      const created = await apiPost<EBITDAAdjustment>("/financials/ebitda-adjustments", newAdj);
      setAdjustments((prev) => [...prev, created]);
      toast.success("EBITDA Adjustment added to QoE schedule");
      setIsModalOpen(false);
      setNewAdj({
        name: "",
        category: "Owner Compensation",
        amount: 0.35,
        adjustment_type: "add_back",
        notes: "",
      });
    } catch (err: any) {
      toast.error("Failed to add adjustment: " + (err.message || "Error"));
    }
  };

  const handleDeleteAdjustment = async (id: string) => {
    try {
      await apiDelete(`/financials/ebitda-adjustments/${id}`);
      setAdjustments((prev) => prev.filter((a) => a.id !== id));
      toast.success("Adjustment removed from schedule");
    } catch {
      toast.error("Failed to delete adjustment");
    }
  };

  // Computations
  const totalAddBacks = adjustments
    .filter((a) => a.adjustment_type === "add_back")
    .reduce((sum, a) => sum + a.amount, 0);

  const totalDeductions = adjustments
    .filter((a) => a.adjustment_type === "deduction")
    .reduce((sum, a) => sum + a.amount, 0);

  const netAdjustment = totalAddBacks - totalDeductions;
  const adjustedEbitda = reportedEbitda + netAdjustment;
  const unadjustedEV = reportedEbitda * valuationMultiple;
  const adjustedEV = adjustedEbitda * valuationMultiple;
  const evDelta = adjustedEV - unadjustedEV;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/20 border border-border/80 p-4 rounded-xl">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            Quality of Earnings (QoE) EBITDA Adjustments Bridge
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Model owner compensation normalization, carve-out one-offs, IT double-runs, and post-close synergy bridges
          </p>
        </div>

        <Button
          data-testid="btn-open-adjustment-modal"
          onClick={() => setIsModalOpen(true)}
          size="sm"
          className="h-9 gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add QoE Line Item</span>
        </Button>
      </div>

      {/* EBITDA Bridge Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="bg-card/60 border-border p-3.5">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block">
            Reported LTM EBITDA
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-foreground">
              ${reportedEbitda.toFixed(2)}M
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Unadjusted baseline</p>
        </Card>

        <Card className="bg-emerald-500/10 border-emerald-500/30 p-3.5">
          <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold block">
            Total Add-Backs (+)
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              +${totalAddBacks.toFixed(2)}M
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">{adjustments.filter(a => a.adjustment_type === "add_back").length} items approved</p>
        </Card>

        <Card className="bg-rose-500/10 border-rose-500/30 p-3.5">
          <span className="text-[10px] text-rose-400 uppercase tracking-wider font-semibold block">
            Total Deductions (-)
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-rose-400">
              -${totalDeductions.toFixed(2)}M
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Non-operating revenues</p>
        </Card>

        <Card className="bg-cyan-500/10 border-cyan-500/30 p-3.5">
          <span className="text-[10px] text-cyan-400 uppercase tracking-wider font-semibold block">
            Adjusted Pro-Forma EBITDA
          </span>
          <div 
            data-testid="qoe-adjusted-ebitda-display"
            className="mt-1 flex items-baseline gap-1.5"
          >
            <span className="text-2xl font-extrabold font-mono text-cyan-300">
              ${adjustedEbitda.toFixed(2)}M
            </span>
          </div>
          <p className="text-[10px] text-emerald-400 font-mono mt-1">
            +{((netAdjustment / reportedEbitda) * 100).toFixed(1)}% Expansion
          </p>
        </Card>

        <Card className="bg-emerald-500/20 border-emerald-500/40 p-3.5">
          <span className="text-[10px] text-emerald-300 uppercase tracking-wider font-semibold block">
            EV Impact @ {valuationMultiple}x
          </span>
          <div 
            data-testid="qoe-ev-delta-display"
            className="mt-1 flex items-baseline gap-1.5"
          >
            <span className="text-2xl font-extrabold font-mono text-emerald-300">
              +${evDelta.toFixed(2)}M
            </span>
          </div>
          <p className="text-[10px] text-emerald-400/90 font-mono mt-1">Total EV: ${adjustedEV.toFixed(1)}M</p>
        </Card>
      </div>

      {/* Baseline Controls */}
      <div className="flex flex-wrap items-center gap-4 bg-muted/20 border border-border/80 p-3 rounded-lg text-xs">
        <div className="flex items-center gap-2">
          <Label htmlFor="base_ebitda" className="text-muted-foreground font-medium">
            Baseline LTM EBITDA ($M):
          </Label>
          <Input
            id="base_ebitda"
            data-testid="qoe-input-reported-ebitda"
            type="number"
            step="0.1"
            value={reportedEbitda}
            onChange={(e) => setReportedEbitda(parseFloat(e.target.value) || 0)}
            className="w-24 h-7 text-xs font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="mult_eval" className="text-muted-foreground font-medium">
            Assumed Valuation Multiple (x):
          </Label>
          <Input
            id="mult_eval"
            data-testid="qoe-input-multiple"
            type="number"
            step="0.5"
            value={valuationMultiple}
            onChange={(e) => setValuationMultiple(parseFloat(e.target.value) || 0)}
            className="w-20 h-7 text-xs font-mono"
          />
        </div>
      </div>

      {/* Adjustments Table */}
      <Card className="border-border/80 bg-card/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Schedule of Adjustments & Normalization Line Items</span>
            <span className="text-[11px] text-muted-foreground font-mono">
              {adjustments.length} Line Items
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 border-y border-border/60 text-muted-foreground font-semibold">
              <tr>
                <th className="p-3">Adjustment Name & Thesis</th>
                <th className="p-3">Category</th>
                <th className="p-3">Type</th>
                <th className="p-3 font-mono">Amount ($M)</th>
                <th className="p-3 font-mono">Implied EV Impact (@{valuationMultiple}x)</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {adjustments.map((adj) => {
                const isAddBack = adj.adjustment_type === "add_back";
                const impact = adj.amount * valuationMultiple;

                return (
                  <tr key={adj.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 max-w-xs">
                      <span className="font-bold text-foreground block">{adj.name}</span>
                      {adj.notes && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                          {adj.notes}
                        </p>
                      )}
                    </td>
                    <td className="p-3">
                      <Badge variant="secondary" className="text-[10px] font-medium">
                        {adj.category}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          isAddBack
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        }`}
                      >
                        {isAddBack ? "+ Add-Back" : "- Deduction"}
                      </Badge>
                    </td>
                    <td className={`p-3 font-mono font-bold ${isAddBack ? "text-emerald-400" : "text-rose-400"}`}>
                      {isAddBack ? "+" : "-"}${adj.amount.toFixed(2)}M
                    </td>
                    <td className={`p-3 font-mono ${isAddBack ? "text-emerald-400/90" : "text-rose-400/90"}`}>
                      {isAddBack ? "+" : "-"}${impact.toFixed(2)}M
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        data-testid={`btn-delete-adj-${adj.id}`}
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleDeleteAdjustment(adj.id)}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        title="Remove adjustment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Add Adjustment Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-border">
          <form onSubmit={handleAddAdjustment}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Add QoE EBITDA Adjustment
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Document a one-time add-back, non-operating item, or run-rate synergy adjustment
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div className="space-y-1">
                <Label htmlFor="adj_name" className="text-xs font-medium">Adjustment Title</Label>
                <Input
                  id="adj_name"
                  data-testid="input-adj-name"
                  placeholder="e.g., Carve-out Legal & Separation Consulting"
                  value={newAdj.name}
                  onChange={(e) => setNewAdj({ ...newAdj, name: e.target.value })}
                  className="h-8 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="adj_category" className="text-xs font-medium">Category</Label>
                  <select
                    id="adj_category"
                    data-testid="select-adj-category"
                    value={newAdj.category}
                    onChange={(e) => setNewAdj({ ...newAdj, category: e.target.value })}
                    className="w-full h-8 text-xs bg-muted/60 border border-border rounded-md px-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Owner Compensation">Owner Compensation</option>
                    <option value="One-Time Legal/Advisory">One-Time Legal/Advisory</option>
                    <option value="IT & Cloud Migration">IT & Cloud Migration</option>
                    <option value="Restructuring & Severance">Restructuring & Severance</option>
                    <option value="Non-Operating Income">Non-Operating Income</option>
                    <option value="Pro-Forma Synergies">Pro-Forma Synergies</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="adj_type" className="text-xs font-medium">Adjustment Type</Label>
                  <select
                    id="adj_type"
                    data-testid="select-adj-type"
                    value={newAdj.adjustment_type}
                    onChange={(e) => setNewAdj({ ...newAdj, adjustment_type: e.target.value as "add_back" | "deduction" })}
                    className="w-full h-8 text-xs bg-muted/60 border border-border rounded-md px-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="add_back">Add-Back (+)</option>
                    <option value="deduction">Deduction (-)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="adj_amount" className="text-xs font-medium">Amount ($ Millions)</Label>
                <Input
                  id="adj_amount"
                  data-testid="input-adj-amount"
                  type="number"
                  step="0.01"
                  placeholder="0.35"
                  value={newAdj.amount}
                  onChange={(e) => setNewAdj({ ...newAdj, amount: parseFloat(e.target.value) || 0 })}
                  className="h-8 text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="adj_notes" className="text-xs font-medium">Auditor / Diligence Notes</Label>
                <Input
                  id="adj_notes"
                  data-testid="input-adj-notes"
                  placeholder="Explain rationale and support document reference"
                  value={newAdj.notes || ""}
                  onChange={(e) => setNewAdj({ ...newAdj, notes: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                data-testid="btn-submit-adj"
                type="submit"
                size="sm"
                className="text-xs bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold"
              >
                Save Adjustment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
