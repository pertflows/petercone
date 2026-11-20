import { MONOGRAM_AMP, MONOGRAM_E, MONOGRAM_J, MONOGRAM_VIEWBOX } from "@/lib/monogram-paths";

export function Monogram({ className = "", title = "Emily & Joe" }: { className?: string; title?: string }) {
  return (
    <svg viewBox={MONOGRAM_VIEWBOX} className={className} role="img" aria-label={title} fill="currentColor">
      <path d={MONOGRAM_E} />
      <path d={MONOGRAM_J} />
      <path d={MONOGRAM_AMP} className="text-gold-deep" fill="currentColor" />
    </svg>
  );
}
