import React from "react";
import { 
  X, 
  User, 
  Heart, 
  ExternalLink, 
  Flame, 
  Briefcase, 
  CheckCircle2,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchSharkTank?: () => void;
  onLaunchDCF?: () => void;
  onOpenAICopilot?: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  onLaunchSharkTank,
  onLaunchDCF,
  onOpenAICopilot,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        data-testid="about-full-modal"
        className="relative w-full max-w-3xl bg-[#0e111a] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden font-sans text-slate-100"
      >
        {/* Top Decorative Glow Header */}
        <div className="relative p-6 bg-gradient-to-r from-[#141829] via-[#161b30] to-[#20142c] border-b border-white/[0.08]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-500/15 via-amber-500/10 to-transparent rounded-bl-full pointer-events-none" />
          
          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-0.5 shadow-xl shadow-orange-500/25 flex items-center justify-center text-white font-extrabold text-lg">
                <span>DCFO</span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-extrabold text-white tracking-tight">
                    DealCFO & Kishan Kannan
                  </h2>
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/40 text-[10px] font-bold px-2 py-0.5">
                    v3.0 Ultra
                  </Badge>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-[10px] font-bold px-2 py-0.5">
                    Emergent Fest
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Institutional M&A Valuation, Kevin O'Leary Royalty Structuring & Google Gemini Financial Copilot
                </p>
              </div>
            </div>

            <Button
              data-testid="about-modal-close-btn"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Section 1: The DealCFO Story & Vision */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400">
              <Briefcase className="w-4 h-4" />
              <span>The Mission Behind DealCFO</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              In middle-market Private Equity and Corporate M&A, investment teams waste dozens of hours manipulating disconnected Excel models, wrestling with static DCF sensitivity tables, and second-guessing Quality of Earnings add-backs.
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <strong className="text-white">DealCFO</strong> was built to modernize this workflow into an interactive, real-time operating system. It combines institutional DCF valuation, automated Quality of Earnings schedules, and cash runway downside simulations with <strong>Kevin O'Leary's signature "Shark Tank" royalty deal structuring</strong>.
            </p>
          </div>

          {/* Section 2: Why Built For Judge Kevin O'Leary */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/60 via-purple-900/30 to-[#141824] border border-purple-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🦈</span>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  Engineered for Judge Kevin O'Leary ("Mr. Wonderful")
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] border-purple-500/40 text-purple-300">
                Shark Mode Engine
              </Badge>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              DealCFO features a dedicated <strong>"Mr. Wonderful" Royalty & Deal Structurer</strong> that models Kevin's famous investment formula: upfront cash injection + monthly top-line royalty payments until a 2.0x capital payback cap is reached, coupled with non-dilutable residual perpetual equity. It gives founders liquidity without extreme equity dilution while ensuring investors achieve audited 25%+ IRRs.
            </p>
            <div className="pt-1 flex items-center gap-2">
              {onLaunchSharkTank && (
                <Button
                  size="sm"
                  onClick={() => {
                    onClose();
                    onLaunchSharkTank();
                  }}
                  className="h-7 text-xs bg-purple-600 hover:bg-purple-500 text-white font-semibold"
                >
                  <Flame className="w-3.5 h-3.5 mr-1" />
                  <span>Launch Mr. Wonderful Structurer</span>
                </Button>
              )}
            </div>
          </div>

          {/* Section 3: About the Author Kishan Kannan */}
          <div className="p-4 rounded-xl bg-[#141826] border border-white/[0.08] space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white font-extrabold text-base shadow-md">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Kishan Kannan</h3>
                  <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-400">
                    Creator & Architect
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">Student Builder & Generative AI Developer • <span className="text-orange-400 font-mono">@kishankannanblr</span></p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Kishan built DealCFO specifically for the <strong>Emergent Builder Fest ($100,000 Grand Prize)</strong>. His focus is on combining deep algorithmic financial modeling (WACC, terminal multiples, cash runway horizons, debt covenants) with cutting-edge agentic workflows powered by Google Gemini.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              <div className="flex items-center gap-2 p-2 rounded bg-white/[0.02] border border-white/[0.04]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-300">Front-End: React 19, TypeScript, Tailwind</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-white/[0.02] border border-white/[0.04]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-300">AI Engine: Google Gemini 1.5 Pro & Flash</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-white/[0.02] border border-white/[0.04]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-300">Benchmarks: Damodaran NYU Stern PE Data</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-white/[0.02] border border-white/[0.04]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-300">Design: Obsidian Clean UI Template</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer with Support & Action CTAs */}
        <div className="p-4 bg-[#0a0d14] border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Support DealCFO in the Emergent Builder Fest finals!</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <a
              href="https://app.emergent.sh/showcase/builderfest-kevin/804c7bfb-1223-4463-a297-0ad569558340?utm_source=share"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-md shadow-rose-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>Upvote on Showcase</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-9 px-4 text-xs border-white/10 bg-white/5 text-slate-300 hover:text-white"
            >
              Close
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
