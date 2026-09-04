import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { KPICards } from "@/components/dashboard/KPICards";
import { ExecutiveOverview } from "@/components/dashboard/ExecutiveOverview";
import { DealPipeline } from "@/components/dashboard/DealPipeline";
import { ValuationDCFEstimator } from "@/components/dashboard/ValuationDCFEstimator";
import { CashRunwayAnalytics } from "@/components/dashboard/CashRunwayAnalytics";
import { EBITDAAdjustmentsSchedule } from "@/components/dashboard/EBITDAAdjustmentsSchedule";
import { DealsTable } from "@/components/dashboard/DealsTable";
import { DealIntakeModal } from "@/components/dashboard/DealIntakeModal";
import { DealDetailModal } from "@/components/dashboard/DealDetailModal";
import { Toaster } from "@/components/ui/sonner";
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "@/lib/api";
import type { Deal, DealCreate, DealUpdate, FinancialOverview, CashRunwayResponse } from "@/lib/types";
import { toast } from "sonner";

// Static fallback seed data in case preview is served statically without backend (TEMPLATE.md §4)
const FALLBACK_DEALS: Deal[] = [
  {
    id: "demo-1",
    name: "Apex Cloud Security Acquisition",
    target_company: "ApexSecure Technologies Inc.",
    sector: "SaaS / Cybersecurity",
    deal_type: "100% Buyout",
    stage: "Due Diligence",
    enterprise_value: 48.5,
    revenue: 14.2,
    ebitda: 4.2,
    ebitda_multiple: 11.5,
    lead_partner: "Marcus Vance",
    probability_pct: 75,
    cash_required: 34.0,
    target_close_date: "2025-08-30",
    notes: "Leading Zero-Trust identity platform with 128% Net Revenue Retention. QoE audit underway with EY.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-2",
    name: "NexaPay Embedded Core Buyout",
    target_company: "NexaPay Solutions Corp",
    sector: "FinTech / Payments",
    deal_type: "Majority Acquisition (80%)",
    stage: "LOI / Exclusivity",
    enterprise_value: 85.0,
    revenue: 28.0,
    ebitda: 8.5,
    ebitda_multiple: 10.0,
    lead_partner: "Sarah Chen",
    probability_pct: 65,
    cash_required: 55.0,
    target_close_date: "2025-10-15",
    notes: "Exclusive 45-day window signed. High gross margins (78%), expanding into LATAM cross-border.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-3",
    name: "BioStream AI Diagnostics Growth",
    target_company: "BioStream Life Sciences",
    sector: "HealthTech",
    deal_type: "Growth Equity",
    stage: "IOI Submitted",
    enterprise_value: 32.0,
    revenue: 9.5,
    ebitda: 2.4,
    ebitda_multiple: 13.3,
    lead_partner: "Elena Rostova",
    probability_pct: 45,
    cash_required: 16.0,
    target_close_date: "2025-11-20",
    notes: "FDA cleared pathology AI diagnostics platform. 3 enterprise contracts pending.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-4",
    name: "CloudScale DataOps Platform",
    target_company: "CloudScale Systems",
    sector: "SaaS / Cloud",
    deal_type: "100% Buyout",
    stage: "Definitive Docs",
    enterprise_value: 115.0,
    revenue: 36.0,
    ebitda: 9.6,
    ebitda_multiple: 12.0,
    lead_partner: "Marcus Vance",
    probability_pct: 90,
    cash_required: 78.0,
    target_close_date: "2025-07-28",
    notes: "Final purchase agreement circulating. HSR clearance received.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-5",
    name: "Veloce Industrial Robotics",
    target_company: "Veloce Automation AG",
    sector: "Industrial IoT",
    deal_type: "Majority Acquisition (70%)",
    stage: "Initial Review",
    enterprise_value: 64.0,
    revenue: 22.0,
    ebitda: 5.8,
    ebitda_multiple: 11.0,
    lead_partner: "David Kim",
    probability_pct: 30,
    cash_required: 42.0,
    target_close_date: "2025-12-15",
    notes: "Warehouse automation robotics in DACH region.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function Home() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [searchTerm, setSearchTerm] = useState<string>("" );

  // Modals state
  const [isIntakeOpen, setIsIntakeOpen] = useState<boolean>(false);
  const [dealToEdit, setDealToEdit] = useState<Deal | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [dcfSelectedDeal, setDcfSelectedDeal] = useState<Deal | null>(null);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);

  // Queries
  const { data: dealsData, isLoading: isDealsLoading } = useQuery<Deal[]>({
    queryKey: ["deals"],
    queryFn: () => apiGet<Deal[]>("/deals"),
  });

  const { data: overviewData } = useQuery<FinancialOverview>({
    queryKey: ["financial-overview"],
    queryFn: () => apiGet<FinancialOverview>("/financials/overview"),
  });

  const { data: runwayData } = useQuery<CashRunwayResponse>({
    queryKey: ["cash-runway"],
    queryFn: () => apiGet<CashRunwayResponse>("/financials/runway"),
  });

  const deals = dealsData ?? FALLBACK_DEALS;

  // Mutations
  const createDealMutation = useMutation({
    mutationFn: (newDeal: DealCreate) => apiPost<Deal>("/deals", newDeal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["financial-overview"] });
      toast.success("Deal opportunity created successfully");
    },
    onError: (err: any) => {
      toast.error("Failed to create deal: " + (err.message || "Error"));
    },
  });

  const updateDealMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DealUpdate }) => apiPut<Deal>(`/deals/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["financial-overview"] });
      toast.success("Deal updated successfully");
    },
    onError: (err: any) => {
      toast.error("Failed to update deal: " + (err.message || "Error"));
    },
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) =>
      apiPatch<Deal>(`/deals/${id}/stage`, { stage }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["financial-overview"] });
      toast.success(`Deal moved to ${variables.stage}`);
    },
    onError: (err: any) => {
      toast.error("Failed to update stage: " + (err.message || "Error"));
    },
  });

  const deleteDealMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/deals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["financial-overview"] });
      toast.success("Deal deleted from pipeline");
    },
    onError: (err: any) => {
      toast.error("Failed to delete deal: " + (err.message || "Error"));
    },
  });

  const handleResetSeed = async () => {
    setIsSeeding(true);
    try {
      await apiPost("/financials/seed-data", {});
      await queryClient.invalidateQueries({ queryKey: ["deals"] });
      await queryClient.invalidateQueries({ queryKey: ["financial-overview"] });
      await queryClient.invalidateQueries({ queryKey: ["cash-runway"] });
      await queryClient.invalidateQueries({ queryKey: ["ebitda-adjustments"] });
      toast.success("Pipeline database refreshed with institutional mock deals");
    } catch {
      toast.error("Failed to seed data");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleDealIntakeSubmit = async (formData: DealCreate | DealUpdate, isEdit: boolean) => {
    if (isEdit && dealToEdit) {
      await updateDealMutation.mutateAsync({ id: dealToEdit.id, data: formData });
    } else {
      await createDealMutation.mutateAsync(formData as DealCreate);
    }
  };

  const handleOpenDCF = (deal: Deal) => {
    setDcfSelectedDeal(deal);
    setActiveTab("valuation");
    toast.info(`Loaded "${deal.name}" into Valuation & DCF Estimator`);
  };

  const handleEditDeal = (deal: Deal) => {
    setDealToEdit(deal);
    setIsIntakeOpen(true);
  };

  const handleDeleteDeal = (id: string) => {
    deleteDealMutation.mutate(id);
  };

  const handleStageChange = (id: string, stage: string) => {
    updateStageMutation.mutate({ id, stage });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Toaster position="top-right" richColors />

      {/* Top Navigation */}
      <Navbar
        onNewDealClick={() => {
          setDealToEdit(null);
          setIsIntakeOpen(true);
        }}
        onResetSeed={handleResetSeed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isSeeding={isSeeding}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Executive KPI Cards always visible at top */}
        <KPICards overview={overviewData} isLoading={isDealsLoading} />

        {/* Tab Content Panes */}
        <div className="pt-2">
          {activeTab === "overview" && (
            <ExecutiveOverview
              overview={overviewData}
              deals={deals}
              onSelectDeal={(d) => setSelectedDeal(d)}
              onOpenDCF={handleOpenDCF}
              onNavigateTab={(t) => setActiveTab(t)}
              onNewDealClick={() => {
                setDealToEdit(null);
                setIsIntakeOpen(true);
              }}
            />
          )}

          {activeTab === "pipeline" && (
            <div className="space-y-4">
              <DealPipeline
                deals={deals}
                onStageChange={handleStageChange}
                onSelectDeal={(d) => setSelectedDeal(d)}
                onOpenDCF={handleOpenDCF}
                onDeleteDeal={handleDeleteDeal}
              />
            </div>
          )}

          {activeTab === "valuation" && (
            <div className="space-y-4">
              <ValuationDCFEstimator
                deals={deals}
                initialDeal={dcfSelectedDeal}
              />
            </div>
          )}

          {activeTab === "runway" && (
            <div className="space-y-4">
              <CashRunwayAnalytics initialRunway={runwayData} />
            </div>
          )}

          {activeTab === "ebitda" && (
            <div className="space-y-4">
              <EBITDAAdjustmentsSchedule />
            </div>
          )}

          {activeTab === "deals" && (
            <div className="space-y-4">
              <DealsTable
                deals={deals}
                onSelectDeal={(d) => setSelectedDeal(d)}
                onEditDeal={handleEditDeal}
                onDeleteDeal={handleDeleteDeal}
                onOpenDCF={handleOpenDCF}
                onStageChange={handleStageChange}
                onNewDealClick={() => {
                  setDealToEdit(null);
                  setIsIntakeOpen(true);
                }}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-5 bg-muted/10 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">DealCFO</span>
            <span>•</span>
            <span>M&A Valuation & CFO Intelligence Engine</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Server: FastAPI v0.115 / Python 3.11</span>
            <span>•</span>
            <span>Client: React 19 / Vite</span>
          </div>
        </div>
      </footer>

      {/* Deal Intake & Edit Modal */}
      <DealIntakeModal
        isOpen={isIntakeOpen}
        onClose={() => {
          setIsIntakeOpen(false);
          setDealToEdit(null);
        }}
        onSubmit={handleDealIntakeSubmit}
        dealToEdit={dealToEdit}
      />

      {/* Deal Detail Deep-Dive Dialog */}
      <DealDetailModal
        deal={selectedDeal}
        isOpen={!!selectedDeal}
        onClose={() => setSelectedDeal(null)}
        onEdit={handleEditDeal}
        onDelete={handleDeleteDeal}
        onOpenDCF={handleOpenDCF}
        onStageChange={(id, stage) => {
          handleStageChange(id, stage);
          if (selectedDeal) {
            setSelectedDeal({ ...selectedDeal, stage });
          }
        }}
      />
    </div>
  );
}
