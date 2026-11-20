import type { TimelineIcon } from "@/lib/wedding.config";

/**
 * Pen-and-ink style vignettes for the order of the day. Drawn with a single
 * stroke colour so they read like an engraved program.
 */
const common = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Rings() {
  return (
    <g {...common}>
      <ellipse cx="40" cy="60" rx="20" ry="21" />
      <ellipse cx="40" cy="60" rx="16.5" ry="17.5" strokeWidth="0.7" />
      <ellipse cx="62" cy="62" rx="19" ry="20" />
      <ellipse cx="62" cy="62" rx="15.5" ry="16.5" strokeWidth="0.7" />
      {/* pear-cut stone */}
      <path d="M40,24 C34,30 34,36 40,39 C46,36 46,30 40,24Z" />
      <path d="M40,24 L40,39 M36,31 L44,31" strokeWidth="0.6" />
      <path d="M36,38 L33,41 M44,38 L47,41" strokeWidth="0.9" />
      {/* sparkle */}
      <path d="M58,26 L58,34 M54,30 L62,30 M24,30 L24,35 M21.5,32.5 L26.5,32.5" strokeWidth="0.8" />
      {/* hatching */}
      <path d="M24,66 C26,74 31,79 37,81 M80,66 C78,74 73,79 67,82" strokeWidth="0.6" />
    </g>
  );
}

function Champagne() {
  return (
    <g {...common}>
      <g transform="rotate(-14 34 60)">
        <path d="M26,18 L42,18 C42,34 40,44 34,48 C28,44 26,34 26,18Z" />
        <path d="M34,48 L34,80 M26,82 C30,79 38,79 42,82" />
        <path d="M27,28 L41,28" strokeWidth="0.7" />
        <circle cx="32" cy="36" r="0.9" />
        <circle cx="36" cy="32" r="0.7" />
        <circle cx="34" cy="40" r="0.6" />
      </g>
      <g transform="rotate(14 66 60)">
        <path d="M58,18 L74,18 C74,34 72,44 66,48 C60,44 58,34 58,18Z" />
        <path d="M66,48 L66,80 M58,82 C62,79 70,79 74,82" />
        <path d="M59,28 L73,28" strokeWidth="0.7" />
        <circle cx="64" cy="36" r="0.9" />
        <circle cx="68" cy="31" r="0.7" />
      </g>
      {/* clink */}
      <path d="M50,10 L50,4 M44,12 L40,7 M56,12 L60,7" strokeWidth="0.9" />
    </g>
  );
}

function Plate() {
  return (
    <g {...common}>
      <ellipse cx="50" cy="56" rx="30" ry="30" />
      <ellipse cx="50" cy="56" rx="22" ry="22" strokeWidth="0.8" />
      <ellipse cx="50" cy="56" rx="26" ry="26" strokeWidth="0.5" strokeDasharray="1 3" />
      {/* fork */}
      <path d="M10,30 L10,44 M6,30 L6,40 C6,44 14,44 14,40 L14,30 M10,44 L10,86" />
      {/* knife */}
      <path d="M90,30 C94,38 94,50 90,56 L90,86 M90,56 L88,56" />
      {/* sprig garnish */}
      <path d="M42,58 C48,52 56,52 60,56" strokeWidth="0.9" />
      <path d="M46,55 C45,51 47,49 49,50 M52,53 C52,49 55,48 56,50" strokeWidth="0.8" />
    </g>
  );
}

function Cake() {
  return (
    <g {...common}>
      <path d="M22,84 L78,84 M18,88 L82,88" />
      <path d="M26,84 L26,64 L74,64 L74,84" />
      <path d="M33,64 L33,48 L67,48 L67,64" />
      <path d="M40,48 L40,36 L60,36 L60,48" />
      {/* scallop icing */}
      <path d="M26,68 q4,5 8,0 q4,5 8,0 q4,5 8,0 q4,5 8,0 q4,5 8,0 q4,5 8,0" strokeWidth="0.9" />
      <path d="M33,52 q4,4 8.5,0 q4,4 8.5,0 q4,4 8.5,0 q4,4 8.5,0" strokeWidth="0.9" />
      <path d="M40,40 q5,4 10,0 q5,4 10,0" strokeWidth="0.9" />
      {/* pearls */}
      <path d="M28,78 L72,78" strokeWidth="1.6" strokeDasharray="0.1 4" />
      {/* tiny tulip topper */}
      <path d="M50,36 L50,24 M50,24 C45,22 44,14 46,10 C48,13 50,13 50,13 C50,13 52,13 54,10 C56,14 55,22 50,24Z" />
      <path d="M50,30 C47,28 45,29 44,31 C46,32 48,31 50,30Z" strokeWidth="0.8" />
    </g>
  );
}

function Dancing() {
  return (
    <g {...common}>
      {/* gentleman */}
      <circle cx="40" cy="20" r="6" />
      <path d="M40,26 L38,52 L32,86 M38,52 L46,86 M39,32 L52,40 M39,32 L30,44 L36,48" />
      {/* lady */}
      <circle cx="60" cy="22" r="5.5" />
      <path d="M58,16 C64,12 68,18 66,24" strokeWidth="0.9" />
      <path d="M60,28 L57,48 C50,62 46,76 44,88 C56,86 70,86 82,88 C78,74 70,60 63,48 Z" />
      <path d="M59,34 L52,40 M60,34 L70,26 L72,20" />
      <path d="M52,70 C58,72 66,72 74,70 M48,80 C58,82 70,82 80,80" strokeWidth="0.6" />
      {/* music notes */}
      <path d="M80,40 L80,30 L88,28 L88,38 M80,30 L88,28" strokeWidth="0.9" />
      <circle cx="78.5" cy="40" r="2" />
      <circle cx="86.5" cy="38" r="2" />
      <path d="M14,34 L14,26 M14,26 L18,28" strokeWidth="0.9" />
      <circle cx="12.6" cy="34" r="1.7" />
    </g>
  );
}

const MAP: Record<TimelineIcon, () => React.ReactElement> = {
  rings: Rings,
  champagne: Champagne,
  plate: Plate,
  cake: Cake,
  dancing: Dancing,
};

export function ProgramIcon({ icon, className }: { icon: TimelineIcon; className?: string }) {
  const Cmp = MAP[icon];
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <Cmp />
    </svg>
  );
}
