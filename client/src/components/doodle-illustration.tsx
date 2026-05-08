interface DoodleIllustrationProps {
  type: "books" | "timer" | "trophy" | "checklist" | "rocket" | "brain" | "calendar" | "student" | "stars" | "empty";
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export function DoodleIllustration({
  type,
  className = "w-40 h-32",
  primaryColor = "#3b82f6",
  secondaryColor = "#a5b4fc",
}: DoodleIllustrationProps) {
  const strokeProps = {
    stroke: primaryColor,
    strokeWidth: "2.5",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };

  const accentProps = {
    ...strokeProps,
    stroke: secondaryColor,
    strokeWidth: "2",
  };

  const dotProps = {
    fill: primaryColor,
  };

  const svgClass = `${className}`;

  if (type === "books") {
    return (
      <svg viewBox="0 0 160 130" className={svgClass} aria-hidden="true">
        {/* Bottom book */}
        <rect x="20" y="90" width="120" height="28" rx="4" {...strokeProps} fill={`${primaryColor}15`} />
        <line x1="40" y1="90" x2="40" y2="118" {...strokeProps} />
        <line x1="35" y1="90" x2="35" y2="118" {...{ ...strokeProps, strokeWidth: "4", stroke: secondaryColor }} />
        {/* Middle book */}
        <rect x="28" y="62" width="104" height="30" rx="4" {...strokeProps} fill={`${secondaryColor}20`} />
        <line x1="48" y1="62" x2="48" y2="92" {...strokeProps} />
        <line x1="43" y1="62" x2="43" y2="92" {...{ ...strokeProps, strokeWidth: "4", stroke: `${primaryColor}` }} />
        {/* Top book */}
        <rect x="35" y="36" width="90" height="28" rx="4" {...strokeProps} fill={`${primaryColor}10`} />
        <line x1="55" y1="36" x2="55" y2="64" {...strokeProps} />
        <line x1="50" y1="36" x2="50" y2="64" {...{ ...strokeProps, strokeWidth: "4", stroke: secondaryColor }} />
        {/* Graduation cap */}
        <polygon points="80,10 110,22 80,34 50,22" {...strokeProps} fill={`${primaryColor}20`} />
        <line x1="110" y1="22" x2="110" y2="35" {...strokeProps} />
        <circle cx="110" cy="37" r="3" {...dotProps} />
        {/* Sparkles */}
        <path d="M130 50 L132 44 L134 50 L140 52 L134 54 L132 60 L130 54 L124 52 Z" {...accentProps} fill={`${secondaryColor}30`} />
        <circle cx="18" cy="55" r="2.5" {...{ ...strokeProps, strokeWidth: "1.5" }} />
        <circle cx="145" cy="80" r="2" {...accentProps} />
      </svg>
    );
  }

  if (type === "timer") {
    return (
      <svg viewBox="0 0 160 140" className={svgClass} aria-hidden="true">
        {/* Clock body */}
        <circle cx="80" cy="78" r="48" {...strokeProps} fill={`${primaryColor}08`} />
        <circle cx="80" cy="78" r="42" {...accentProps} />
        {/* Clock hands */}
        <line x1="80" y1="78" x2="80" y2="45" {...{ ...strokeProps, strokeWidth: "3" }} />
        <line x1="80" y1="78" x2="100" y2="70" {...{ ...strokeProps, strokeWidth: "2.5" }} />
        <circle cx="80" cy="78" r="4" fill={primaryColor} />
        {/* Crown/top */}
        <rect x="70" y="22" width="20" height="8" rx="3" {...strokeProps} fill={`${primaryColor}15`} />
        <line x1="75" y1="22" x2="72" y2="14" {...strokeProps} />
        <line x1="85" y1="22" x2="88" y2="14" {...strokeProps} />
        <circle cx="72" cy="13" r="3" {...dotProps} />
        <circle cx="88" cy="13" r="3" {...dotProps} />
        {/* Tick marks */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => {
          const rad = (deg - 90) * (Math.PI / 180);
          const x1 = 80 + 38 * Math.cos(rad);
          const y1 = 78 + 38 * Math.sin(rad);
          const x2 = 80 + 42 * Math.cos(rad);
          const y2 = 78 + 42 * Math.sin(rad);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} {...{ ...strokeProps, strokeWidth: "2" }} />;
        })}
        {/* Sparkles */}
        <path d="M138 48 L140 42 L142 48 L148 50 L142 52 L140 58 L138 52 L132 50 Z" {...accentProps} fill={`${secondaryColor}25`} />
        <path d="M18 95 L19.5 90 L21 95 L26 96.5 L21 98 L19.5 103 L18 98 L13 96.5 Z" {...{ ...accentProps, strokeWidth: "1.5" }} fill={`${secondaryColor}20`} />
        <circle cx="25" cy="45" r="2" {...{ ...accentProps, fill: secondaryColor }} />
        <circle cx="135" cy="100" r="2.5" {...{ ...accentProps, fill: `${primaryColor}60` }} />
      </svg>
    );
  }

  if (type === "trophy") {
    return (
      <svg viewBox="0 0 160 140" className={svgClass} aria-hidden="true">
        {/* Trophy cup */}
        <path d="M50 25 L110 25 L105 70 Q100 90 80 95 Q60 90 55 70 Z" {...strokeProps} fill={`${primaryColor}15`} />
        {/* Trophy handles */}
        <path d="M50 35 Q30 35 30 55 Q30 70 50 68" {...strokeProps} />
        <path d="M110 35 Q130 35 130 55 Q130 70 110 68" {...strokeProps} />
        {/* Stem */}
        <line x1="80" y1="95" x2="80" y2="110" {...{ ...strokeProps, strokeWidth: "3" }} />
        {/* Base */}
        <rect x="58" y="110" width="44" height="8" rx="4" {...strokeProps} fill={`${primaryColor}15`} />
        {/* Star inside */}
        <path d="M80 42 L83 52 L94 52 L85 58 L88 68 L80 62 L72 68 L75 58 L66 52 L77 52 Z" {...accentProps} fill={`${secondaryColor}30`} />
        {/* Sparkles */}
        <path d="M125 20 L127 14 L129 20 L135 22 L129 24 L127 30 L125 24 L119 22 Z" {...accentProps} fill={`${secondaryColor}25`} />
        <path d="M28 28 L29.5 23 L31 28 L36 29.5 L31 31 L29.5 36 L28 31 L23 29.5 Z" {...{ ...accentProps, strokeWidth: "1.5" }} />
        <circle cx="140" cy="70" r="3" {...{ ...accentProps, fill: secondaryColor }} />
        <circle cx="20" cy="80" r="2.5" {...{ ...accentProps, fill: `${primaryColor}60` }} />
        <circle cx="130" cy="100" r="2" {...{ ...dotProps, fill: secondaryColor }} />
      </svg>
    );
  }

  if (type === "checklist") {
    return (
      <svg viewBox="0 0 160 140" className={svgClass} aria-hidden="true">
        {/* Clipboard */}
        <rect x="30" y="25" width="90" height="100" rx="6" {...strokeProps} fill={`${primaryColor}08`} />
        {/* Clip */}
        <rect x="60" y="18" width="40" height="14" rx="5" {...strokeProps} fill={`${primaryColor}15`} />
        {/* Check items */}
        <rect x="42" y="50" width="14" height="14" rx="3" {...strokeProps} fill={`${primaryColor}20`} />
        <path d="M45 57 L48 61 L56 52" {...{ ...strokeProps, stroke: primaryColor, strokeWidth: "2.5" }} />
        <line x1="64" y1="57" x2="104" y2="57" {...accentProps} />

        <rect x="42" y="72" width="14" height="14" rx="3" {...strokeProps} fill={`${primaryColor}20`} />
        <path d="M45 79 L48 83 L56 74" {...{ ...strokeProps, stroke: primaryColor, strokeWidth: "2.5" }} />
        <line x1="64" y1="79" x2="104" y2="79" {...accentProps} />

        <rect x="42" y="94" width="14" height="14" rx="3" {...strokeProps} />
        <line x1="64" y1="101" x2="96" y2="101" {...accentProps} />

        {/* Pencil */}
        <rect x="112" y="60" width="10" height="38" rx="2" transform="rotate(30 117 80)" {...strokeProps} fill={`${secondaryColor}25`} />
        <path d="M122 95 L126 104 L118 98 Z" {...accentProps} fill={`${primaryColor}30`} />

        {/* Sparkles */}
        <circle cx="22" cy="45" r="2.5" {...{ ...accentProps, fill: secondaryColor }} />
        <path d="M130 30 L131.5 25 L133 30 L138 31.5 L133 33 L131.5 38 L130 33 L125 31.5 Z" {...{ ...accentProps, strokeWidth: "1.5" }} />
      </svg>
    );
  }

  if (type === "rocket") {
    return (
      <svg viewBox="0 0 160 140" className={svgClass} aria-hidden="true">
        {/* Rocket body */}
        <path d="M80 15 Q95 25 100 55 L100 90 Q90 98 80 100 Q70 98 60 90 L60 55 Q65 25 80 15 Z" {...strokeProps} fill={`${primaryColor}15`} />
        {/* Nose cone */}
        <path d="M80 15 Q90 30 92 45 L68 45 Q70 30 80 15 Z" {...accentProps} fill={`${secondaryColor}25`} />
        {/* Window */}
        <circle cx="80" cy="65" r="10" {...strokeProps} fill={`${secondaryColor}20`} />
        <circle cx="80" cy="65" r="5" {...strokeProps} fill={`${primaryColor}30`} />
        {/* Wings */}
        <path d="M60 72 L40 90 L60 88 Z" {...strokeProps} fill={`${primaryColor}20`} />
        <path d="M100 72 L120 90 L100 88 Z" {...strokeProps} fill={`${primaryColor}20`} />
        {/* Exhaust flame */}
        <path d="M70 100 Q75 115 80 125 Q85 115 90 100" {...{ ...strokeProps, stroke: "#f97316" }} fill="none" />
        <path d="M73 100 Q78 110 80 118 Q82 110 87 100" {...{ ...strokeProps, stroke: "#fbbf24", strokeWidth: "2" }} fill="none" />
        {/* Stars */}
        <path d="M25 30 L26.5 25 L28 30 L33 31.5 L28 33 L26.5 38 L25 33 L20 31.5 Z" {...accentProps} fill={`${secondaryColor}25`} />
        <path d="M130 50 L131 47 L132 50 L135 51 L132 52 L131 55 L130 52 L127 51 Z" {...{ ...accentProps, strokeWidth: "1.5" }} />
        <circle cx="140" cy="25" r="2.5" {...{ fill: secondaryColor }} />
        <circle cx="18" cy="80" r="2" {...{ fill: `${primaryColor}60` }} />
        <circle cx="145" cy="75" r="3" {...{ ...accentProps, fill: `${secondaryColor}80` }} />
      </svg>
    );
  }

  if (type === "brain") {
    return (
      <svg viewBox="0 0 160 140" className={svgClass} aria-hidden="true">
        {/* Brain shape left */}
        <path d="M80 35 Q65 30 55 40 Q42 42 40 55 Q36 68 45 78 Q48 90 60 92 Q70 98 80 95" {...strokeProps} fill={`${primaryColor}12`} />
        {/* Brain shape right */}
        <path d="M80 35 Q95 30 105 40 Q118 42 120 55 Q124 68 115 78 Q112 90 100 92 Q90 98 80 95" {...strokeProps} fill={`${primaryColor}12`} />
        {/* Center divide */}
        <line x1="80" y1="35" x2="80" y2="95" {...accentProps} strokeDasharray="4 3" />
        {/* Brain wrinkles left */}
        <path d="M52 55 Q60 58 55 65" {...accentProps} />
        <path d="M48 68 Q58 70 54 78" {...accentProps} />
        {/* Brain wrinkles right */}
        <path d="M108 55 Q100 58 105 65" {...accentProps} />
        <path d="M112 68 Q102 70 106 78" {...accentProps} />
        {/* Lightbulb */}
        <circle cx="80" cy="12" r="9" {...strokeProps} fill={`${secondaryColor}20`} />
        <path d="M75 20 L75 25 L85 25 L85 20" {...strokeProps} />
        <line x1="78" y1="25" x2="82" y2="25" {...{ ...strokeProps, strokeWidth: "2" }} />
        {/* Glow lines */}
        <line x1="80" y1="0" x2="80" y2="-4" {...{ ...accentProps, strokeWidth: "1.5" }} transform="translate(0,4)" />
        <line x1="95" y1="8" x2="99" y2="4" {...{ ...accentProps, strokeWidth: "1.5" }} />
        <line x1="65" y1="8" x2="61" y2="4" {...{ ...accentProps, strokeWidth: "1.5" }} />
        {/* Sparkles */}
        <path d="M130 35 L131.5 30 L133 35 L138 36.5 L133 38 L131.5 43 L130 38 L125 36.5 Z" {...{ ...accentProps, strokeWidth: "1.5" }} fill={`${secondaryColor}20`} />
        <circle cx="22" cy="50" r="2.5" {...{ fill: `${primaryColor}60` }} />
      </svg>
    );
  }

  if (type === "calendar") {
    return (
      <svg viewBox="0 0 160 140" className={svgClass} aria-hidden="true">
        {/* Calendar body */}
        <rect x="20" y="30" width="120" height="95" rx="8" {...strokeProps} fill={`${primaryColor}08`} />
        {/* Header strip */}
        <rect x="20" y="30" width="120" height="28" rx="8" {...strokeProps} fill={`${primaryColor}20`} />
        <rect x="20" y="48" width="120" height="10" {...strokeProps} fill={`${primaryColor}20`} />
        {/* Calendar clips */}
        <line x1="50" y1="20" x2="50" y2="38" {...{ ...strokeProps, strokeWidth: "3" }} />
        <line x1="110" y1="20" x2="110" y2="38" {...{ ...strokeProps, strokeWidth: "3" }} />
        {/* Month label */}
        <rect x="55" y="36" width="50" height="10" rx="3" {...accentProps} fill={`${secondaryColor}15`} />
        {/* Grid dots / dates */}
        {[
          [35, 75], [60, 75], [85, 75], [110, 75], [135, 75],
          [35, 95], [60, 95], [85, 95], [110, 95], [135, 95],
          [35, 115], [60, 115], [85, 115],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="4" {...{ ...strokeProps, strokeWidth: "1.5" }} fill={i === 3 ? `${primaryColor}40` : i === 8 ? `${secondaryColor}50` : "none"} />
        ))}
        {/* Check mark on one date */}
        <path d="M83 92 L86 96 L92 88" {...{ ...strokeProps, strokeWidth: "2" }} />
        {/* Star */}
        <path d="M140 20 L141.5 15 L143 20 L148 21.5 L143 23 L141.5 28 L140 23 L135 21.5 Z" {...accentProps} fill={`${secondaryColor}25`} />
        <circle cx="18" cy="100" r="2.5" {...{ fill: `${primaryColor}50` }} />
        <circle cx="150" cy="80" r="2" {...{ fill: secondaryColor }} />
      </svg>
    );
  }

  if (type === "student") {
    return (
      <svg viewBox="0 0 160 140" className={svgClass} aria-hidden="true">
        {/* Desk */}
        <rect x="15" y="95" width="130" height="8" rx="4" {...strokeProps} fill={`${primaryColor}15`} />
        <line x1="30" y1="103" x2="30" y2="125" {...{ ...strokeProps, strokeWidth: "3" }} />
        <line x1="130" y1="103" x2="130" y2="125" {...{ ...strokeProps, strokeWidth: "3" }} />
        {/* Book on desk */}
        <rect x="80" y="75" width="45" height="22" rx="3" {...strokeProps} fill={`${secondaryColor}20`} />
        <line x1="102" y1="75" x2="102" y2="97" {...accentProps} />
        {/* Person head */}
        <circle cx="55" cy="50" r="18" {...strokeProps} fill={`${primaryColor}12`} />
        {/* Hair */}
        <path d="M38 47 Q40 32 55 30 Q70 32 72 47" {...{ ...strokeProps, strokeWidth: "3" }} fill={`${primaryColor}20`} />
        {/* Face */}
        <circle cx="49" cy="50" r="2" fill={primaryColor} />
        <circle cx="61" cy="50" r="2" fill={primaryColor} />
        <path d="M50 57 Q55 61 60 57" {...{ ...strokeProps, strokeWidth: "2" }} />
        {/* Body */}
        <path d="M40 68 Q55 72 55 95 L35 95" {...strokeProps} fill={`${primaryColor}10`} />
        <path d="M70 68 Q55 72 55 95 L75 95" {...strokeProps} fill={`${primaryColor}10`} />
        {/* Arm to book */}
        <path d="M70 78 Q82 80 88 82" {...{ ...strokeProps, strokeWidth: "2.5" }} />
        {/* Thought bubble / light idea */}
        <circle cx="100" cy="32" r="5" {...accentProps} fill={`${secondaryColor}20`} />
        <circle cx="110" cy="22" r="7" {...accentProps} fill={`${secondaryColor}20`} />
        <circle cx="122" cy="14" r="9" {...accentProps} fill={`${secondaryColor}20`} />
        <path d="M118 10 L120 5 L122 10 L127 12 L122 14 L120 19 L118 14 L113 12 Z" {...{ ...strokeProps, stroke: primaryColor, strokeWidth: "1.5" }} />
        {/* Sparkles */}
        <circle cx="20" cy="40" r="2" {...{ fill: `${primaryColor}60` }} />
        <circle cx="148" cy="55" r="2.5" {...{ fill: secondaryColor }} />
      </svg>
    );
  }

  if (type === "stars") {
    return (
      <svg viewBox="0 0 160 130" className={svgClass} aria-hidden="true">
        <path d="M80 20 L86 42 L110 42 L91 55 L98 77 L80 64 L62 77 L69 55 L50 42 L74 42 Z" {...strokeProps} fill={`${primaryColor}20`} />
        <path d="M130 50 L133 60 L143 60 L135 66 L138 76 L130 70 L122 76 L125 66 L117 60 L127 60 Z" {...{ ...accentProps, strokeWidth: "1.5" }} fill={`${secondaryColor}20`} />
        <path d="M30 60 L32.5 68 L41 68 L34 73 L36.5 81 L30 76 L23.5 81 L26 73 L19 68 L27.5 68 Z" {...{ ...accentProps, strokeWidth: "1.5" }} fill={`${secondaryColor}20`} />
        <circle cx="80" cy="105" r="5" {...{ ...strokeProps, fill: `${primaryColor}20` }} />
        <circle cx="45" cy="100" r="3" {...{ fill: `${primaryColor}40` }} />
        <circle cx="115" cy="100" r="3" {...{ fill: `${primaryColor}40` }} />
        <circle cx="25" cy="30" r="2.5" {...{ fill: secondaryColor }} />
        <circle cx="140" cy="35" r="2.5" {...{ fill: secondaryColor }} />
        <line x1="80" y1="85" x2="80" y2="100" {...accentProps} strokeDasharray="3 3" />
      </svg>
    );
  }

  // Empty / generic
  return (
    <svg viewBox="0 0 160 130" className={svgClass} aria-hidden="true">
      <circle cx="80" cy="65" r="45" {...strokeProps} fill={`${primaryColor}08`} strokeDasharray="8 4" />
      <path d="M60 60 Q80 40 100 60 Q80 80 60 60" {...accentProps} fill={`${secondaryColor}20`} />
      <circle cx="80" cy="65" r="8" {...strokeProps} fill={`${primaryColor}20`} />
      <path d="M130 25 L131.5 20 L133 25 L138 26.5 L133 28 L131.5 33 L130 28 L125 26.5 Z" {...{ ...accentProps, strokeWidth: "1.5" }} />
      <circle cx="25" cy="50" r="3" {...{ fill: `${primaryColor}50` }} />
      <circle cx="140" cy="85" r="2.5" {...{ fill: secondaryColor }} />
    </svg>
  );
}
