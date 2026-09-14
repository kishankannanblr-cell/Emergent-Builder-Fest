import React, { useState } from "react";
import { 
  Sparkles, 
  User, 
  ChevronDown, 
  ChevronUp, 
  Heart, 
  ExternalLink, 
  ShieldCheck, 
  Calculator, 
  Flame, 
  Briefcase,
  Code2,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AboutSectionProps {
  onOpenSharkTank?: () => void;
  onOpenAICopilot?: () => void;
  onOpenDCF?: () => void;
  onOpenAboutModal?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  onOpenSharkTank,
  onOpenAICopilot,
  onOpenDCF,
  onOpenAboutModal
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  return (
    <div 
      data-testid="about-deal-cfo-section"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#111422] via-[#141829] to-[#181226] border border-orange-500/25 p-5 sm:p-6 shadow-2xl transition-all"
    >
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-gradient-to-b from-orange-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 right-0 w-64 h-64 bg-gradient-to-t from-purple-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-0.5 shadow-lg shadow-orange-500/20 flex items-center justify-center text-white shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                About DealCFO & Author Kishan Kannan
              </h2>
              <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/40 text-[10px] font-bold px-2 py-0.5">
                Emergent Builder Fest
              </Badge>
              <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-300 font-mono">
                Judged by Kevin O'Leary
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Democratizing Institutional M&A Valuation, Kevin O'Leary Royalty Structuring & Agentic CFO Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {onOpenAboutModal && (
            <Button
              data-testid="about-open-modal-btn"
              variant="outline"
              size="xs"
              onClick={onOpenAboutModal}
              className="h-7 text-xs px-2.5 bg-white/5 border-white/10 text-slate-300 hover:text-white"
            >
              Full Profile
            </Button>
          )}

          <Button
            data-testid="about-toggle-collapse-btn"
            variant="ghost"
            size="xs"
            onClick={() => setIsExpanded(prev => !prev)}
            className="h-7 text-xs text-slate-400 hover:text-white gap-1"
          >
            <span>{isExpanded ? "Collapse" : "Expand"}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {/* Expandable Dual-Column Body */}
      {isExpanded && (
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 animate-in fade-in duration-200">
          
          {/* Column 1: About DealCFO (7 cols) */}
          <div className="lg:col-span-7 space-y-3.5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400">
                <Briefcase className="w-3.5 h-3.5" />
                <span>What is DealCFO?</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white font-semibold">DealCFO</strong> is an institutional-grade M&A Valuation & CFO Intelligence Engine built for private equity sponsors, investment committees, and corporate development teams. It replaces static financial spreadsheets with a dynamic, agentic operating system designed to analyze and structure mid-market acquisitions.
              </p>
            </div>

            {/* 4 Core Quantitative Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <Calculator className="w-3.5 h-3.5 text-orange-400" />
                  <span>Interactive DCF Engine</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  5-year FCF forecasts, Damodaran NYU Stern WACC calibration, and exit multiple sensitivity tables.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <Flame className="w-3.5 h-3.5 text-purple-400" />
                  <span>Mr. Wonderful Structurer</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Kevin O'Leary's signature model: cash upfront + % top-line royalty until 2x payback + perpetual equity.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>QoE EBITDA Bridge</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Quality of Earnings audit schedules normalizing founder comp, one-off IT migrations, and debt capacity.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Google Gemini Copilot</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Conversational financial chatbot answering open-ended valuation, risk, and diligence questions across deals.
                </p>
              </div>
            </div>

            {/* Quick Action Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {onOpenDCF && (
                <button
                  onClick={onOpenDCF}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-white/5 hover:bg-orange-500/20 text-orange-300 border border-orange-500/30 transition-colors font-semibold"
                >
                  ⚡ Launch DCF Model
                </button>
              )}
              {onOpenSharkTank && (
                <button
                  onClick={onOpenSharkTank}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-colors font-semibold"
                >
                  🦈 Launch Mr. Wonderful Structurer
                </button>
              )}
              {onOpenAICopilot && (
                <button
                  onClick={onOpenAICopilot}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors font-semibold"
                >
                  ✨ Ask AI Copilot (Ctrl+J)
                </button>
              )}
            </div>
          </div>

          {/* Column 2: About the Author Kishan Kannan (5 cols) */}
          <div className="lg:col-span-5 p-4 rounded-xl bg-[#141826] border border-white/[0.08] flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-white">Kishan Kannan</h3>
                      <Badge variant="outline" className="text-[9px] px-1 py-0 border-emerald-500/40 text-emerald-400">
                        Builder
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400">Student Builder & Generative AI Developer</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Emergent Fest</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Created and built by <strong className="text-white font-semibold">Kishan Kannan</strong> (<span className="text-orange-400 font-mono text-[11px]">@kishankannanblr</span>) for the <strong className="text-white font-semibold">Emergent Builder Fest</strong>. Kishan is a student builder designing high-velocity software blending generative AI reasoning with institutional finance rigor.
              </p>

              {/* Technical Specifications */}
              <div className="p-2.5 rounded-lg bg-black/30 border border-white/[0.06] space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1">
                    <Code2 className="w-3 h-3 text-orange-400" />
                    Stack:
                  </span>
                  <span className="font-mono text-slate-200">React 19 • TypeScript • Vite • Tailwind</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>AI Core:</span>
                  <span className="font-mono text-orange-300">Google Gemini 1.5 Flash & Pro</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Data Foundation:</span>
                  <span className="font-mono text-slate-200">Damodaran NYU Stern M&A Comps</span>
                </div>
              </div>
            </div>

            {/* Showcase Upvote CTA */}
            <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2">
              <a
                href="https://app.emergent.sh/showcase/builderfest-kevin/804c7bfb-1223-4463-a297-0ad569558340?utm_source=share"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="about-vote-author-btn"
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Heart className="w-3.5 h-3.5 fill-white" />
                <span>Vote for DealCFO & Kishan</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
