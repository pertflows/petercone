import { useId } from "react";

/**
 * Hand-drawn style botanical artwork inspired by Dutch still-life painting:
 * flamed “broken” tulips, olive sprigs, lily-of-the-valley and a painted-lady
 * butterfly. All vector so they stay crisp and tiny.
 */

type Tone = "rose" | "blush" | "ivory";

const TONES: Record<Tone, { base: string; mid: string; flame: string; edge: string }> = {
  rose: { base: "#f6d7d2", mid: "#e88c9d", flame: "#bb2968", edge: "#fff4ea" },
  blush: { base: "#fbe9e2", mid: "#eea1d7", flame: "#c84a7c", edge: "#fffaf2" },
  ivory: { base: "#fbf3e2", mid: "#ecd9b8", flame: "#c4436f", edge: "#ffffff" },
};

/** A single flamed tulip head, drawn in a 100×120 box with the stem attachment at (50,118). */
export function TulipHead({ tone = "rose", open = 0.5 }: { tone?: Tone; open?: number }) {
  const id = useId().replace(/:/g, "");
  const t = TONES[tone];
  const spread = 10 + open * 16;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}p`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={t.mid} />
          <stop offset="0.55" stopColor={t.base} />
          <stop offset="1" stopColor={t.edge} />
        </linearGradient>
        <linearGradient id={`${id}q`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor={t.flame} stopOpacity="0.9" />
          <stop offset="1" stopColor={t.mid} />
        </linearGradient>
      </defs>
      {/* back petals */}
      <path d={`M50,112 C${30 - spread},96 ${22 - spread},50 ${26 - spread / 2},14 C36,28 44,40 50,52 C56,40 64,28 ${74 + spread / 2},14 C${78 + spread},50 ${70 + spread},96 50,112Z`} fill={`url(#${id}q)`} opacity="0.85" />
      {/* left petal */}
      <path d={`M50,114 C${24 - spread / 2},104 ${18 - spread / 2},62 ${30 - spread / 3},22 C40,30 50,52 52,80 C52,96 52,106 50,114Z`} fill={`url(#${id}p)`} stroke={t.flame} strokeOpacity="0.35" strokeWidth="0.6" />
      {/* right petal */}
      <path d={`M50,114 C${76 + spread / 2},104 ${82 + spread / 2},62 ${70 + spread / 3},22 C60,30 50,52 48,80 C48,96 48,106 50,114Z`} fill={`url(#${id}p)`} stroke={t.flame} strokeOpacity="0.35" strokeWidth="0.6" />
      {/* centre petal */}
      <path d="M50,116 C34,106 32,60 42,14 C46,22 50,26 50,26 C50,26 54,22 58,14 C68,60 66,106 50,116Z" fill={`url(#${id}p)`} stroke={t.flame} strokeOpacity="0.4" strokeWidth="0.6" />
      {/* flames — feathered brush strokes */}
      <g fill="none" stroke={t.flame} strokeLinecap="round" opacity="0.85">
        <path d="M50,108 C47,84 45,52 44,24" strokeWidth="2.6" />
        <path d="M50,104 C53,80 55,50 56,22" strokeWidth="1.6" />
        <path d="M46,106 C40,86 38,62 40,36" strokeWidth="1" opacity="0.7" />
        <path d={`M44,108 C${32 - spread / 3},92 ${28 - spread / 3},62 ${32 - spread / 3},32`} strokeWidth="1.8" />
        <path d={`M56,108 C${68 + spread / 3},92 ${72 + spread / 3},62 ${68 + spread / 3},32`} strokeWidth="1.8" />
        <path d={`M47,110 C${36 - spread / 3},100 ${30 - spread / 3},80 ${30 - spread / 3},60`} strokeWidth="0.9" opacity="0.6" />
        <path d={`M53,110 C${64 + spread / 3},100 ${70 + spread / 3},80 ${70 + spread / 3},60`} strokeWidth="0.9" opacity="0.6" />
      </g>
      {/* highlight */}
      <path d="M45,30 C42,52 43,78 47,98" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Leaf({ d, shade = 0 }: { d: string; shade?: number }) {
  const fills = ["#5c6a2c", "#727f37", "#46521f", "#8a8f45"];
  return <path d={d} fill={fills[shade % fills.length]} stroke="#2f3712" strokeWidth="0.5" strokeOpacity="0.6" />;
}

/** A full tulip with stem and leaves, drawn in a 200×480 box. */
export function Tulip({ tone = "rose", lean = 0, open = 0.5, className, style }: { tone?: Tone; lean?: number; open?: number; className?: string; style?: React.CSSProperties }) {
  const tip = 100 + lean * 60;
  return (
    <svg viewBox="0 0 200 480" className={className} style={style} overflow="visible" aria-hidden>
      <path d={`M100,480 C100,380 ${100 + lean * 10},260 ${tip},130`} stroke="#5f6b2a" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d={`M100,480 C100,380 ${100 + lean * 10},260 ${tip},130`} stroke="#9aa55a" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6" transform="translate(-1.5 0)" />
      <Leaf d={`M100,470 C60,400 40,300 ${36 + lean * 20},210 C70,280 96,360 104,440 Z`} shade={0} />
      <Leaf d={`M100,460 C140,410 168,350 ${178 - lean * 10},300 C150,330 118,380 98,430 Z`} shade={1} />
      <path d={`M100,470 C70,400 52,300 ${38 + lean * 20},214`} stroke="#bfc77e" strokeWidth="0.8" fill="none" opacity="0.6" />
      <g transform={`translate(${tip - 50 * 1.25} ${130 - 118 * 1.25}) scale(1.25) rotate(${lean * 18} 50 118)`}>
        <TulipHead tone={tone} open={open} />
      </g>
    </svg>
  );
}

/** Olive sprig, 240×80. */
export function OliveSprig({ className, style, fruit = true }: { className?: string; style?: React.CSSProperties; fruit?: boolean }) {
  const leaves = [
    [30, 40, -35], [48, 44, 30], [66, 36, -30], [84, 42, 32], [102, 34, -28], [120, 40, 30], [138, 32, -26], [156, 38, 28], [174, 30, -22], [192, 34, 24],
  ];
  return (
    <svg viewBox="0 0 240 80" className={className} style={style} aria-hidden>
      <path d="M8,48 C60,44 140,38 228,28" stroke="#6b5a2a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {leaves.map(([x, y, r], i) => (
        <path key={i} transform={`translate(${x} ${y}) rotate(${r})`} d="M0,0 C6,-5 22,-6 30,0 C22,6 6,5 0,0Z" fill={i % 2 ? "#7c8540" : "#5d6a2d"} stroke="#3d4519" strokeWidth="0.4" />
      ))}
      <path d="M224,29 C230,24 238,24 240,26 C236,30 230,31 224,29Z" fill="#7c8540" />
      {fruit && (
        <g>
          <ellipse cx="96" cy="50" rx="5" ry="6.5" fill="#3a3418" />
          <ellipse cx="94.6" cy="48" rx="1.4" ry="2" fill="#8a7d4a" opacity="0.7" />
          <ellipse cx="150" cy="44" rx="4.6" ry="6" fill="#58602a" />
          <ellipse cx="148.8" cy="42" rx="1.2" ry="1.8" fill="#c4b967" opacity="0.7" />
        </g>
      )}
    </svg>
  );
}

/** Lily-of-the-valley stem, 80×200. */
export function LilyOfTheValley({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const bells = [[40, 40], [48, 62], [54, 86], [56, 112], [54, 138]];
  return (
    <svg viewBox="0 0 80 200" className={className} style={style} aria-hidden>
      <path d="M20,200 C24,140 36,80 30,20" stroke="#6f7b34" strokeWidth="1.6" fill="none" />
      <path d="M22,200 C2,150 4,100 14,60 C24,110 26,160 24,200Z" fill="#5f6b2a" opacity="0.9" />
      {bells.map(([x, y], i) => (
        <g key={i}>
          <path d={`M${31 - i},${y - 14} C${x - 4},${y - 12} ${x},${y - 8} ${x},${y - 4}`} stroke="#6f7b34" strokeWidth="0.9" fill="none" />
          <path d={`M${x - 6},${y} C${x - 6},${y - 7} ${x + 6},${y - 7} ${x + 6},${y} C${x + 6},${y + 3} ${x + 4},${y + 5} ${x + 3},${y + 4} C${x + 2},${y + 6} ${x - 2},${y + 6} ${x - 3},${y + 4} C${x - 4},${y + 5} ${x - 6},${y + 3} ${x - 6},${y}Z`} fill="#fdf8ee" stroke="#c9b991" strokeWidth="0.5" />
        </g>
      ))}
    </svg>
  );
}

/** Five-petal blossom (like the mandevilla on the Amalfi pier), 40×40. */
export function Blossom({ color = "#fdf8ee", center = "#c4b967", className, style }: { color?: string; center?: string; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="-20 -20 40 40" className={className} style={style} aria-hidden>
      {[0, 72, 144, 216, 288].map((r) => (
        <path key={r} transform={`rotate(${r})`} d="M0,-2 C-7,-8 -6,-18 2,-18 C9,-16 7,-7 0,-2Z" fill={color} stroke="#000" strokeOpacity="0.12" strokeWidth="0.5" />
      ))}
      <circle r="3" fill={center} />
      <circle r="1.2" fill="#847334" />
    </svg>
  );
}

/** Painted-lady butterfly, 80×60. */
export function Butterfly({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 80 60" className={className} style={style} aria-hidden>
      <g stroke="#3b2414" strokeWidth="0.6">
        <path d="M40,30 C30,8 8,2 4,14 C2,24 18,30 40,32Z" fill="#d9894a" />
        <path d="M40,30 C50,8 72,2 76,14 C78,24 62,30 40,32Z" fill="#d9894a" />
        <path d="M40,32 C26,34 14,44 20,54 C26,58 36,48 40,34Z" fill="#c4743a" />
        <path d="M40,32 C54,34 66,44 60,54 C54,58 44,48 40,34Z" fill="#c4743a" />
      </g>
      <g fill="#2b1d15">
        <path d="M4,14 C6,6 16,4 22,8 C16,10 10,14 8,20Z" />
        <path d="M76,14 C74,6 64,4 58,8 C64,10 70,14 72,20Z" />
        <circle cx="12" cy="11" r="1.4" fill="#fbf6ec" />
        <circle cx="68" cy="11" r="1.4" fill="#fbf6ec" />
        <circle cx="16" cy="16" r="1" fill="#fbf6ec" />
        <circle cx="64" cy="16" r="1" fill="#fbf6ec" />
        <circle cx="26" cy="22" r="2" />
        <circle cx="54" cy="22" r="2" />
        <circle cx="24" cy="48" r="1.6" />
        <circle cx="56" cy="48" r="1.6" />
      </g>
      <path d="M40,18 L40,44" stroke="#2b1d15" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M40,19 C38,12 34,8 31,6 M40,19 C42,12 46,8 49,6" stroke="#2b1d15" strokeWidth="0.6" fill="none" />
    </svg>
  );
}

/**
 * A still-life arrangement of tulips, lilies and leaves — used at the edges of
 * the hero and the envelope stage. 360×520.
 */
export function Bouquet({ className, style, mirror = false }: { className?: string; style?: React.CSSProperties; mirror?: boolean }) {
  return (
    <div className={className} style={{ ...style, transform: `${style?.transform ?? ""} ${mirror ? "scaleX(-1)" : ""}` }} aria-hidden>
      <div className="relative h-full w-full">
        <Tulip tone="ivory" lean={-0.55} open={0.7} className="absolute left-[2%] top-[18%] h-[70%] w-auto" />
        <Tulip tone="rose" lean={0.35} open={0.4} className="absolute left-[30%] top-[2%] h-[82%] w-auto" />
        <LilyOfTheValley className="absolute left-[48%] top-[38%] h-[44%] w-auto rotate-[14deg]" />
        <Tulip tone="blush" lean={0.75} open={0.9} className="absolute left-[44%] top-[26%] h-[64%] w-auto" />
        <Blossom className="absolute left-[18%] top-[62%] h-[9%] w-auto" />
        <Blossom color="#e05a8c" center="#fbe9e2" className="absolute left-[64%] top-[70%] h-[8%] w-auto" />
        <Blossom className="absolute left-[38%] top-[76%] h-[7%] w-auto" />
      </div>
    </div>
  );
}
