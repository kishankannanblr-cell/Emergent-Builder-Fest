import React from "react";
import { 
  LayoutDashboard, 
  GitPullRequest, 
  Database, 
  Calculator, 
  Flame, 
  Clock, 
  FileSpreadsheet, 
  Sparkles, 
  PlusCircle,
  Briefcase,
  Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: string, subtab?: string) => void;
  onNewDealClick: () => void;
  onOpenAICopilot: () => void;
  onOpenAbout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate,
  onNewDealClick,
  onOpenAICopilot,
  onOpenAbout,
}) => {
  const mainNav = [
    {
      id: "overview",
      label: "Executive Dashboard",
      icon: LayoutDashboard,
      description: "Cockpit & M&A Overview",
    },
    {
      id: "pipeline",
      label: "Deal Pipeline",
      icon: GitPullRequest,
      description: "Stage-Gate Kanban Board",
      badge: "8 Deals",
    },
    {
      id: "deals",
      label: "Deals Directory",
      icon: Database,
      description: "Full Target Repository",
    },
    {
      id: "about",
      label: "About & Author",
      icon: Info,
      description: "DealCFO & Kishan Kannan",
      badge: "Builder",
    },
  ];

  const valuationTools = [
    {
      id: "valuation-dcf",
      tab: "valuation",
      subtab: "dcf",
      label: "DCF Valuation Model",
      icon: Calculator,
      description: "5-Yr Cash Flows & WACC",
    },
    {
      id: "valuation-shark",
      tab: "valuation",
      subtab: "shark",
      label: 'Mr. Wonderful Structurer',
      icon: Flame,
      description: "Kevin O'Leary Royalty Engine",
      badge: "Shark Mode",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    },
    {
      id: "runway",
      label: "Cash Runway & Burn",
      icon: Clock,
      description: "Liquidity Horizons & Scenarios",
    },
    {
      id: "ebitda",
      label: "QoE EBITDA Bridge",
      icon: FileSpreadsheet,
      description: "Add-Back Audit Schedules",
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-[#0c0e17] border-r border-white/[0.08] flex flex-col h-screen sticky top-0 font-sans z-40 select-none">
      {/* 1. Header / Brand */}
      <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-0.5 shadow-lg shadow-orange-500/20 flex items-center justify-center text-white">
            <span className="font-extrabold text-sm tracking-tighter">DCFO</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white">DealCFO</span>
              <Badge variant="outline" className="text-[9px] px-1 py-0 border-orange-500/30 text-orange-400 font-mono">
                v3.0 Ultra
              </Badge>
            </div>
            <p className="text-[10px] text-slate-400 truncate">M&A Valuation & CFO Engine</p>
          </div>
        </div>
      </div>

      {/* 2. Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Section 1: Main */}
        <div className="space-y-1">
          <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Main
          </div>
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                data-testid={`sidebar-link-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? "bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-orange-400 border border-orange-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-orange-400" : "text-slate-400 group-hover:text-slate-200"}`} />
                  <div className="text-left">
                    <span className="block font-semibold">{item.label}</span>
                  </div>
                </div>
                {item.badge && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono bg-white/5 text-slate-300">
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        {/* Section 2: Valuation Tools */}
        <div className="space-y-1">
          <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Valuation & Analytics</span>
            <span className="text-[9px] text-slate-600 font-mono">4 Engines</span>
          </div>
          {valuationTools.map((item) => {
            const Icon = item.icon;
            const isActive = item.tab ? activeTab === item.id : activeTab === item.id;
            return (
              <button
                key={item.id}
                data-testid={`sidebar-link-${item.id}`}
                onClick={() => onNavigate(item.tab || item.id, item.subtab)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? "bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-orange-400 border border-orange-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-orange-400" : "text-slate-400 group-hover:text-slate-200"}`} />
                  <div className="text-left">
                    <span className="block font-semibold">{item.label}</span>
                  </div>
                </div>
                {item.badge && (
                  <Badge variant="outline" className={`text-[9px] px-1 py-0 ${item.badgeColor || "border-white/10 text-slate-300"}`}>
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        {/* Section 3: Intelligence & AI Copilot */}
        <div className="space-y-1.5">
          <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Intelligence & AI
          </div>
          <button
            data-testid="sidebar-btn-open-ai"
            onClick={onOpenAICopilot}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-transparent border border-orange-500/30 hover:border-orange-500/50 transition-all text-xs font-semibold text-slate-200 group shadow-sm hover:shadow-orange-500/10"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-orange-400 font-bold">Ask AI Copilot</span>
                </div>
                <p className="text-[10px] text-slate-400 font-normal">Google Gemini 1.5</p>
              </div>
            </div>
            <kbd className="px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-white/5 border border-white/10 rounded">
              Ctrl+J
            </kbd>
          </button>
        </div>
      </div>

      {/* 3. Bottom Card: Fund Allocation & Quick Action */}
      <div className="p-3 border-t border-white/[0.08] bg-[#090b12]/80 space-y-2.5">
        <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-3 h-3 text-orange-400" />
              <span className="text-[10px] font-bold text-slate-300">Growth Fund IV</span>
            </div>
            <span className="text-[9px] font-mono text-emerald-400 font-semibold">$250M AUM</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-1 rounded-full" style={{ width: "43.3%" }} />
          </div>
          <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
            <span>43.3% Deployed</span>
            <span>$141.7M Dry Powder</span>
          </div>
        </div>

        <Button
          data-testid="sidebar-new-deal-btn"
          size="sm"
          onClick={onNewDealClick}
          className="w-full h-8 text-xs gap-1.5 amber-gradient-btn font-semibold shadow-md"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Intake New Deal</span>
        </Button>
      </div>
    </aside>
  );
};
