import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Sun, 
  Moon, 
  RefreshCw, 
  Search,
  Briefcase,
  Heart,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NavbarProps {
  onNewDealClick: () => void;
  onResetSeed: () => void;
  activeTab: string;
  setActiveTab?: (tab: string) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  isSeeding?: boolean;
  onOpenAICopilot?: () => void;
  onOpenAbout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewDealClick,
  onResetSeed,
  activeTab,
  searchTerm,
  setSearchTerm,
  isSeeding = false,
  onOpenAICopilot,
  onOpenAbout
}) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") || 
        localStorage.getItem("dealCfoTheme") !== "light";
    }
    return true;
  });

  const [workspace, setWorkspace] = useState("Mid-Market Growth Fund IV ($250M)");

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      localStorage.setItem("dealCfoTheme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      localStorage.setItem("dealCfoTheme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const getPageTitle = (tab: string) => {
    switch(tab) {
      case "overview": return { title: "Executive Dashboard", section: "Main" };
      case "pipeline": return { title: "Deal Pipeline & Stage Gates", section: "Main" };
      case "deals": return { title: "Deal Database & Directory", section: "Main" };
      case "valuation-dcf":
      case "valuation": return { title: "DCF Valuation & Sensitivity Analysis", section: "Valuation & Analytics" };
      case "valuation-shark": return { title: "Mr. Wonderful Deal Structurer", section: "Shark Mode" };
      case "runway": return { title: "Cash Runway & Burn Horizon", section: "Valuation & Analytics" };
      case "ebitda": return { title: "Quality of Earnings (QoE) Bridge", section: "Valuation & Analytics" };
      case "about": return { title: "About DealCFO & Author Kishan Kannan", section: "Platform & Builder" };
      default: return { title: "Executive Dashboard", section: "Main" };
    }
  };

  const currentMeta = getPageTitle(activeTab);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/[0.08] bg-[#0c0e17]/95 backdrop-blur-md transition-colors">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 w-full">
        {/* Left: Active View Breadcrumb & Fund Selector */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="flex-shrink-0">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <span>DealCFO</span>
              <span>/</span>
              <span className="text-orange-400 font-semibold">{currentMeta.section}</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-none mt-0.5 whitespace-nowrap">
              {currentMeta.title}
            </h1>
          </div>

          <div className="hidden 2xl:flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-white/[0.08] flex-shrink-0">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <select
              data-testid="workspace-selector"
              value={workspace}
              onChange={(e) => setWorkspace(e.target.value)}
              className="text-xs bg-[#141824] hover:bg-[#1a1f30] border border-white/[0.08] rounded-md px-2.5 py-1 text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
            >
              <option value="Mid-Market Growth Fund IV ($250M)">Growth Fund IV ($250M)</option>
              <option value="Global Tech Buyout Fund II ($500M)">Global Tech Buyout Fund II ($500M)</option>
              <option value="Strategic Carve-Outs SPV ($120M)">Strategic Carve-Outs SPV ($120M)</option>
            </select>
          </div>
        </div>

        {/* Right: Global Search & Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative hidden md:block w-36 lg:w-44">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              data-testid="global-search-input"
              type="text"
              placeholder="Search deals... (⌘K)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-8 h-9 text-xs bg-[#141824] border-white/[0.08] focus-visible:ring-orange-500 text-slate-200 placeholder:text-slate-500"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 bg-white/5 border border-white/10 px-1 py-0.5 rounded">
              ⌘K
            </kbd>
          </div>

          {/* Prominent Global "Ask DealCFO AI" Button */}
          <Button
            data-testid="nav-ask-ai-btn"
            onClick={onOpenAICopilot}
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 px-3 rounded-lg bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/15 hover:from-orange-500/25 hover:to-amber-500/25 border border-orange-500/30 text-orange-300 hover:text-white font-bold text-xs transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            title="Open DealCFO AI Copilot (Ctrl + J)"
          >
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
            <span>✨ Ask AI</span>
            <kbd className="hidden sm:inline-block ml-1 text-[10px] font-mono text-orange-400 bg-orange-500/20 px-1 py-0.2 rounded border border-orange-500/30">
              Ctrl+J
            </kbd>
          </Button>

          {/* About DealCFO & Author Button */}
          {onOpenAbout && (
            <Button
              data-testid="nav-about-btn"
              onClick={onOpenAbout}
              variant="outline"
              size="sm"
              className="hidden lg:inline-flex h-9 gap-1.5 px-2.5 rounded-lg bg-[#141824] hover:bg-[#1a1f30] border-white/[0.08] text-slate-300 hover:text-white font-semibold text-xs transition-all"
              title="About DealCFO & Author Kishan Kannan"
            >
              <Info className="w-3.5 h-3.5 text-orange-400" />
              <span>About</span>
            </Button>
          )}

          {/* Persistent Vote CTA Pill */}
          <a
            data-testid="nav-vote-pill-btn"
            href="https://app.emergent.sh/showcase/builderfest-kevin/804c7bfb-1223-4463-a297-0ad569558340?utm_source=share"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 font-bold text-xs transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            title="Vote for DealCFO on Emergent Showcase"
          >
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
            <span className="hidden sm:inline">Vote</span>
          </a>

          {/* Reset / Reseed Demo Data */}
          <Button
            data-testid="seed-data-btn"
            variant="outline"
            size="sm"
            onClick={onResetSeed}
            disabled={isSeeding}
            className="h-9 px-2.5 text-xs bg-[#141824] border-white/[0.08] hover:bg-[#1a1f30] font-medium text-slate-400 hover:text-white"
            title="Reset to fresh demo deals"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? "animate-spin text-orange-400" : ""}`} />
            <span className="hidden 2xl:inline ml-1.5">{isSeeding ? "Resetting..." : "Reset"}</span>
          </Button>

          {/* Theme Toggle */}
          <Button
            data-testid="theme-toggle-btn"
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 bg-[#141824] border-white/[0.08] text-slate-400 hover:text-white hover:bg-[#1a1f30]"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-400" />
            )}
          </Button>

          {/* New Deal Intake CTA */}
          <Button
            data-testid="nav-new-deal-btn"
            onClick={onNewDealClick}
            size="sm"
            className="h-9 gap-1.5 amber-gradient-btn font-semibold shadow-md shadow-orange-500/25 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">+ New Deal</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

