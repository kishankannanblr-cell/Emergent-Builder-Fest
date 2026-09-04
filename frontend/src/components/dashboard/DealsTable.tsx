import React, { useState } from "react";
import { 
  Building, 
  Search, 
  ArrowUpDown, 
  Calculator, 
  Edit3, 
  Trash2, 
  Download, 
  Plus 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Deal } from "@/lib/types";
import { toast } from "sonner";

interface DealsTableProps {
  deals: Deal[];
  onSelectDeal: (deal: Deal) => void;
  onEditDeal: (deal: Deal) => void;
  onDeleteDeal: (id: string) => void;
  onOpenDCF: (deal: Deal) => void;
  onStageChange: (id: string, stage: string) => void;
  onNewDealClick: () => void;
}

export const DealsTable: React.FC<DealsTableProps> = ({
  deals,
  onSelectDeal,
  onEditDeal,
  onDeleteDeal,
  onOpenDCF,
  onStageChange,
  onNewDealClick,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStage, setSelectedStage] = useState("All");
  const [selectedSector, setSelectedSector] = useState("All");
  const [sortField, setSortField] = useState<keyof Deal>("enterprise_value");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const sectors = ["All", "SaaS / Cybersecurity", "FinTech / Payments", "HealthTech", "SaaS / Cloud", "Industrial IoT", "CleanTech / Energy", "MarTech / SaaS", "Defense & Aerospace"];
  const stages = ["All", "Lead Sourcing", "Initial Review", "NDA Signed", "CIM Review", "IOI Submitted", "LOI / Exclusivity", "Due Diligence", "Definitive Docs", "Closed Won", "Passed"];

  const handleSort = (field: keyof Deal) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      deal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.target_company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.lead_partner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.sector.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage = selectedStage === "All" || deal.stage === selectedStage;
    const matchesSector = selectedSector === "All" || deal.sector.includes(selectedSector);

    return matchesSearch && matchesStage && matchesSector;
  });

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (typeof valA === "string") {
      valA = (valA as string).toLowerCase();
      valB = (valB as string).toLowerCase();
    }

    if (valA! < valB!) return sortOrder === "asc" ? -1 : 1;
    if (valA! > valB!) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const exportCSV = () => {
    if (deals.length === 0) {
      toast.error("No deals to export");
      return;
    }
    const headers = ["ID", "Name", "Target Company", "Sector", "Deal Type", "Stage", "EV ($M)", "Revenue ($M)", "EBITDA ($M)", "EV/EBITDA", "Lead Partner", "Probability (%)", "Close Date"];
    const rows = sortedDeals.map((d) => [
      d.id,
      `"${d.name}"`,
      `"${d.target_company}"`,
      `"${d.sector}"`,
      `"${d.deal_type}"`,
      `"${d.stage}"`,
      d.enterprise_value,
      d.revenue,
      d.ebitda,
      d.ebitda_multiple,
      `"${d.lead_partner}"`,
      d.probability_pct,
      d.target_close_date,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DealCFO_Pipeline_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported pipeline CSV");
  };

  const getStageBadgeClass = (stage: string) => {
    switch (stage) {
      case "Closed Won":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "Passed":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "Due Diligence":
      case "Definitive Docs":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      default:
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbars */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-muted/20 border border-border/80 p-3.5 rounded-xl">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              data-testid="deals-table-search"
              placeholder="Filter deals, targets, partners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-xs bg-muted/50"
            />
          </div>

          {/* Sector Filter */}
          <div className="flex items-center gap-1">
            <select
              data-testid="deals-filter-sector"
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="h-8 text-xs bg-muted/60 border border-border rounded-md px-2.5 text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {`Sector: ${s}`}
                </option>
              ))}
            </select>
          </div>

          {/* Stage Filter */}
          <div className="flex items-center gap-1">
            <select
              data-testid="deals-filter-stage"
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="h-8 text-xs bg-muted/60 border border-border rounded-md px-2.5 text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {stages.map((st) => (
                <option key={st} value={st}>
                  {`Stage: ${st}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2">
          <Button
            data-testid="deals-export-csv-btn"
            variant="outline"
            size="sm"
            onClick={exportCSV}
            className="h-8 text-xs gap-1.5 border-border/80"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>

          <Button
            data-testid="deals-table-new-btn"
            size="sm"
            onClick={onNewDealClick}
            className="h-8 text-xs gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Intake Opportunity</span>
          </Button>
        </div>
      </div>

      {/* Deals Datatable */}
      <Card className="border-border/80 bg-card/60">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 border-y border-border/60 text-muted-foreground font-semibold">
              <tr>
                <th className="p-3 cursor-pointer hover:text-foreground" onClick={() => handleSort("name")}>
                  <div className="flex items-center gap-1">
                    <span>Deal / Target Entity</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3">Sector & Type</th>
                <th className="p-3">Stage</th>
                <th className="p-3 font-mono cursor-pointer hover:text-foreground" onClick={() => handleSort("enterprise_value")}>
                  <div className="flex items-center gap-1">
                    <span>EV ($M)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3 font-mono cursor-pointer hover:text-foreground" onClick={() => handleSort("ebitda_multiple")}>
                  <div className="flex items-center gap-1">
                    <span>EV/EBITDA</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3 font-mono">Rev / EBITDA</th>
                <th className="p-3">Lead Partner</th>
                <th className="p-3 font-mono cursor-pointer hover:text-foreground" onClick={() => handleSort("probability_pct")}>
                  <div className="flex items-center gap-1">
                    <span>Probability</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {sortedDeals.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground">
                    No deal opportunities found matching your criteria.
                  </td>
                </tr>
              ) : (
                sortedDeals.map((deal) => (
                  <tr 
                    key={deal.id}
                    data-testid={`table-row-deal-${deal.id}`}
                    className="hover:bg-muted/20 transition-colors group cursor-pointer"
                    onClick={() => onSelectDeal(deal)}
                  >
                    {/* Deal Name & Target */}
                    <td className="p-3 max-w-[220px]">
                      <span className="font-bold text-foreground group-hover:text-emerald-400 transition-colors block truncate">
                        {deal.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                        <Building className="w-3 h-3 flex-shrink-0" />
                        {deal.target_company}
                      </span>
                    </td>

                    {/* Sector & Type */}
                    <td className="p-3">
                      <span className="font-medium text-foreground block">{deal.sector}</span>
                      <span className="text-[10px] text-muted-foreground block">{deal.deal_type}</span>
                    </td>

                    {/* Stage with Inline Quick Change */}
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        data-testid={`table-stage-select-${deal.id}`}
                        value={deal.stage}
                        onChange={(e) => onStageChange(deal.id, e.target.value)}
                        className={`text-[11px] font-semibold rounded px-2 py-0.5 border bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500 ${getStageBadgeClass(
                          deal.stage
                        )}`}
                      >
                        <option value="Lead Sourcing" className="bg-card text-foreground">Lead Sourcing</option>
                        <option value="Initial Review" className="bg-card text-foreground">Initial Review</option>
                        <option value="NDA Signed" className="bg-card text-foreground">NDA Signed</option>
                        <option value="CIM Review" className="bg-card text-foreground">CIM Review</option>
                        <option value="IOI Submitted" className="bg-card text-foreground">IOI Submitted</option>
                        <option value="LOI / Exclusivity" className="bg-card text-foreground">LOI / Exclusivity</option>
                        <option value="Due Diligence" className="bg-card text-foreground">Due Diligence</option>
                        <option value="Definitive Docs" className="bg-card text-foreground">Definitive Docs</option>
                        <option value="Closed Won" className="bg-card text-foreground">Closed Won</option>
                        <option value="Passed" className="bg-card text-foreground">Passed</option>
                      </select>
                    </td>

                    {/* EV ($M) */}
                    <td className="p-3 font-mono font-bold text-foreground">
                      ${deal.enterprise_value.toFixed(1)}M
                    </td>

                    {/* Multiple */}
                    <td className="p-3 font-mono font-bold text-emerald-400">
                      {deal.ebitda_multiple > 0 ? `${deal.ebitda_multiple.toFixed(1)}x` : "--"}
                    </td>

                    {/* Rev / EBITDA */}
                    <td className="p-3 font-mono text-muted-foreground">
                      ${deal.revenue.toFixed(1)}M / ${deal.ebitda.toFixed(1)}M
                    </td>

                    {/* Lead Partner */}
                    <td className="p-3 font-medium text-muted-foreground">
                      {deal.lead_partner}
                    </td>

                    {/* Probability */}
                    <td className="p-3 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-foreground">{deal.probability_pct}%</span>
                        <div className="w-12 bg-muted rounded-full h-1 overflow-hidden hidden sm:block">
                          <div className="bg-emerald-500 h-1" style={{ width: `${deal.probability_pct}%` }} />
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          data-testid={`table-btn-dcf-${deal.id}`}
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => onOpenDCF(deal)}
                          className="h-6 w-6 text-muted-foreground hover:text-emerald-400"
                          title="Simulate DCF"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          data-testid={`table-btn-edit-${deal.id}`}
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => onEditDeal(deal)}
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          title="Edit Deal"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          data-testid={`table-btn-delete-${deal.id}`}
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => onDeleteDeal(deal.id)}
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          title="Delete Deal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
