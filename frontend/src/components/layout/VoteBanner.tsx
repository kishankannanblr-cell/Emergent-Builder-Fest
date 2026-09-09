import React, { useState, useEffect } from "react";
import { Heart, ExternalLink, Share2, X, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SHOWCASE_VOTE_URL = "https://app.emergent.sh/showcase/builderfest-kevin/804c7bfb-1223-4463-a297-0ad569558340?utm_source=share";

export const VoteBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem("dealCfoVoteBannerDismissed");
    if (isDismissed === "true") {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("dealCfoVoteBannerDismissed", "true");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(SHOWCASE_VOTE_URL);
    toast.success("Showcase voting link copied to clipboard! Share it with friends & colleagues.");
  };

  if (!isVisible) return null;

  return (
    <div 
      data-testid="emergent-vote-banner"
      className="relative z-50 w-full bg-gradient-to-r from-emerald-950 via-zinc-950 to-teal-950 border-b border-emerald-500/30 text-white px-4 py-2.5 transition-all shadow-md"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Left: Competition Badge & Pitch */}
        <div className="flex items-center gap-2.5 flex-wrap justify-center md:justify-start">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] tracking-wide animate-pulse">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>EMERGENT BUILDER FEST</span>
          </div>

          <p className="text-zinc-200 text-center md:text-left text-[11.5px]">
            Competing for the <strong className="text-emerald-400 font-semibold">$100,000 Grand Prize</strong> (judged by <strong className="text-white font-semibold">Kevin O'Leary / Mr. Wonderful</strong>).
            <span className="hidden lg:inline text-zinc-400 ml-1">If DealCFO impresses you, your upvote helps us reach the finals!</span>
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            data-testid="vote-showcase-btn"
            href={SHOWCASE_VOTE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-md shadow-rose-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Heart className="w-3.5 h-3.5 fill-white" />
            <span>Upvote on Showcase</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </a>

          <Button
            data-testid="share-vote-link-btn"
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="h-7 px-2.5 text-xs border-emerald-500/30 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/40 hover:text-white"
            title="Copy share link"
          >
            <Share2 className="w-3 h-3 mr-1" />
            <span>Share</span>
          </Button>

          <button
            data-testid="dismiss-vote-banner-btn"
            onClick={handleDismiss}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors ml-1"
            title="Dismiss banner"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
