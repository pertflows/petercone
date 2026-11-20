import type { WeddingSettings } from "@/lib/wedding.config";
import { ProgramIcon } from "@/components/ornaments/ProgramIcons";
import { Fleuron, StripeBand } from "@/components/ornaments/Stationery";
import { Blossom, Bouquet } from "@/components/ornaments/Botanicals";
import { Parallax, Reveal } from "@/components/motion";

export function Timeline({ s }: { s: WeddingSettings }) {
  return (
    <section id="program" aria-labelledby="program-title" className="linen-olive relative overflow-hidden text-parchment">
      <StripeBand edge="top" fine height={26} className="opacity-90" />
      <Parallax speed={0.15} className="pointer-events-none absolute -left-28 top-1/3 hidden h-[460px] w-[320px] opacity-80 md:block">
        <Bouquet className="h-full w-full" />
      </Parallax>

      <div className="relative mx-auto max-w-5xl px-5 pb-24 pt-16 sm:px-8 md:pb-32 md:pt-24">
        <Reveal className="relative text-center">
          <p aria-hidden className="display select-none text-[clamp(3.6rem,15vw,9rem)] uppercase leading-none tracking-[0.04em] text-parchment/15">
            Wedding Day
          </p>
          <h2 id="program-title" className="script -mt-[0.55em] text-[clamp(3rem,12vw,6rem)] text-violet">
            {s.copy.programTitle}
          </h2>
          <Fleuron className="mx-auto mt-4 w-44 text-gold-light" />
          <p className="mx-auto mt-4 max-w-md text-lg italic text-parchment/75">{s.copy.programSubtitle}</p>
        </Reveal>

        <ol className="relative mx-auto mt-16 max-w-3xl">
          {/* the dotted gilt thread */}
          <span aria-hidden className="absolute bottom-6 left-[38px] top-6 w-px md:left-1/2" style={{ backgroundImage: "linear-gradient(var(--color-gold-light) 50%, transparent 0)", backgroundSize: "1px 7px" }} />
          {s.timeline.map((e, i) => {
            const right = i % 2 === 1;
            return (
              <Reveal as="li" key={e.title + i} delay={0.05 * i} className="relative grid grid-cols-[76px_1fr] items-center gap-5 py-6 md:grid-cols-[1fr_96px_1fr] md:gap-8">
                <div className={`order-2 md:order-none ${right ? "md:col-start-3" : "md:col-start-1 md:text-right"}`}>
                  <p className="eyebrow text-[0.68rem] text-gold-light">{e.time ?? <span className="tba normal-case tracking-normal text-sm">Time to follow</span>}</p>
                  <h3 className="mt-1 font-display text-[1.9rem] italic leading-tight text-ivory sm:text-[2.2rem]">{e.title}</h3>
                  {e.note && <p className="mt-1 text-base text-parchment/75">{e.note}</p>}
                </div>
                <div className="relative order-1 flex h-[76px] w-[76px] items-center justify-center rounded-full border border-gold-light/80 bg-olive-deep md:order-none md:col-start-2 md:row-start-1 md:h-24 md:w-24">
                  <span aria-hidden className="absolute inset-1.5 rounded-full border border-gold-light/30" />
                  <ProgramIcon icon={e.icon} className="h-12 w-12 text-parchment md:h-16 md:w-16" />
                </div>
              </Reveal>
            );
          })}
        </ol>

        <Reveal className="mt-14 flex justify-center gap-3" y={10}>
          <Blossom className="w-6" />
          <Blossom color="#eea1d7" center="#fbf6ec" className="w-6" />
          <Blossom className="w-6" />
        </Reveal>
      </div>
    </section>
  );
}
