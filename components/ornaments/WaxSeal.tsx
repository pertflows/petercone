import { useId } from "react";
import { MONOGRAM_VIEWBOX } from "@/lib/monogram-paths";
import { MonogramPaths } from "./Monogram";

// Irregular outer edge of poured wax.
const BLOB =
  "M100,6 C118,5 128,13 141,15 C156,17 170,22 178,36 C186,49 196,58 195,76 C194,90 199,101 196,116 C193,132 189,143 180,155 C171,168 160,177 145,185 C131,192 118,196 101,195 C86,194 72,197 59,190 C45,183 33,178 23,165 C13,152 7,140 5,123 C3,108 2,96 5,81 C8,64 11,52 21,39 C31,26 44,18 59,12 C72,7 85,7 100,6 Z";

// Jagged crack line for the split-in-two animation.
const CRACK_LEFT = "M0,0 L104,0 L97,34 L108,61 L95,92 L106,121 L94,150 L103,176 L98,200 L0,200 Z";
const CRACK_RIGHT = "M104,0 L200,0 L200,200 L98,200 L103,176 L94,150 L106,121 L95,92 L108,61 L97,34 Z";

interface Props {
  className?: string;
  /** Render only one half (for the cracking animation). */
  half?: "left" | "right";
  label?: string;
}

export function WaxSeal({ className, half, label = "The Future Perticones" }: Props) {
  const id = useId().replace(/:/g, "");
  const [vx, vy, vw] = MONOGRAM_VIEWBOX.split(" ").map(Number);
  const size = 92;
  const scale = size / vw;
  const tx = 100 - size / 2 - vx * scale;
  const ty = 100 - size / 2 - vy * scale;

  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden={half ? true : undefined} role={half ? undefined : "img"} aria-label={half ? undefined : "Wax seal with the E & J monogram"}>
      <defs>
        <radialGradient id={`${id}w`} cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#e05a8c" />
          <stop offset="0.35" stopColor="#bb2968" />
          <stop offset="0.8" stopColor="#8f1d4c" />
          <stop offset="1" stopColor="#6a1236" />
        </radialGradient>
        <radialGradient id={`${id}d`} cx="50%" cy="50%" r="50%">
          <stop offset="0.82" stopColor="#a8225b" />
          <stop offset="0.95" stopColor="#7d1843" />
          <stop offset="1" stopColor="#c9407a" />
        </radialGradient>
        <filter id={`${id}s`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#2b0a17" floodOpacity="0.45" />
        </filter>
        <filter id={`${id}t`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 0.9  0 0 0 0 0.95  0 0 0 0.10 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <path id={`${id}c`} d="M100,100 m-68,0 a68,68 0 1,1 136,0 a68,68 0 1,1 -136,0" />
        <path id={`${id}b`} d="M100,100 m-75,0 a75,75 0 1,0 150,0" />
        {half && (
          <clipPath id={`${id}h`}>
            <path d={half === "left" ? CRACK_LEFT : CRACK_RIGHT} />
          </clipPath>
        )}
      </defs>
      <g clipPath={half ? `url(#${id}h)` : undefined} filter={`url(#${id}s)`}>
        <path d={BLOB} fill={`url(#${id}w)`} />
        <path d={BLOB} filter={`url(#${id}t)`} fill="#fff" />
        <circle cx="100" cy="100" r="78" fill={`url(#${id}d)`} />
        <circle cx="100" cy="100" r="77" fill="none" stroke="#5e0f30" strokeOpacity="0.5" strokeWidth="1.2" />
        <circle cx="100" cy="100" r="58" fill="none" stroke="#e98bb0" strokeOpacity="0.55" strokeWidth="0.8" strokeDasharray="0.5 3.2" strokeLinecap="round" />
        <g fontSize="10.5" letterSpacing="3" fill="#f6b3cd" fillOpacity="0.9" style={{ fontFamily: "var(--font-bodoni), serif" }}>
          <text>
            <textPath href={`#${id}c`} startOffset="25%" textAnchor="middle">
              {label.toUpperCase()}
            </textPath>
          </text>
          <text>
            <textPath href={`#${id}b`} startOffset="50%" textAnchor="middle">
              · 08 · 27 · 27 ·
            </textPath>
          </text>
        </g>
        {/* embossed monogram: highlight, shadow, face */}
        <g transform={`translate(${tx + 0.9} ${ty + 1.2}) scale(${scale})`} opacity="0.75">
          <MonogramPaths fill="#5a0d2c" />
        </g>
        <g transform={`translate(${tx - 0.8} ${ty - 0.9}) scale(${scale})`} opacity="0.6">
          <MonogramPaths fill="#f7a9c6" />
        </g>
        <g transform={`translate(${tx} ${ty}) scale(${scale})`}>
          <MonogramPaths fill="#b02862" />
        </g>
        {/* specular sheen */}
        <ellipse cx="72" cy="58" rx="34" ry="16" fill="#fff" opacity="0.09" transform="rotate(-28 72 58)" />
      </g>
    </svg>
  );
}
