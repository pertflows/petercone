import Image from "next/image";
import { useId } from "react";

interface Props {
  src: string;
  alt: string;
  focus?: string;
  mono?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Ornate antique gilt oval frame. The photograph sits in an elliptical
 * aperture; the gilding is layered SVG (moulding, bead-and-reel, acanthus).
 */
export function GoldFrame({ src, alt, focus = "50% 50%", mono, className = "", sizes = "(max-width: 768px) 80vw, 420px", priority }: Props) {
  const id = useId().replace(/:/g, "");
  return (
    <div className={`relative aspect-[300/380] ${className}`}>
      <div className="absolute overflow-hidden" style={{ left: "17%", right: "17%", top: "15.5%", bottom: "15.5%", clipPath: "ellipse(50% 50% at 50% 50%)" }}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" style={{ objectPosition: focus, filter: mono ? "grayscale(1) contrast(1.06) sepia(0.12)" : "saturate(0.92) sepia(0.12) contrast(1.02)" }} />
        <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 40px rgb(40 20 5 / 0.55)", borderRadius: "50%" }} />
      </div>
      <svg viewBox="0 0 300 380" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f3dfa2" />
            <stop offset="0.18" stopColor="#c59c4c" />
            <stop offset="0.36" stopColor="#8a6424" />
            <stop offset="0.52" stopColor="#e8cd85" />
            <stop offset="0.7" stopColor="#a47a35" />
            <stop offset="0.86" stopColor="#6b4b1a" />
            <stop offset="1" stopColor="#d5b46c" />
          </linearGradient>
          <linearGradient id={`${id}h`} x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff2c4" />
            <stop offset="0.5" stopColor="#b58b40" />
            <stop offset="1" stopColor="#5c3f14" />
          </linearGradient>
          <filter id={`${id}s`} x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#2b1608" floodOpacity="0.45" />
          </filter>
          <filter id={`${id}e`}>
            <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" seed="9" />
            <feColorMatrix values="0 0 0 0 0.25  0 0 0 0 0.15  0 0 0 0 0.05  0 0 0 0.35 0" />
            <feComposite in2="SourceGraphic" operator="in" />
          </filter>
          <g id={`${id}a`}>
            {/* acanthus scroll cartouche */}
            <path d="M0,-26 C10,-26 20,-18 18,-6 C16,4 6,6 2,0 C-1,-5 4,-11 9,-8 C5,-4 7,0 10,-2 C14,-6 10,-18 0,-18 C-10,-18 -14,-6 -10,-2 C-7,0 -5,-4 -9,-8 C-4,-11 1,-5 -2,0 C-6,6 -16,4 -18,-6 C-20,-18 -10,-26 0,-26 Z" />
            <path d="M-34,4 C-26,-10 -12,-6 -6,4 C-14,0 -24,2 -34,4 Z M34,4 C26,-10 12,-6 6,4 C14,0 24,2 34,4 Z" />
            <circle cx="0" cy="-31" r="4.5" />
            <path d="M-5,6 Q0,16 5,6 Q0,10 -5,6Z" />
          </g>
        </defs>
        <g filter={`url(#${id}s)`}>
          {/* outer moulding with aperture cut out */}
          <path fillRule="evenodd" fill={`url(#${id}g)`} d="M150,12 A136,178 0 1,1 149.9,12 Z M150,56 A99,135 0 1,0 150.1,56 Z" />
          {/* bead-and-reel ring */}
          <ellipse cx="150" cy="190" rx="126" ry="168" fill="none" stroke={`url(#${id}h)`} strokeWidth="5.5" strokeDasharray="0.1 7.2" strokeLinecap="round" />
          <ellipse cx="150" cy="190" rx="118" ry="159" fill="none" stroke="#6b4b1a" strokeWidth="1" opacity="0.7" />
          <ellipse cx="150" cy="190" rx="112" ry="151" fill="none" stroke={`url(#${id}h)`} strokeWidth="6" />
          <ellipse cx="150" cy="190" rx="104" ry="141" fill="none" stroke="#f6e3a8" strokeWidth="1.2" opacity="0.8" />
          <ellipse cx="150" cy="190" rx="101" ry="137" fill="none" stroke="#4a3210" strokeWidth="2.5" />
          <ellipse cx="150" cy="190" rx="135" ry="177" fill="none" stroke="#4a3210" strokeWidth="1.5" opacity="0.6" />
          {/* acanthus ornaments at the cardinal points */}
          <g fill={`url(#${id}h)`} stroke="#5c3f14" strokeWidth="0.6">
            <use href={`#${id}a`} transform="translate(150 22) scale(1.25)" />
            <use href={`#${id}a`} transform="translate(150 358) rotate(180) scale(1.1)" />
            <use href={`#${id}a`} transform="translate(22 190) rotate(-90) scale(0.85)" />
            <use href={`#${id}a`} transform="translate(278 190) rotate(90) scale(0.85)" />
          </g>
          {/* corner leaf tips */}
          <g fill={`url(#${id}g)`} stroke="#5c3f14" strokeWidth="0.5">
            {[[55, 62, -38], [245, 62, 38], [55, 318, -142], [245, 318, 142]].map(([x, y, r], i) => (
              <path key={i} transform={`translate(${x} ${y}) rotate(${r})`} d="M0,-14 C6,-8 6,4 0,12 C-6,4 -6,-8 0,-14Z M0,-10 L0,9" />
            ))}
          </g>
          <path fillRule="evenodd" fill="#fff" filter={`url(#${id}e)`} d="M150,12 A136,178 0 1,1 149.9,12 Z M150,56 A99,135 0 1,0 150.1,56 Z" />
        </g>
      </svg>
    </div>
  );
}
