import type { WeddingSettings } from "@/lib/wedding.config";
import { photos } from "@/lib/wedding.config";
import { GoldFrame } from "@/components/ornaments/GoldFrame";
import { Blossom, LilyOfTheValley, Tulip } from "@/components/ornaments/Botanicals";
import { StripeBand } from "@/components/ornaments/Stationery";
import { Handwritten, Parallax, Reveal } from "@/components/motion";

export function Letter({ s }: { s: WeddingSettings }) {
  const [salutation, ...rest] = s.letter;
  const closing = rest.pop();
  return (
    <section id="letter" aria-labelledby="letter-title" className="paper-blush relative overflow-hidden">
      <StripeBand />
      <div className="relative mx-auto grid max-w-6xl items-center gap-0 px-5 pb-24 pt-16 sm:px-8 md:grid-cols-[0.9fr_1.1fr] md:gap-4 md:pb-32 md:pt-24">
        <h2 id="letter-title" className="sr-only">
          A letter to our guests
        </h2>

        {/* portrait in its gilt frame */}
        <Parallax speed={0.06} rotate={1.5} className="relative z-10 mx-auto w-[min(72vw,360px)] md:mr-[-60px] md:w-[min(34vw,420px)]">
          <Reveal y={50}>
            <GoldFrame src={photos.letter.src} alt={photos.letter.alt} focus={photos.letter.focus} className="w-full rotate-[-3deg]" />
          </Reveal>
          <Tulip tone="ivory" lean={-0.4} open={0.8} className="pointer-events-none absolute -bottom-10 -left-14 h-56 rotate-[-12deg] sm:-left-20 sm:h-72" />
        </Parallax>

        {/* the letter itself */}
        <Reveal delay={0.1} className="relative -mt-10 md:mt-0">
          <article className="paper deckle relative rotate-[1deg] px-7 pb-12 pt-14 shadow-[0_24px_50px_-24px_rgb(90_40_30/0.55)] sm:px-14 sm:pb-16 sm:pt-16">
            {/* letterhead */}
            <div className="mb-8 flex items-baseline justify-between gap-4 border-b border-gold/40 pb-4">
              <span className="eyebrow text-[0.62rem] text-bistre">{s.couple.futureHouseName}</span>
              <span className="font-display text-sm italic text-bistre">{s.dateNumeric}</span>
            </div>
            <p className="script mb-5 text-[2.1rem] leading-none text-raspberry sm:text-[2.5rem]">{salutation}</p>
            <div className="space-y-4 text-[1.18rem] italic leading-[1.7] text-espresso-soft sm:text-[1.28rem]">
              {rest.map((p, i) => (
                <p key={i} className={i === 0 ? "first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:font-display first-letter:text-[3.6rem] first-letter:not-italic first-letter:leading-[0.8] first-letter:text-olive" : ""}>
                  {p}
                </p>
              ))}
            </div>
            {closing && <p className="mt-8 text-lg italic text-espresso-soft">{closing}</p>}
            <p className="mt-1 text-[clamp(3rem,12vw,4.4rem)] leading-none text-raspberry">
              <Handwritten className="script" duration={2.6} delay={0.2}>
                {s.couple.primary}
              </Handwritten>
            </p>
            <LilyOfTheValley className="pointer-events-none absolute -right-3 bottom-6 h-32 rotate-[10deg] opacity-90 sm:h-40" />
            <Blossom className="pointer-events-none absolute right-16 top-[-14px] w-9" />
          </article>
        </Reveal>
      </div>
    </section>
  );
}
