import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Sun, 
  Moon, 
  RefreshCw, 
  TrendingUp, 
  Search,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface NavbarProps {
  onNewDealClick: () => void;
  onResetSeed: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  isSeeding?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewDealClick,
  onResetSeed,
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  isSeeding = false
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
      localStorage.setItem("dealCfoTheme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("dealCfoTheme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const navTabs = [
    { id: "overview", label: "Executive Overview" },
    { id: "pipeline", label: "Deal Pipeline" },
    { id: "valuation", label: "Valuation & DCF" },
    { id: "runway", label: "Cash & Runway" },
    { id: "ebitda", label: "EBITDA Adjustments" },
    { id: "deals", label: "All Deals Database" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md transition-colors">
      {/* Top Utility Bar */}
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Brand Logo & Fund Selector */}
        <div className="flex items-center gap-4">
          <div 
            onClick={() => setActiveTab("overview")}
            className="flex items-center gap-2.5 cursor-pointer group"
            data-testid="brand-logo"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
                  DealCFO
                </span>
                <Badge variant="outline" className="hidden sm:inline-flex text-[10px] px-1.5 py-0 border-emerald-500/30 text-emerald-400 font-mono">
                  v2.4 Pro
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground hidden sm:block font-medium">
                M&A Deal & Valuation Intelligence
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-border/60">
            <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              data-testid="workspace-selector"
              value={workspace}
              onChange={(e) => setWorkspace(e.target.value)}
              className="text-xs bg-muted/60 hover:bg-muted border border-border/60 rounded-md px-2.5 py-1 text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="Mid-Market Growth Fund IV ($250M)">Mid-Market Growth Fund IV ($250M)</option>
              <option value="Global Tech Buyout Fund II ($500M)">Global Tech Buyout Fund II ($500M)</option>
              <option value="Strategic Carve-Outs SPV ($120M)">Strategic Carve-Outs SPV ($120M)</option>
            </select>
          </div>
        </div>

        {/* Global Search & Action Buttons */}
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block w-56 lg:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              data-testid="global-search-input"
              type="text"
              placeholder="Search deals, targets, partners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs bg-muted/40 border-border/60 focus-visible:ring-emerald-500"
            />
          </div>

          {/* Reset / Reseed Demo Data */}
          <Button
            data-testid="seed-data-btn"
            variant="outline"
            size="sm"
            onClick={onResetSeed}
            disabled={isSeeding}
            className="h-9 px-2.5 text-xs border-border/60 hover:bg-muted font-medium text-muted-foreground hover:text-foreground"
            title="Reset to fresh demo deals"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? "animate-spin text-emerald-400" : ""}`} />
            <span className="hidden xl:inline ml-1.5">{isSeeding ? "Seeding..." : "Reset Data"}</span>
          </Button>

          {/* Theme Toggle */}
          <Button
            data-testid="theme-toggle-btn"
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 border-border/60 text-muted-foreground hover:text-foreground"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </Button>

          {/* New Deal Intake CTA */}
          <Button
            data-testid="nav-new-deal-btn"
            onClick={onNewDealClick}
            size="sm"
            className="h-9 gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold shadow-sm shadow-emerald-500/30"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Deal Intake</span>
            <span className="sm:hidden">Intake</span>
          </Button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="border-t border-border/40 bg-muted/20">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-1">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                data-testid={`nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-md whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400 dark:text-emerald-400 border border-emerald-500/30 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
