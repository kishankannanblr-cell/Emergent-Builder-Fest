import React, { useState } from "react";
import { 
  ChevronRight, 
  ChevronLeft, 
  Calculator, 
  Trash2, 
  Building,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Deal } from "@/lib/types";

interface DealPipelineProps {
  deals: Deal[];
  onStageChange: (dealId: string, newStage: string) => void;
  onSelectDeal: (deal: Deal) => void;
  onOpenDCF: (deal: Deal) => void;
  onDeleteDeal: (dealId: string) => void;
  onGenerateMemo?: (deal: Deal) => void;
}

const PIPELINE_STAGES = [
  { id: "Lead Sourcing", label: "Lead Sourcing", color: "border-slate-500/30 text-slate-400 bg-slate-500/10" },
  { id: "Initial Review", label: "Initial Review", color: "border-blue-500/30 text-blue-400 bg-blue-500/10" },
  { id: "NDA Signed", label: "NDA Signed", color: "border-cyan-500/30 text-cyan-400 bg-cyan-500/10" },
  { id: "CIM Review", label: "CIM Review", color: "border-indigo-500/30 text-indigo-400 bg-indigo-500/10" },
  { id: "IOI Submitted", label: "IOI Submitted", color: "border-purple-500/30 text-purple-400 bg-purple-500/10" },
  { id: "LOI / Exclusivity", label: "LOI / Exclusivity", color: "border-amber-500/30 text-amber-400 bg-amber-500/10" },
  { id: "Due Diligence", label: "Due Diligence", color: "border-orange-500/30 text-orange-400 bg-orange-500/10" },
  { id: "Definitive Docs", label: "Definitive Docs", color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" },
  { id: "Closed Won", label: "Closed Won", color: "border-emerald-400 text-emerald-300 bg-emerald-500/20" },
  { id: "Passed", label: "Passed", color: "border-rose-500/30 text-rose-400 bg-rose-500/10" },
];

export const DealPipeline: React.FC<DealPipelineProps> = ({
  deals,
  onStageChange,
  onSelectDeal,
  onOpenDCF,
  onDeleteDeal,
  onGenerateMemo,
}) => {
  const [activeFilterSector, setActiveFilterSector] = useState<string>("All");

  const sectors = ["All", "SaaS / Cybersecurity", "FinTech / Payments", "HealthTech", "SaaS / Cloud", "Industrial IoT", "CleanTech / Energy", "MarTech / SaaS", "Defense & Aerospace"];

  const filteredDeals = activeFilterSector === "All"
    ? deals
    : deals.filter((d) => d.sector.includes(activeFilterSector) || d.sector === activeFilterSector);

  const getNextStage = (currentStage: string) => {
    const idx = PIPELINE_STAGES.findIndex((s) => s.id === currentStage);
    if (idx !== -1 && idx < PIPELINE_STAGES.length - 2) {
      return PIPELINE_STAGES[idx + 1].id;
    }
    return null;
  };

  const getPrevStage = (currentStage: string) => {
    const idx = PIPELINE_STAGES.findIndex((s) => s.id === currentStage);
    if (idx > 0 && idx < PIPELINE_STAGES.length - 1) {
      return PIPELINE_STAGES[idx - 1].id;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Sector Quick Filters */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-1">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-xs text-muted-foreground mr-1 font-medium">Filter Sector:</span>
          {sectors.map((sec) => (
            <button
              key={sec}
              data-testid={`pipeline-sector-filter-${sec.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              onClick={() => setActiveFilterSector(sec)}
              className={`px-2.5 py-1 text-xs rounded-md transition-all font-medium ${
                activeFilterSector === sec
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        <div className="text-xs text-muted-foreground font-mono">
          Showing {filteredDeals.length} Opportunities
        </div>
      </div>

      {/* Horizontal Scrollable Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 min-h-[550px]">
        {PIPELINE_STAGES.map((stage) => {
          const stageDeals = filteredDeals.filter((d) => d.stage === stage.id);
          const stageEV = stageDeals.reduce((sum, d) => sum + d.enterprise_value, 0);

          return (
            <div
              key={stage.id}
              data-testid={`pipeline-stage-column-${stage.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              className="flex-shrink-0 w-80 bg-muted/20 border border-border/70 rounded-xl p-3 flex flex-col max-h-[750px]"
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-xs px-2 py-0.5 font-semibold ${stage.color}`}>
                    {stage.label}
                  </Badge>
                  <span className="text-xs font-mono text-muted-foreground font-bold">
                    ({stageDeals.length})
                  </span>
                </div>
                <span className="text-xs font-mono font-semibold text-emerald-400">
                  ${stageEV.toFixed(1)}M
                </span>
              </div>

              {/* Deal Cards list */}
              <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                {stageDeals.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center border border-dashed border-border/50 rounded-lg text-muted-foreground text-xs">
                    <span>No active deals</span>
                  </div>
                ) : (
                  stageDeals.map((deal) => {
                    const nextStage = getNextStage(deal.stage);
                    const prevStage = getPrevStage(deal.stage);

                    return (
                      <Card
                        key={deal.id}
                        data-testid={`deal-card-${deal.id}`}
                        className="bg-card border-border/80 hover:border-emerald-500/50 hover:shadow-md transition-all duration-150 cursor-pointer group"
                        onClick={() => onSelectDeal(deal)}
                      >
                        <CardContent className="p-3.5 space-y-2.5">
                          {/* Target & Sector */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="text-sm font-bold tracking-tight text-foreground group-hover:text-emerald-400 transition-colors line-clamp-1">
                                {deal.name}
                              </h4>
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Building className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{deal.target_company}</span>
                              </p>
                            </div>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">
                              {deal.sector.split("/")[0].trim()}
                            </Badge>
                          </div>

                          {/* Financial Multiples & EV */}
                          <div className="grid grid-cols-2 gap-2 bg-muted/40 p-2 rounded-md border border-border/40 text-xs">
                            <div>
                              <span className="text-[10px] text-muted-foreground block">Enterprise Val</span>
                              <span className="font-mono font-bold text-foreground">
                                ${deal.enterprise_value.toFixed(1)}M
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted-foreground block">EV / EBITDA</span>
                              <span className="font-mono font-bold text-emerald-400">
                                {deal.ebitda_multiple > 0 ? `${deal.ebitda_multiple.toFixed(1)}x` : "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted-foreground block">Revenue / EBITDA</span>
                              <span className="font-mono text-muted-foreground">
                                ${deal.revenue.toFixed(1)}M / ${deal.ebitda.toFixed(1)}M
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted-foreground block">Lead Partner</span>
                              <span className="text-muted-foreground font-medium truncate block">
                                {deal.lead_partner}
                              </span>
                            </div>
                          </div>

                          {/* Probability Bar */}
                          <div>
                            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                              <span>Probability</span>
                              <span className="font-mono font-semibold">{deal.probability_pct}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${deal.probability_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* Action Footers */}
                          <div 
                            className="flex items-center justify-between pt-1 border-t border-border/40 text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center gap-1">
                              {prevStage && (
                                <Button
                                  data-testid={`btn-prev-stage-${deal.id}`}
                                  variant="ghost"
                                  size="icon-xs"
                                  onClick={() => onStageChange(deal.id, prevStage)}
                                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                  title={`Move back to ${prevStage}`}
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </Button>
                              )}
                              {nextStage && (
                                <Button
                                  data-testid={`btn-next-stage-${deal.id}`}
                                  variant="outline"
                                  size="xs"
                                  onClick={() => onStageChange(deal.id, nextStage)}
                                  className="h-6 text-[11px] px-2 gap-1 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                                  title={`Advance to ${nextStage}`}
                                >
                                  <span>Advance</span>
                                  <ChevronRight className="w-3 h-3" />
                                </Button>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              {onGenerateMemo && (
                                <Button
                                  data-testid={`btn-memo-deal-${deal.id}`}
                                  variant="ghost"
                                  size="icon-xs"
                                  onClick={() => onGenerateMemo(deal)}
                                  className="h-6 w-6 text-muted-foreground hover:text-purple-400"
                                  title="Generate AI Investment Memo"
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                                </Button>
                              )}
                              <Button
                                data-testid={`btn-dcf-deal-${deal.id}`}
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => onOpenDCF(deal)}
                                className="h-6 w-6 text-muted-foreground hover:text-emerald-400"
                                title="Analyze in DCF Model"
                              >
                                <Calculator className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                data-testid={`btn-delete-deal-${deal.id}`}
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => onDeleteDeal(deal.id)}
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                title="Delete Deal"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
