/** Small stationery primitives shared across sections. */

/** Olive & cream awning stripe band with a scalloped edge. */
export function StripeBand({ className = "", edge = "bottom", height = 44, fine = false }: { className?: string; edge?: "bottom" | "top" | "both"; height?: number; fine?: boolean }) {
  const r = 11;
  const scallopB = `radial-gradient(circle at 50% 0, #000 ${r - 0.5}px, transparent ${r}px) bottom / ${r * 2}px ${r}px repeat-x`;
  const scallopT = `radial-gradient(circle at 50% 100%, #000 ${r - 0.5}px, transparent ${r}px) top / ${r * 2}px ${r}px repeat-x`;
  const body = (top: boolean, bottom: boolean) => `linear-gradient(#000,#000) ${top ? `0 ${r}px` : "0 0"} / 100% calc(100% - ${(top ? r : 0) + (bottom ? r : 0)}px) no-repeat`;
  const mask = edge === "bottom" ? `${body(false, true)}, ${scallopB}` : edge === "top" ? `${body(true, false)}, ${scallopT}` : `${body(true, true)}, ${scallopT}, ${scallopB}`;
  return <div aria-hidden className={`${fine ? "stripes-olive-fine" : "stripes-olive"} ${className}`} style={{ height, mask, WebkitMask: mask }} />;
}

/** A fine double rule with a central lozenge, like a printer’s ornament. */
export function Fleuron({ className = "", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 240 20" className={className} aria-hidden>
      <g stroke={color} fill="none" strokeWidth="0.8">
        <path d="M0,10 L100,10 M140,10 L240,10" />
        <path d="M20,13 L100,13 M140,13 L220,13" strokeWidth="0.4" />
        <path d="M120,2 L128,10 L120,18 L112,10 Z" />
        <path d="M104,10 C108,4 112,4 112,10 M136,10 C132,4 128,4 128,10" />
      </g>
      <circle cx="120" cy="10" r="2" fill={color} />
    </svg>
  );
}

/** Photo corner mounts (as in an old album). */
export function PhotoCorners({ color = "#2b1d15" }: { color?: string }) {
  const c = "absolute h-6 w-6";
  const tri = { background: color, clipPath: "polygon(0 0, 100% 0, 0 100%)" };
  return (
    <>
      <span aria-hidden className={`${c} -left-1 -top-1`} style={tri} />
      <span aria-hidden className={`${c} -right-1 -top-1 rotate-90`} style={tri} />
      <span aria-hidden className={`${c} -bottom-1 -right-1 rotate-180`} style={tri} />
      <span aria-hidden className={`${c} -bottom-1 -left-1 -rotate-90`} style={tri} />
    </>
  );
}

/** Rendered in place of any detail that hasn't been confirmed yet. */
export function Tba({ children = "Details to follow", className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <span className={`tba ${className}`} data-placeholder="true">
      {children}
    </span>
  );
}

/** Lace-bordered panel (border-image doily edge). */
export function Lace({ children, className = "", tone = "ivory", width = 24, style }: { children?: React.ReactNode; className?: string; tone?: "ivory" | "cream"; width?: number; style?: React.CSSProperties }) {
  return (
    <div
      className={className}
      style={{
        borderStyle: "solid",
        borderWidth: width,
        borderImage: `url(/textures/lace-${tone}.svg) 32 round`,
        backgroundClip: "padding-box",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
