import { useLocation } from "wouter";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function FloatingAiButton() {
  const [location, navigate] = useLocation();

  // Hide when already on the assistant page
  if (location === "/assistant") return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => navigate("/assistant")}
          data-testid="button-floating-ai"
          aria-label="Open AI Study Assistant"
          className="fixed bottom-6 right-6 z-[9999] group"
          style={{ filter: "drop-shadow(0 4px 12px rgba(13,148,136,0.35))" }}
        >
          {/* Outer glow ring */}
          <span className="absolute inset-0 rounded-full animate-ping bg-teal-400 opacity-20 scale-110" />

          {/* Main button circle */}
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 via-teal-500 to-cyan-600 transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
            {/* Doodle brain SVG */}
            <svg
              viewBox="0 0 48 48"
              fill="none"
              className="h-8 w-8"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Brain outline */}
              <path
                d="M24 8C18 8 13 12.5 13 18c0 2.5 1 4.8 2.6 6.5C14 26 13 27.8 13 30c0 4.4 4 8 9 8h4c5 0 9-3.6 9-8 0-2.2-1-4-2.6-5.5C34 23 35 20.5 35 18c0-5.5-5-10-11-10z"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="rgba(255,255,255,0.15)"
              />
              {/* Brain fold lines */}
              <path d="M20 17c0 2 1.5 3.5 3.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M28 17c0 2-1.5 3.5-3.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M20 26c1 1.5 2.5 2.5 4 2.5s3-1 4-2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              {/* Sparkle dots */}
              <circle cx="17" cy="18" r="1.5" fill="white" opacity="0.8" />
              <circle cx="31" cy="18" r="1.5" fill="white" opacity="0.8" />
              <circle cx="24" cy="35" r="1.2" fill="white" opacity="0.6" />
              {/* Small stars */}
              <path d="M38 10l.5 1.5L40 12l-1.5.5L38 14l-.5-1.5L36 12l1.5-.5z" fill="white" opacity="0.7" />
              <path d="M10 32l.4 1L11.8 33l-1 .4.4 1-.8-1-.8.6.4-1-1-.4 1.2-.2z" fill="white" opacity="0.5" />
            </svg>
          </span>

          {/* "AI" label badge */}
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[9px] font-black text-teal-600 shadow-sm border border-teal-200">
            AI
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="left" className="font-medium">
        Ask AI Study Assistant
      </TooltipContent>
    </Tooltip>
  );
}
