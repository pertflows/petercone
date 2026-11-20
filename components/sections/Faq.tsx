import type { WeddingSettings } from "@/lib/wedding.config";
import { formatDeadline } from "@/lib/format";
import { Fleuron, Tba } from "@/components/ornaments/Stationery";
import { Butterfly, OliveSprig } from "@/components/ornaments/Botanicals";
import { Reveal } from "@/components/motion";

const ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii"];

export function Faq({ s }: { s: WeddingSettings }) {
  const deadline = formatDeadline(s.rsvp.deadline);
  // Derived answers so the couple only maintains each fact once.
  const items = s.faqs.map((f) => {
    if (f.key === "rsvp" && !f.answer && deadline) return { ...f, answer: `Kindly reply by ${deadline}. You can update your reply on this site until then.` };
    if (f.key === "dress" && !f.answer && s.dressCode) return { ...f, answer: `${s.dressCode}.${s.dressCodeNote ? ` ${s.dressCodeNote}` : ""}` };
    return f;
  });

  return (
    <section id="faq" aria-labelledby="faq-title" className="paper-parchment relative overflow-hidden px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto max-w-5xl">
        <Reveal className="grid items-end gap-6 md:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="eyebrow text-bistre">Good to know</p>
            <h2 id="faq-title" className="display mt-3 text-[clamp(2.8rem,11vw,5.6rem)] uppercase text-olive">
              Questions
              <span className="mt-1 block text-[0.5em] normal-case italic text-roses">&amp; answers</span>
            </h2>
          </div>
          <div className="relative hidden md:block">
            <OliveSprig className="ml-auto w-72 -rotate-6" />
            <Butterfly className="absolute -top-8 right-56 w-12 rotate-12" />
          </div>
        </Reveal>
        <Fleuron className="mt-6 w-full max-w-md text-gold" />

        <dl className="mt-12 columns-1 gap-14 md:columns-2">
          {items.map((f, i) => (
            <Reveal key={f.key} delay={(i % 2) * 0.08} className="mb-10 break-inside-avoid">
              <dt className="flex items-baseline gap-4">
                <span className="font-display text-sm italic text-gold-deep">{ROMAN[i]}.</span>
                <span className="font-display text-[1.55rem] italic leading-snug text-espresso">{f.question}</span>
              </dt>
              <dd className="mt-2 border-l border-gold/50 pl-5 text-[1.12rem] leading-relaxed text-espresso-soft sm:ml-7">
                {f.answer ?? <Tba>Details to follow.</Tba>}
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
