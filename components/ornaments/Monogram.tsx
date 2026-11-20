import { MONOGRAM_AMP, MONOGRAM_E, MONOGRAM_J, MONOGRAM_VIEWBOX } from "@/lib/monogram-paths";

interface Props {
  className?: string;
  color?: string;
  ampColor?: string;
  title?: string;
}

/** The bespoke intertwined E & J monogram. */
export function Monogram({ className, color = "currentColor", ampColor, title = "E & J monogram" }: Props) {
  return (
    <svg viewBox={MONOGRAM_VIEWBOX} className={className} role="img" aria-label={title}>
      <g fill={color}>
        <path d={MONOGRAM_E} />
        <path d={MONOGRAM_J} />
        <path d={MONOGRAM_AMP} fill={ampColor ?? color} />
      </g>
    </svg>
  );
}

/** Raw monogram group for embedding inside other SVGs (wax seal etc.). */
export function MonogramPaths({ fill, ampFill }: { fill: string; ampFill?: string }) {
  return (
    <g fill={fill}>
      <path d={MONOGRAM_E} />
      <path d={MONOGRAM_J} />
      <path d={MONOGRAM_AMP} fill={ampFill ?? fill} />
    </g>
  );
}
