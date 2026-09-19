import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Edit3, 
  FileSpreadsheet, 
  UploadCloud, 
  Sparkles, 
  Download, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import type { 
  Deal, 
  DealCreate, 
  DealUpdate, 
  PLImportResponse, 
  DealWithAdjustmentsCreate,
  PresetTemplate 
} from "@/lib/types";
import { apiPost, apiGet } from "@/lib/api";
import { toast } from "sonner";

interface DealIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dealData: DealCreate | DealUpdate | DealWithAdjustmentsCreate, isEdit: boolean) => Promise<void>;
  dealToEdit?: Deal | null;
}

const SAMPLE_CSV_TEMPLATE = `Account Name,Category,Amount
Recurring Platform Subscriptions (ARR),Revenue,14500000
Implementation & Professional Services,Revenue,1500000
Hosting & Cloud AWS Infrastructure,COGS,2400000
Tier-2 Technical Customer Support,COGS,900000
Enterprise Sales & Marketing Payroll,OpEx,4200000
Core R&D Software Engineering,OpEx,3100000
General & Administrative Overhead,OpEx,1200000
Founder Above-Market Salary Excess,Owner Compensation,350000
Legacy Data Center Dual Hosting Migration,One-Time Expense,280000
Discontinued Beta Product Tooling Burn,One-Time Expense,190000
Depreciation & Equipment Amortization,D&A,550000`;

const DEFAULT_PRESETS: PresetTemplate[] = [
  {
    id: "saas-cloudmetrics",
    title: "CloudMetrics B2B SaaS",
    tagline: "Enterprise Observability & DevSecOps Platform (124% NRR)",
    sector: "SaaS / Enterprise Software",
    target_company: "CloudMetrics Systems Inc.",
    enterprise_value: 55.0,
    revenue: 15.4,
    cogs: 2.9,
    opex: 8.7,
    unadjusted_ebitda: 3.8,
    addbacks_total: 0.82,
    adjusted_ebitda: 4.62,
    default_wacc: 9.8,
    default_exit_multiple: 14.5,
    csv_content: SAMPLE_CSV_TEMPLATE,
    addbacks: [
      { name: "Founder Above-Market Compensation", category: "Owner Compensation", amount: 0.35, rationale: "Normalize founder comp ($700k) to middle-market CEO benchmark ($350k)." },
      { name: "Legacy Monolith to AWS EKS Migration", category: "One-Time Technology", amount: 0.28, rationale: "Non-recurring 6-month dual hosting costs incurred during cloud transition." },
      { name: "Discontinued Dev Tools Beta Line", category: "Discontinued Operations", amount: 0.19, rationale: "Isolated development burn for deprecated consumer tooling experiment." }
    ]
  },
  {
    id: "medtech-cardiopulse",
    title: "CardioPulse MedTech Diagnostics",
    tagline: "AI-Assisted Remote Patient Monitoring & Clinic Network",
    sector: "Healthcare / MedTech",
    target_company: "CardioPulse Healthcare Corp",
    enterprise_value: 95.0,
    revenue: 28.2,
    cogs: 16.5,
    opex: 4.3,
    unadjusted_ebitda: 7.4,
    addbacks_total: 0.75,
    adjusted_ebitda: 8.15,
    default_wacc: 8.9,
    default_exit_multiple: 13.0,
    csv_content: `Account Name,Category,Amount\nClinical Diagnostic Billing & Receipts,Revenue,24500000\nRemote Monitoring Software Licensing,Revenue,3700000\nMedical Devices & Consumable Sensor Supplies,COGS,12800000\nClinic Nursing & Technician Operations,COGS,3700000\nSpecialist Sales & Hospital Outreach,OpEx,2400000\nRegulatory Compliance & Quality Assurance,OpEx,1100000\nCorporate Administration & Facilities,OpEx,800000\nFDA / HIPAA Audit Advisory Retainers,One-Time Expense,420000\nClinic Consolidation Severance Packages,One-Time Expense,330000\nMedical Device Depreciation,D&A,850000`,
    addbacks: [
      { name: "FDA / HIPAA Audit Advisory Retainers", category: "Regulatory & Legal", amount: 0.42, rationale: "One-off external audit preparation fees for 510(k) clearance." },
      { name: "Clinic Consolidation Severance Packages", category: "Restructuring", amount: 0.33, rationale: "One-time severance payouts following the integration of 2 regional clinics." }
    ]
  },
  {
    id: "consumer-apexd2c",
    title: "ApexDirect Omnichannel Brands",
    tagline: "High-Growth Consumer Wellness & Wholesale Distribution",
    sector: "Consumer / E-Commerce",
    target_company: "ApexDirect Brand Holdings",
    enterprise_value: 14.5,
    revenue: 8.5,
    cogs: 4.2,
    opex: 2.8,
    unadjusted_ebitda: 1.5,
    addbacks_total: 0.36,
    adjusted_ebitda: 1.86,
    default_wacc: 11.8,
    default_exit_multiple: 8.5,
    csv_content: `Account Name,Category,Amount\nShopify Direct-to-Consumer Sales,Revenue,5400000\nTarget & Specialty Wholesale Purchase Orders,Revenue,3100000\nContract Manufacturing & Formulation,COGS,2900000\nFulfillment Logistics & 3PL Warehousing,COGS,1300000\nDigital Performance Marketing & Ad Spend,OpEx,1900000\nBrand Team & Operations,OpEx,900000\nOcean Freight Spot Surcharge Spike,One-Time Expense,240000\nLegacy Agency Contract Termination Fee,One-Time Expense,120000\nWarehouse Equipment Depreciation,D&A,180000`,
    addbacks: [
      { name: "Ocean Freight Spot Surcharge Spike", category: "Supply Chain Anomalies", amount: 0.24, rationale: "Historical spot shipping spike exceeding normalized contract freight rates." },
      { name: "Legacy Agency Contract Termination Fee", category: "Marketing Restructuring", amount: 0.12, rationale: "One-time contractual penalty to bring digital marketing in-house." }
    ]
  }
];

function parseCsvClientSide(csvText: string, askingEv: number, company: string, sector: string): PLImportResponse {
  const lines = csvText.split("\n").map(l => l.trim()).filter(Boolean);
  let rev = 0;
  let cogs = 0;
  let opex = 0;
  let da = 0;
  const addbacks: Array<{ name: string; category: string; amount: number; rationale: string }> = [];
  let count = 0;

  for (let i = 0; i < lines.length; i++) {
    const parts = lines[i].split(",").map(p => p.trim());
    if (parts.length < 2) continue;
    if (i === 0 && (parts[0].toLowerCase().includes("account") || parts[0].toLowerCase().includes("name"))) continue;

    const name = parts[0];
    const cat = (parts.length >= 3 ? parts[1] : "").toLowerCase();
    const rawAmt = parts.length >= 3 ? parts[2] : parts[1];
    const cleaned = parseFloat(rawAmt.replace(/[^0-9.-]/g, ""));
    if (isNaN(cleaned)) continue;

    count++;
    const amtM = Math.abs(cleaned) >= 50000 ? cleaned / 1000000 : cleaned;
    const nLow = name.toLowerCase();

    if (cat.includes("revenue") || nLow.includes("revenue") || nLow.includes("arr") || nLow.includes("sales") || nLow.includes("subscription")) {
      rev += amtM;
    } else if (cat.includes("cogs") || nLow.includes("cogs") || nLow.includes("hosting") || nLow.includes("cloud") || nLow.includes("supplies") || nLow.includes("manufacturing")) {
      cogs += amtM;
    } else if (cat.includes("d&a") || nLow.includes("depreciation") || nLow.includes("amortization")) {
      da += amtM;
    } else if (cat.includes("owner") || nLow.includes("founder") || nLow.includes("owner comp") || nLow.includes("ceo salary")) {
      opex += amtM;
      addbacks.push({
        name,
        category: "Owner Compensation",
        amount: Math.round((amtM > 0.5 ? amtM * 0.5 : amtM) * 100) / 100,
        rationale: "Normalize executive compensation down to middle-market CEO benchmark standard."
      });
    } else if (cat.includes("one-time") || cat.includes("non-recurring") || nLow.includes("migration") || nLow.includes("severance") || nLow.includes("one-time") || nLow.includes("audit") || nLow.includes("lawsuit") || nLow.includes("surcharge")) {
      opex += amtM;
      addbacks.push({
        name,
        category: "One-Time Expense",
        amount: Math.round(amtM * 100) / 100,
        rationale: "Identified non-recurring transitional operating expense."
      });
    } else {
      opex += amtM;
    }
  }

  const grossProfit = Math.round((rev - cogs) * 100) / 100;
  const gmPct = rev > 0 ? Math.round((grossProfit / rev) * 1000) / 10 : 0;
  const unadjEbitda = Math.round((grossProfit - opex) * 100) / 100;
  const unadjMargin = rev > 0 ? Math.round((unadjEbitda / rev) * 1000) / 10 : 0;
  const totalAddbacks = Math.round(addbacks.reduce((s, a) => s + a.amount, 0) * 100) / 100;
  const adjEbitda = Math.round((unadjEbitda + totalAddbacks) * 100) / 100;
  const adjMargin = rev > 0 ? Math.round((adjEbitda / rev) * 1000) / 10 : 0;
  const multiple = adjEbitda > 0 ? Math.round((askingEv / adjEbitda) * 10) / 10 : 10;

  return {
    company_name: company,
    sector,
    revenue: Math.round(rev * 100) / 100,
    cogs: Math.round(cogs * 100) / 100,
    gross_profit: grossProfit,
    gross_margin_pct: gmPct,
    operating_expenses: Math.round(opex * 100) / 100,
    da: Math.round(da * 100) / 100,
    unadjusted_ebitda: unadjEbitda,
    unadjusted_ebitda_margin_pct: unadjMargin,
    suggested_addbacks: addbacks,
    total_addbacks: totalAddbacks,
    adjusted_ebitda: adjEbitda,
    adjusted_ebitda_margin_pct: adjMargin,
    implied_ev_ebitda_multiple: multiple,
    parsed_rows_count: count
  };
}

export const DealIntakeModal: React.FC<DealIntakeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  dealToEdit = null,
}) => {
  const isEdit = !!dealToEdit;
  const [activeMode, setActiveMode] = useState<"manual" | "csv" | "presets">(isEdit ? "manual" : "presets");

  // Manual Form State
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

  // CSV Ingestion State
  const [csvCompany, setCsvCompany] = useState<string>("CloudOps Systems");
  const [csvSector, setCsvSector] = useState<string>("SaaS / Cybersecurity");
  const [csvDealType, setCsvDealType] = useState<string>("100% Buyout");
  const [csvAskingEV, setCsvAskingEV] = useState<number>(55.0);
  const [csvLeadPartner, setCsvLeadPartner] = useState<string>("Marcus Vance");
  const [csvText, setCsvText] = useState<string>(SAMPLE_CSV_TEMPLATE);
  const [parsedData, setParsedData] = useState<PLImportResponse | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [selectedAddbacks, setSelectedAddbacks] = useState<Record<number, boolean>>({});

  // Presets State initialized with default benchmarks
  const [presets, setPresets] = useState<PresetTemplate[]>(DEFAULT_PRESETS);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("saas-cloudmetrics");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch preset templates on open or use defaults
  useEffect(() => {
    if (isOpen) {
      apiGet<PresetTemplate[]>("/financials/preset-templates")
        .then((data) => {
          if (data && data.length > 0) {
            setPresets(data);
          }
        })
        .catch(() => {
          setPresets(DEFAULT_PRESETS);
        });

      // Auto-load default preset
      handleSelectPreset(DEFAULT_PRESETS[0]);
    }
  }, [isOpen]);


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
      setActiveMode("manual");
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

  // Recalculate implied multiple live for manual mode
  const impliedMultiple = formData.ebitda > 0
    ? (formData.enterprise_value / formData.ebitda).toFixed(1)
    : "0.0";

  // Handle Manual Form Submit
  const handleManualSubmit = async (e: React.FormEvent) => {
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

  // Download Sample Template CSV
  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV_TEMPLATE], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "deal_financials_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloaded sample P&L template CSV");
  };

  // Parse CSV
  const handleParseCsv = async () => {
    if (!csvText.trim()) {
      toast.error("Please paste or upload CSV content");
      return;
    }
    setIsParsing(true);
    try {
      const res = await apiPost<PLImportResponse>("/financials/parse-pl", {
        company_name: csvCompany,
        sector: csvSector,
        deal_type: csvDealType,
        asking_price_ev: csvAskingEV,
        lead_partner: csvLeadPartner,
        csv_text: csvText,
      });
      setParsedData(res);
      // Select all addbacks by default
      const initialMap: Record<number, boolean> = {};
      res.suggested_addbacks.forEach((_, idx) => {
        initialMap[idx] = true;
      });
      setSelectedAddbacks(initialMap);
      toast.success(`Successfully parsed ${res.parsed_rows_count} line items!`);
    } catch {
      // Robust client-side fallback
      const fallbackParsed = parseCsvClientSide(csvText, csvAskingEV, csvCompany, csvSector);
      setParsedData(fallbackParsed);
      const initialMap: Record<number, boolean> = {};
      fallbackParsed.suggested_addbacks.forEach((_, idx) => {
        initialMap[idx] = true;
      });
      setSelectedAddbacks(initialMap);
      toast.success(`Parsed ${fallbackParsed.parsed_rows_count} line items (Financial Engine)`);
    } finally {
      setIsParsing(false);
    }

  };

  // Handle File Upload Dropzone
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvText(content);
        toast.info(`Loaded file: ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  // Handle CSV Ingest Submit
  const handleCsvSubmit = async () => {
    if (!parsedData) {
      toast.error("Please parse financial data first");
      return;
    }
    setIsSubmitting(true);
    try {
      const activeAddbacks = parsedData.suggested_addbacks.filter((_, idx) => selectedAddbacks[idx]);
      const addedBackAmount = activeAddbacks.reduce((sum, a) => sum + a.amount, 0);
      const finalAdjustedEbitda = roundNumber(parsedData.unadjusted_ebitda + addedBackAmount, 2);
      const multiple = finalAdjustedEbitda > 0 ? roundNumber(csvAskingEV / finalAdjustedEbitda, 1) : 10.0;

      const payload: DealWithAdjustmentsCreate = {
        name: `${csvCompany} Buyout`,
        target_company: csvCompany,
        sector: csvSector,
        deal_type: csvDealType,
        stage: "Due Diligence",
        enterprise_value: csvAskingEV,
        revenue: parsedData.revenue,
        ebitda: finalAdjustedEbitda,
        ebitda_multiple: multiple,
        lead_partner: csvLeadPartner,
        probability_pct: 65,
        cash_required: roundNumber(csvAskingEV * 0.65, 1),
        target_close_date: "2025-11-30",
        notes: `Imported via Financial P&L Ingestion. Raw Revenue: $${parsedData.revenue}M, Gross Margin: ${parsedData.gross_margin_pct}%, Normalized EBITDA: $${finalAdjustedEbitda}M with ${activeAddbacks.length} approved QoE adjustments.`,
        adjustments: activeAddbacks.map((a) => ({
          name: a.name,
          category: a.category,
          amount: a.amount,
          adjustment_type: "add_back",
          notes: a.rationale,
        })),
      };

      await onSubmit(payload, false);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle 1-Click Preset Load
  const handleSelectPreset = (preset: PresetTemplate) => {
    setSelectedPresetId(preset.id);
    setCsvCompany(preset.target_company);
    setCsvSector(preset.sector);
    setCsvDealType("100% Buyout");
    setCsvAskingEV(preset.enterprise_value);
    setCsvText(preset.csv_content);

    // Populate parsed data directly
    const impliedMult = preset.adjusted_ebitda > 0 
      ? roundNumber(preset.enterprise_value / preset.adjusted_ebitda, 1)
      : 10.0;

    const parsed: PLImportResponse = {
      company_name: preset.target_company,
      sector: preset.sector,
      revenue: preset.revenue,
      cogs: preset.cogs,
      gross_profit: roundNumber(preset.revenue - preset.cogs, 2),
      gross_margin_pct: roundNumber(((preset.revenue - preset.cogs) / preset.revenue) * 100, 1),
      operating_expenses: preset.opex,
      da: 0.5,
      unadjusted_ebitda: preset.unadjusted_ebitda,
      unadjusted_ebitda_margin_pct: roundNumber((preset.unadjusted_ebitda / preset.revenue) * 100, 1),
      suggested_addbacks: preset.addbacks,
      total_addbacks: preset.addbacks_total,
      adjusted_ebitda: preset.adjusted_ebitda,
      adjusted_ebitda_margin_pct: roundNumber((preset.adjusted_ebitda / preset.revenue) * 100, 1),
      implied_ev_ebitda_multiple: impliedMult,
      parsed_rows_count: 10,
    };
    setParsedData(parsed);

    const initialMap: Record<number, boolean> = {};
    preset.addbacks.forEach((_, idx) => {
      initialMap[idx] = true;
    });
    setSelectedAddbacks(initialMap);
  };

  const roundNumber = (num: number, dec: number) => {
    const factor = Math.pow(10, dec);
    return Math.round(num * factor) / factor;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-card border-border max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            {isEdit ? (
              <Edit3 className="w-5 h-5 text-emerald-400" />
            ) : (
              <Sparkles className="w-5 h-5 text-orange-400" />
            )}
            {isEdit ? "Edit Deal Parameters" : "Deal Ingestion & Underwriting Studio"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Ingest live company financials via raw P&L spreadsheet, 1-click realistic benchmark presets, or manual registration
          </DialogDescription>

          {/* Mode Selector Tabs */}
          {!isEdit && (
            <div className="flex items-center gap-1.5 p-1 bg-muted/50 rounded-lg border border-border/80 mt-2">
              <button
                type="button"
                onClick={() => setActiveMode("presets")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeMode === "presets"
                    ? "bg-background text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                <span>⚡ 1-Click Realistic Presets</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMode("csv")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeMode === "csv"
                    ? "bg-background text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>📂 Import P&L / CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMode("manual")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeMode === "manual"
                    ? "bg-background text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Plus className="w-3.5 h-3.5 text-blue-400" />
                <span>Manual Entry</span>
              </button>
            </div>
          )}
        </DialogHeader>

        {/* ========================================================================= */}
        {/* MODE 1: 1-CLICK REALISTIC PRESETS                                         */}
        {/* ========================================================================= */}
        {activeMode === "presets" && !isEdit && (
          <div className="space-y-4 py-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Select Benchmark Dataset (Curated Real-World Financials)
              </span>
              <span className="text-[11px] text-orange-400 font-medium">1-Click Live Processing</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {presets.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`cursor-pointer p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? "bg-orange-500/10 border-orange-500/50 shadow-sm ring-1 ring-orange-500/30"
                        : "bg-muted/30 border-border hover:bg-muted/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border">
                        {preset.sector.split("/")[0].trim()}
                      </Badge>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />}
                    </div>
                    <div className="font-bold text-xs text-foreground truncate">{preset.title}</div>
                    <div className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5 mb-2">
                      {preset.tagline}
                    </div>
                    <div className="pt-2 border-t border-border/60 grid grid-cols-2 gap-1 text-[11px] font-mono">
                      <div>
                        <span className="text-[9px] text-muted-foreground block">REV</span>
                        <span className="font-bold text-foreground">${preset.revenue}M</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-muted-foreground block">ADJ. EBITDA</span>
                        <span className="font-bold text-emerald-400">${preset.adjusted_ebitda}M</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Financial Metrics Summary Card */}
            {parsedData && (
              <div className="p-3.5 bg-muted/40 border border-border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-xs text-foreground">
                      Normalized Financial Engine Results: {parsedData.company_name}
                    </span>
                  </div>
                  <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[10px]">
                    {parsedData.implied_ev_ebitda_multiple}x EV/EBITDA Multiple
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-center">
                  <div className="p-2 rounded bg-background/60 border border-border/60">
                    <div className="text-[10px] text-muted-foreground">Revenue</div>
                    <div className="font-bold text-xs text-foreground">${parsedData.revenue}M</div>
                  </div>
                  <div className="p-2 rounded bg-background/60 border border-border/60">
                    <div className="text-[10px] text-muted-foreground">Gross Margin</div>
                    <div className="font-bold text-xs text-foreground">{parsedData.gross_margin_pct}%</div>
                  </div>
                  <div className="p-2 rounded bg-background/60 border border-border/60">
                    <div className="text-[10px] text-muted-foreground">Unadjusted EBITDA</div>
                    <div className="font-bold text-xs text-foreground">${parsedData.unadjusted_ebitda}M</div>
                  </div>
                  <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30">
                    <div className="text-[10px] text-emerald-400">Adj. EBITDA (QoE)</div>
                    <div className="font-bold text-xs text-emerald-300">${parsedData.adjusted_ebitda}M</div>
                  </div>
                </div>

                {/* Suggested Add-Backs */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    Included QoE Add-Backs ({parsedData.suggested_addbacks.length} detected)
                  </span>
                  <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                    {parsedData.suggested_addbacks.map((addback, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-1.5 bg-background/50 border border-border/50 rounded text-[11px]"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                          <span className="font-medium text-foreground truncate">{addback.name}</span>
                          <span className="text-[10px] text-muted-foreground hidden sm:inline">({addback.category})</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-400 flex-shrink-0 ml-2">
                          +${addback.amount.toFixed(2)}M
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="pt-2 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
                Cancel
              </Button>
              <Button
                data-testid="preset-import-submit-btn"
                type="button"
                size="sm"
                onClick={handleCsvSubmit}
                disabled={isSubmitting || !parsedData}
                className="text-xs amber-gradient-btn font-semibold gap-1.5"
              >
                {isSubmitting ? "Importing..." : "⚡ Import Deal & Run Analytics"}
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: DRAG & DROP FINANCIAL CSV / P&L PARSER                             */}
        {/* ========================================================================= */}
        {activeMode === "csv" && !isEdit && (
          <div className="space-y-3.5 py-2 text-xs">
            {/* Target Deal Profile Header */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div className="space-y-1">
                <Label className="text-[11px] font-medium">Company Name</Label>
                <Input
                  value={csvCompany}
                  onChange={(e) => setCsvCompany(e.target.value)}
                  className="h-8 text-xs"
                  placeholder="e.g. CloudOps Systems"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-medium">Sector</Label>
                <select
                  value={csvSector}
                  onChange={(e) => setCsvSector(e.target.value)}
                  className="w-full h-8 text-xs bg-muted/60 border border-border rounded-md px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="SaaS / Cybersecurity">SaaS / Cybersecurity</option>
                  <option value="FinTech / Payments">FinTech / Payments</option>
                  <option value="HealthTech">HealthTech</option>
                  <option value="Consumer / E-Commerce">Consumer / E-Commerce</option>
                  <option value="Industrial IoT">Industrial IoT</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-medium">Deal Type</Label>
                <select
                  value={csvDealType}
                  onChange={(e) => setCsvDealType(e.target.value)}
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
                <Label className="text-[11px] font-medium">Asking EV ($M)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={csvAskingEV}
                  onChange={(e) => setCsvAskingEV(parseFloat(e.target.value) || 0)}
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-medium">Lead Partner</Label>
                <select
                  value={csvLeadPartner}
                  onChange={(e) => setCsvLeadPartner(e.target.value)}
                  className="w-full h-8 text-xs bg-muted/60 border border-border rounded-md px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Marcus Vance">Marcus Vance</option>
                  <option value="Sarah Chen">Sarah Chen</option>
                  <option value="Elena Rostova">Elena Rostova</option>
                  <option value="David Kim">David Kim</option>
                </select>
              </div>
            </div>

            {/* CSV Input Controls & Template Download */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                <UploadCloud className="w-3.5 h-3.5 text-orange-400" />
                Raw P&L / Income Statement CSV Data
              </span>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer text-[11px] font-medium text-slate-300 hover:text-white bg-muted/60 hover:bg-muted border border-border px-2 py-1 rounded transition-all">
                  <span>Upload .CSV File</span>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTemplate}
                  className="h-7 text-[11px] gap-1 px-2 text-muted-foreground hover:text-foreground"
                >
                  <Download className="w-3 h-3" />
                  <span>Download Template</span>
                </Button>
              </div>
            </div>

            <Textarea
              data-testid="intake-csv-textarea"
              rows={5}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Account Name,Category,Amount..."
              className="text-xs font-mono text-muted-foreground bg-muted/20 border-border resize-none"
            />

            <div className="flex justify-end">
              <Button
                data-testid="parse-csv-button"
                type="button"
                size="sm"
                onClick={handleParseCsv}
                disabled={isParsing}
                className="h-8 text-xs gap-1.5 bg-[#1a1f30] hover:bg-[#252d44] text-orange-300 border border-orange-500/30 font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                <span>{isParsing ? "Analyzing Financials..." : "Analyze & Parse P&L"}</span>
              </Button>
            </div>

            {/* Parsed Output Review */}
            {parsedData && (
              <div className="p-3 bg-muted/40 border border-border rounded-lg space-y-3 animate-in fade-in-50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground">
                    Parsed Financial Output ({parsedData.parsed_rows_count} lines)
                  </span>
                  <span className="font-mono text-[11px] text-emerald-400 font-semibold">
                    Implied Multiple: {parsedData.implied_ev_ebitda_multiple}x EV/EBITDA
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-center">
                  <div className="p-1.5 rounded bg-background/60 border border-border/60">
                    <div className="text-[10px] text-muted-foreground">Revenue</div>
                    <div className="font-bold text-xs text-foreground">${parsedData.revenue}M</div>
                  </div>
                  <div className="p-1.5 rounded bg-background/60 border border-border/60">
                    <div className="text-[10px] text-muted-foreground">COGS</div>
                    <div className="font-bold text-xs text-foreground">${parsedData.cogs}M</div>
                  </div>
                  <div className="p-1.5 rounded bg-background/60 border border-border/60">
                    <div className="text-[10px] text-muted-foreground">Gross Profit</div>
                    <div className="font-bold text-xs text-foreground">${parsedData.gross_profit}M ({parsedData.gross_margin_pct}%)</div>
                  </div>
                  <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                    <div className="text-[10px] text-emerald-400">Adj. EBITDA</div>
                    <div className="font-bold text-xs text-emerald-300">${parsedData.adjusted_ebitda}M</div>
                  </div>
                </div>

                {/* Add-Backs Toggles */}
                {parsedData.suggested_addbacks.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      Select QoE Add-Backs to Include:
                    </span>
                    <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                      {parsedData.suggested_addbacks.map((addback, idx) => (
                        <label
                          key={idx}
                          className="flex items-center justify-between p-1.5 bg-background/50 border border-border/50 rounded text-[11px] cursor-pointer hover:bg-muted/40"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <input
                              type="checkbox"
                              checked={!!selectedAddbacks[idx]}
                              onChange={(e) =>
                                setSelectedAddbacks({ ...selectedAddbacks, [idx]: e.target.checked })
                              }
                              className="rounded border-border text-orange-500 focus:ring-orange-500"
                            />
                            <span className="font-medium text-foreground truncate">{addback.name}</span>
                            <span className="text-[10px] text-muted-foreground hidden sm:inline">({addback.category})</span>
                          </div>
                          <span className="font-mono font-bold text-emerald-400 flex-shrink-0 ml-2">
                            +${addback.amount.toFixed(2)}M
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="pt-2 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
                Cancel
              </Button>
              <Button
                data-testid="csv-import-submit-btn"
                type="button"
                size="sm"
                onClick={handleCsvSubmit}
                disabled={isSubmitting || !parsedData}
                className="text-xs amber-gradient-btn font-semibold gap-1.5"
              >
                {isSubmitting ? "Importing..." : "Inject Deal & QoE Adjustments"}
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 3: MANUAL INTAKE (PRESERVES EXACT ORIGINAL FORM)                     */}
        {/* ========================================================================= */}
        {(activeMode === "manual" || isEdit) && (
          <form onSubmit={handleManualSubmit}>
            <div className="space-y-3.5 py-2 text-xs">
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
                className="text-xs amber-gradient-btn font-semibold"
              >
                {isSubmitting ? "Saving..." : isEdit ? "Update Deal" : "Create Deal"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

