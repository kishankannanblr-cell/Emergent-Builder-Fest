import React from "react";
import { 
  Sparkles, 
  User, 
  Heart, 
  ExternalLink, 
  ShieldCheck, 
  Calculator, 
  Flame, 
  Briefcase, 
  Clock, 
  FileSpreadsheet, 
  Code2, 
  ChevronRight,
  Layers,
  Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface AboutPageProps {
  onNavigateTab: (tab: string, subtab?: string) => void;
  onOpenAICopilot?: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onNavigateTab,
  onOpenAICopilot,
}) => {
  const SHOWCASE_VOTE_URL = "https://app.emergent.sh/showcase/builderfest-kevin/804c7bfb-1223-4463-a297-0ad569558340?utm_source=share";

  const engines = [
    {
      id: "valuation-dcf",
      tab: "valuation",
      subtab: "dcf",
      title: "Interactive DCF Valuation Engine",
      icon: Calculator,
      badge: "Quantitative Core",
      badgeColor: "border-orange-500/30 text-orange-400 bg-orange-500/10",
      description: "5-year free cash flow projections, dynamic WACC calibration based on US 10-Yr Treasuries (4.35%) & Damodaran equity risk premiums, and exit multiple sensitivity matrices.",
      actionLabel: "Launch DCF Model",
    },
    {
      id: "valuation-shark",
      tab: "valuation",
      subtab: "shark",
      title: "Mr. Wonderful Deal Structurer",
      icon: Flame,
      badge: "Kevin O'Leary Signature",
      badgeColor: "border-purple-500/30 text-purple-300 bg-purple-500/10",
      description: "Authentic Shark Tank deal structuring modeling upfront capital injection, monthly top-line revenue royalties until a 2.0x payback cap is achieved, and residual perpetual equity kickers.",
      actionLabel: "Launch Royalty Structurer",
    },
    {
      id: "runway",
      tab: "runway",
      title: "Portfolio Cash Runway & Burn Analytics",
      icon: Clock,
      badge: "Liquidity Defense",
      badgeColor: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
      description: "Stress-testing portfolio cash horizons against interest rate inflation (+200 bps) and collection slowdowns (-20%), with automated LP capital call triggers.",
      actionLabel: "Stress-Test Runway",
    },
    {
      id: "ebitda",
      tab: "ebitda",
      title: "Quality of Earnings (QoE) EBITDA Bridge",
      icon: FileSpreadsheet,
      badge: "M&A Audit Rigor",
      badgeColor: "border-sky-500/30 text-sky-400 bg-sky-500/10",
      description: "Auditing seller add-backs (founder comp normalization, dual cloud migrations, one-off severance) to calculate borrowing capacity under senior debt leverage.",
      actionLabel: "Audit QoE Bridge",
    },
  ];

  return (
    <div data-testid="about-page-container" className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-200">
      
      {/* 1. Hero Spotlight: DealCFO & Author Kishan Kannan */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gradient-to-r dark:from-[#111422] dark:via-[#151a2d] dark:to-[#1c132c] border border-slate-200 dark:border-orange-500/30 p-6 sm:p-8 shadow-sm dark:shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-gradient-to-t from-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/40 text-[11px] font-bold px-2.5 py-0.5">
                EMERGENT BUILDER FEST 2025/2026
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/40 text-[11px] font-bold px-2.5 py-0.5">
                🦈 Judged by Kevin O'Leary ("Mr. Wonderful")
              </Badge>
              <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono">
                $100,000 Grand Prize
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading">
              About DealCFO & Author Kishan Kannan
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              DealCFO is an institutional M&A Valuation & CFO Intelligence Engine architected by <strong className="text-slate-900 dark:text-white">Kishan Kannan</strong> (<span className="text-orange-600 dark:text-orange-400 font-mono font-medium">@kishankannanblr</span>). It replaces fragile Excel spreadsheets with an agentic financial operating system tailored to mid-market private equity and Kevin O'Leary's investment criteria.
            </p>

            <div className="flex items-center gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" />
                <span>Author: <strong className="text-slate-800 dark:text-slate-200">Kishan Kannan</strong></span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                <span>AI Engine: <strong>Google Gemini 1.5</strong></span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Damodaran 2025 Benchmarks</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <a
              href={SHOWCASE_VOTE_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="about-page-vote-btn"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-sm shadow-xl shadow-rose-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>Upvote on Showcase</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            {onOpenAICopilot && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenAICopilot}
                className="h-10 text-xs gap-2 border-orange-500/30 bg-[#161a26] text-orange-300 hover:bg-orange-500/15"
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                <span>Ask AI Copilot (Ctrl+J)</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Dual Breakdown: About The Platform vs About The Author */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left (7 cols): The DealCFO Story & Kevin O'Leary Alignment */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-[#111420] border-white/[0.08] p-6 rounded-xl shadow-xl space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  The Problem DealCFO Solves
                </h3>
                <p className="text-xs text-slate-400">From manual spreadsheet friction to real-time agentic finance</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Middle-market private equity associates and CFOs evaluate dozens of acquisitions under tight deadlines. Traditional workflows rely on static Excel workbooks that break easily, lack unified audit trails for Quality of Earnings (QoE) adjustments, and fail to simulate downside cash runway horizons when interest rates rise.
            </p>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <strong className="text-white">DealCFO</strong> centralizes transaction pipelines, institutional DCF cash flow schedules, EBITDA adjustments, and debt coverage ratios into a single reactive cockpit—empowered by a **Google Gemini 1.5 financial conversational chatbot** that answers any question about any deal.
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
                <span className="text-xs font-bold text-white block">🏛️ Institutional Rigor</span>
                <p className="text-[11px] text-slate-400">Built on Damodaran NYU Stern sector betas, SOFR debt curves, and US 10-Yr Treasuries.</p>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
                <span className="text-xs font-bold text-white block">⚡ Sub-Second Reactivity</span>
                <p className="text-[11px] text-slate-400">100% client-resilient computation engine with instantaneous parameter recalculation.</p>
              </div>
            </div>
          </Card>

          {/* Kevin O'Leary Alignment Card */}
          <Card className="bg-gradient-to-br from-purple-950/50 via-[#141828] to-[#121520] border-purple-500/30 p-6 rounded-xl shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🦈</span>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Why Engineered for Judge Kevin O'Leary
                  </h3>
                  <p className="text-xs text-purple-300/80">"Money is binary: it either sleeps or it works."</p>
                </div>
              </div>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-[10px] font-bold">
                Shark Mode Engine
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Kevin O'Leary frequently champions royalty deal structures over dilutive common equity. DealCFO includes the **Mr. Wonderful Deal Structurer** specifically to model Kevin's signature framework:
            </p>

            <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
              <li><strong>Upfront Cash Injection:</strong> Immediate liquidity check wired at closing.</li>
              <li><strong>Top-Line Royalty (%):</strong> 3%–8% of gross revenue paid monthly on the 1st business day.</li>
              <li><strong>2.0x Payback Cap:</strong> Royalty terminates automatically once 2x principal is returned.</li>
              <li><strong>Residual Perpetual Equity:</strong> 2%–5% non-dilutable common equity retained forever.</li>
            </ul>

            <div className="pt-2">
              <Button
                size="sm"
                onClick={() => onNavigateTab("valuation", "shark")}
                className="h-8 text-xs bg-purple-600 hover:bg-purple-500 text-white font-semibold gap-1.5"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Open Mr. Wonderful Deal Structurer</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Right (5 cols): About Author Kishan Kannan & Technical Architecture */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-[#111420] border-white/[0.08] p-6 rounded-xl shadow-xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08]">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-orange-500/20">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-white">Kishan Kannan</h3>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[10px] font-bold">
                    Author & Builder
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">Student Builder & Generative AI Developer</p>
                <p className="text-[11px] text-orange-400 font-mono mt-0.5">@kishankannanblr</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <strong className="text-white">Kishan Kannan</strong> is a student builder specializing in full-stack architecture, generative AI systems, and modern financial intelligence user interfaces.
            </p>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              For the <strong className="text-white">Emergent Builder Fest</strong>, Kishan set out to prove that modern web technologies and Google Gemini AI can elevate complex private equity workflows into a fluid, visual, and highly interactive experience.
            </p>

            {/* Architecture Spec Sheet */}
            <div className="space-y-2 pt-2 border-t border-white/[0.08]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Code2 className="w-3.5 h-3.5 text-orange-400" />
                <span>Technical Implementation Stack</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-slate-400">Frontend Core:</span>
                  <span className="font-mono text-white font-medium">React 19 • TypeScript • Vite</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-slate-400">Styling & UI:</span>
                  <span className="font-mono text-white font-medium">Tailwind CSS • Obsidian Dark Mode</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-slate-400">Visual Analytics:</span>
                  <span className="font-mono text-white font-medium">Recharts (Custom SVG Gradients)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-slate-400">AI Engine:</span>
                  <span className="font-mono text-orange-300 font-medium">Google Gemini 1.5 Flash & Pro</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-slate-400">Backend Server:</span>
                  <span className="font-mono text-white font-medium">FastAPI / Python 3.11</span>
                </div>
              </div>
            </div>

            {/* Upvote Pill */}
            <div className="pt-2">
              <a
                href={SHOWCASE_VOTE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 hover:text-white font-bold text-xs transition-all shadow-sm"
              >
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
                <span>Support Kishan's Submission on Emergent</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </Card>
        </div>
      </div>

      {/* 3. The 4 Quantitative Valuation Engines Quick Access Grid */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              The 4 Core Valuation & Analytics Engines
            </h3>
          </div>
          <span className="text-xs text-slate-400">All available in DealCFO v3.0 Ultra</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {engines.map((engine) => {
            const Icon = engine.icon;
            return (
              <Card 
                key={engine.id}
                className="bg-[#111420] border-white/[0.08] hover:border-orange-500/40 p-5 rounded-xl flex flex-col justify-between space-y-4 hover:shadow-xl transition-all group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${engine.badgeColor}`}>
                      {engine.badge}
                    </Badge>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                    {engine.title}
                  </h4>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {engine.description}
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => onNavigateTab(engine.tab, engine.subtab)}
                  className="w-full h-8 text-xs amber-gradient-btn font-semibold shadow-sm"
                >
                  <span>{engine.actionLabel}</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Card>
            );
          })}
        </div>
      </div>

    </div>
  );
};
