import type { WeddingSettings } from "@/lib/wedding.config";
import { Monogram } from "@/components/ornaments/Monogram";
import { Bouquet, Butterfly } from "@/components/ornaments/Botanicals";
import { StripeBand } from "@/components/ornaments/Stationery";
import { Handwritten, Parallax, Reveal } from "@/components/motion";

export function Footer({ s }: { s: WeddingSettings }) {
  return (
    <footer className="relative overflow-hidden bg-espresso text-parchment">
      <StripeBand edge="bottom" height={34} />
      <Parallax speed={0.1} className="pointer-events-none absolute -bottom-48 -left-24 h-[340px] w-[240px] opacity-60 sm:-bottom-16 sm:left-[2%] sm:h-[420px] sm:w-[300px] sm:opacity-70">
        <Bouquet className="h-full w-full" />
      </Parallax>
      <Parallax speed={0.14} className="pointer-events-none absolute -bottom-52 -right-24 h-[320px] w-[230px] opacity-50 sm:-bottom-20 sm:right-[2%] sm:h-[380px] sm:w-[280px] sm:opacity-60">
        <Bouquet mirror className="h-full w-full" />
      </Parallax>
      <div aria-hidden className="pointer-events-none absolute right-[22%] top-24 w-12" style={{ animation: "float-petal 11s ease-in-out infinite" }}>
        <Butterfly className="w-full rotate-12 opacity-90" />
      </div>

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 pb-16 pt-24 text-center">
        <Reveal>
          <Monogram className="mx-auto h-36 w-36 text-gold-light sm:h-44 sm:w-44" ampColor="#eea1d7" />
        </Reveal>
        <Reveal delay={0.15}>
          <p className="display mt-6 text-[clamp(3rem,13vw,6rem)] tracking-[0.06em] text-ivory">{s.dateNumeric}</p>
          <p className="eyebrow mt-3 text-parchment/70">{s.couple.futureHouseName}</p>
        </Reveal>
        <p className="mt-12 text-[clamp(2.6rem,10vw,4rem)] leading-none text-violet">
          <Handwritten className="script" duration={2.4}>
            Ci vediamo presto
          </Handwritten>
        </p>
        <p className="mt-3 font-display text-lg italic text-parchment/80">See you soon — with love, {s.couple.primary}</p>
        <a href="#rsvp" className="mt-10 inline-flex min-h-12 items-center border border-gold/70 px-6 font-display text-lg italic text-parchment transition-colors hover:bg-parchment hover:text-espresso">
          Kindly reply
        </a>
        <div className="mt-20 h-px w-24 bg-gold/40" />
        <p className="mt-6 text-sm text-parchment/50">{s.couple.formal} · Friday, August 27, 2027</p>
      </div>
    </footer>
  );
}
