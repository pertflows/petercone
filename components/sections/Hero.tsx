import Image from "next/image";
import type { WeddingSettings } from "@/lib/wedding.config";
import { photos } from "@/lib/wedding.config";
import { Bouquet, Butterfly, OliveSprig } from "@/components/ornaments/Botanicals";
import { Lace } from "@/components/ornaments/Stationery";
import { WaxSeal } from "@/components/ornaments/WaxSeal";
import { Parallax, Reveal } from "@/components/motion";

export function Hero({ s, guestName }: { s: WeddingSettings; guestName?: string | null }) {
  const c = s.couple;
  return (
    <section id="invitation" aria-label="The invitation" className="linen-olive relative isolate overflow-hidden text-parchment">
      {/* inner engraved border, like a printed card */}
      <div aria-hidden className="pointer-events-none absolute inset-3 border border-gold/40 sm:inset-5" />
      <div aria-hidden className="pointer-events-none absolute inset-[18px] border border-gold/20 sm:inset-[26px]" />

      {/* still-life florals at the margins */}
      <Parallax speed={0.12} className="pointer-events-none absolute -bottom-36 -left-28 z-0 h-[300px] w-[220px] opacity-90 sm:-left-16 sm:h-[560px] sm:w-[400px] lg:left-0">
        <Bouquet className="h-full w-full" />
      </Parallax>
      <Parallax speed={0.2} className="pointer-events-none absolute -bottom-16 -right-28 z-0 hidden h-[300px] w-[220px] opacity-80 sm:-right-10 sm:block sm:h-[460px] sm:w-[330px] lg:right-0">
        <Bouquet mirror className="h-full w-full" />
      </Parallax>
      <div aria-hidden className="pointer-events-none absolute left-[12%] top-[16%] z-0 hidden w-14 sm:block" style={{ animation: "float-petal 9s ease-in-out infinite" }}>
        <Butterfly className="w-full rotate-[-18deg]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col items-center px-6 pb-24 pt-14 text-center sm:pt-20">
        <Reveal gate y={10}>
          <p className="eyebrow text-parchment/75">{guestName ? <>Dear {guestName}</> : "Together with their families"}</p>
        </Reveal>

        {/* names + portrait */}
        <div className="relative mt-6 grid w-full grid-cols-1 items-center justify-items-center md:mt-10 md:grid-cols-[1fr_auto_1fr]">
          <Reveal gate delay={0.15} className="relative z-20 md:-mr-14 md:justify-self-end">
            <h1 className="display text-[clamp(4.6rem,22vw,11.5rem)] md:text-[clamp(6rem,10.5vw,9.75rem)] tracking-[-0.02em] text-ivory [text-shadow:0_2px_30px_rgb(20_24_8/0.5)]">
              <span className="sr-only">{c.primary} — </span>
              <span aria-hidden>{c.brideFirst.toUpperCase()}</span>
            </h1>
          </Reveal>

          <Reveal gate delay={0.35} y={40} className="relative z-10 -my-6 md:my-0">
            <div className="relative rotate-[-2.5deg]">
              <Lace tone="cream" width={22} className="bg-parchment p-2.5 shadow-[0_30px_60px_-20px_rgb(10_12_2/0.7)]">
                <div className="relative h-[clamp(230px,60vw,440px)] w-[clamp(175px,46vw,330px)] md:h-[clamp(300px,34vw,440px)] md:w-[clamp(225px,25vw,330px)] overflow-hidden">
                  <Image
                    src={photos.hero.src}
                    alt={photos.hero.alt}
                    fill
                    priority
                    sizes="(max-width: 768px) 60vw, 330px"
                    className="object-cover"
                    style={{ objectPosition: photos.hero.focus, filter: "sepia(0.18) saturate(0.9) contrast(1.03)" }}
                  />
                </div>
              </Lace>
              <OliveSprig className="absolute -left-12 -top-6 w-36 -rotate-[28deg] sm:-left-16 sm:w-44" />
            </div>
          </Reveal>

          <Reveal gate delay={0.25} className="relative z-20 md:-ml-14 md:justify-self-start">
            <p aria-hidden className="display text-[clamp(4.6rem,22vw,11.5rem)] md:text-[clamp(6rem,10.5vw,9.75rem)] tracking-[-0.02em] text-ivory [text-shadow:0_2px_30px_rgb(20_24_8/0.5)]">
              <span className="mr-2 font-display text-[0.5em] italic text-violet">&amp;</span>
              {c.groomFirst.toUpperCase()}
            </p>
          </Reveal>
        </div>

        <Reveal gate delay={0.6} className="relative z-20 -mt-2 md:-mt-10">
          <p className="script text-[clamp(2.6rem,11vw,5rem)] text-violet [text-shadow:0_2px_18px_rgb(30_10_20/0.45)]">are getting married!</p>
        </Reveal>

        <Reveal gate delay={0.75} className="mt-6 flex flex-col items-center gap-3">
          <p className="smallcaps text-sm text-parchment/80">{c.formal}</p>
          <div className="flex items-center gap-4 text-parchment">
            <span className="h-px w-10 bg-gold/70" />
            <time dateTime={s.date} className="font-display text-xl italic sm:text-2xl">
              Friday, August 27, 2027
            </time>
            <span className="h-px w-10 bg-gold/70" />
          </div>
          {s.ceremony.venueName && <p className="eyebrow text-parchment/70">{s.ceremony.venueName}</p>}
        </Reveal>

        <Reveal gate delay={0.9} className="mt-10">
          <a href="#rsvp" className="group relative inline-flex min-h-12 items-center gap-3 border border-gold/70 bg-olive-ink/40 py-2 pl-2 pr-6 text-parchment outline-offset-4 transition-colors duration-500 hover:bg-parchment hover:text-olive-deep">
            <WaxSeal className="h-11 w-11 transition-transform duration-700 group-hover:rotate-[20deg]" />
            <span className="flex flex-col items-start leading-tight">
              <span className="eyebrow text-[0.65rem]">Kindly reply</span>
              <span className="font-display text-base italic">Respond to our invitation</span>
            </span>
          </a>
        </Reveal>

        {/* scroll cue */}
        <a href="#letter" aria-label="Scroll to continue" className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-parchment/70">
          <span className="eyebrow text-[0.6rem]">Scroll</span>
          <span className="relative block h-10 w-px overflow-hidden bg-parchment/25">
            <span className="absolute left-0 top-0 block h-3 w-px bg-parchment" style={{ animation: "drift-down 2.2s ease-in-out infinite" }} />
          </span>
        </a>
      </div>
    </section>
  );
}
