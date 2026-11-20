import type { WeddingSettings } from "@/lib/wedding.config";
import { mapsLink, zonedToUtc } from "@/lib/format";
import { googleCalendarUrl } from "@/lib/calendar";
import { ProgramIcon } from "@/components/ornaments/ProgramIcons";
import { Fleuron, Tba } from "@/components/ornaments/Stationery";
import { OliveSprig, Tulip } from "@/components/ornaments/Botanicals";
import { Countdown } from "@/components/Countdown";
import { Parallax, Reveal } from "@/components/motion";

function Venue({ label, icon, venue, address, time }: { label: string; icon: "rings" | "champagne"; venue: string | null; address: string | null; time: string | null }) {
  return (
    <div className="flex flex-col items-center px-2 text-center">
      <ProgramIcon icon={icon} className="h-16 w-16 text-bistre" />
      <h3 className="eyebrow mt-3 text-olive">{label}</h3>
      <p className="mt-3 font-display text-2xl leading-tight text-espresso">{venue ?? <Tba>Venue to be announced</Tba>}</p>
      <p className="mt-2 text-lg italic text-espresso-soft">{time ?? <Tba>Time to follow</Tba>}</p>
      <p className="mt-2 max-w-[18rem] text-base leading-snug text-espresso-soft">
        {address ? (
          <a href={mapsLink(address)} target="_blank" rel="noreferrer" className="underline decoration-gold/60 underline-offset-4 hover:decoration-roses">
            {address}
          </a>
        ) : (
          <Tba>Address to follow</Tba>
        )}
      </p>
    </div>
  );
}

export function Details({ s, siteUrl }: { s: WeddingSettings; siteUrl: string }) {
  const startT = s.ceremony.startTime24 ?? s.reception.startTime24 ?? "00:00";
  const target = zonedToUtc(s.date, startT, s.timezone).toISOString();
  return (
    <section id="details" aria-labelledby="details-title" className="paper-parchment relative overflow-hidden px-4 py-20 sm:px-8 md:py-28">
      <Parallax speed={0.18} className="pointer-events-none absolute -right-16 top-10 hidden h-[420px] w-[180px] md:block">
        <Tulip tone="rose" lean={-0.6} open={0.6} className="h-full rotate-[8deg]" />
      </Parallax>
      <Parallax speed={0.1} className="pointer-events-none absolute -left-10 bottom-16 hidden w-64 md:block">
        <OliveSprig className="w-full rotate-[-20deg]" />
      </Parallax>

      <Reveal className="relative mx-auto max-w-4xl">
        {/* striped printed insert */}
        <div className="stripes-olive p-3 shadow-[0_30px_60px_-30px_rgb(60_50_20/0.6)] sm:p-5">
          <div className="paper border border-olive/40 px-5 py-12 outline outline-1 outline-offset-[-8px] outline-gold/50 sm:px-12 sm:py-16">
            <div className="text-center">
              <p className="eyebrow text-bistre">You are invited</p>
              <h2 id="details-title" className="display mt-4 text-[clamp(2.8rem,11vw,5.4rem)] uppercase tracking-[0.02em] text-olive">
                The Details
              </h2>
              <Fleuron className="mx-auto mt-5 w-48 text-gold" />
            </div>

            {/* printed date block */}
            <div className="mx-auto mt-10 grid max-w-xl grid-cols-[1fr_auto_1fr] items-center text-center text-olive">
              <span className="smallcaps border-y border-gold/60 py-2 text-base sm:text-lg">Friday</span>
              <span className="px-5 font-display text-[4.5rem] leading-none sm:text-[6rem]">27</span>
              <span className="smallcaps border-y border-gold/60 py-2 text-base sm:text-lg">August 2027</span>
            </div>
            <p className="mt-4 text-center text-lg italic text-espresso-soft">{s.dateLong}</p>

            <div className="mt-14 grid gap-12 sm:grid-cols-2 sm:gap-6">
              <Venue label="The Ceremony" icon="rings" venue={s.ceremony.venueName} address={s.ceremony.address} time={s.ceremony.timeLabel} />
              <Venue label="The Reception" icon="champagne" venue={s.reception.venueName} address={s.reception.address} time={s.reception.timeLabel} />
            </div>

            <div className="mx-auto mt-14 grid max-w-2xl gap-10 border-t border-gold/40 pt-10 text-center sm:grid-cols-2">
              <div>
                <h3 className="eyebrow text-olive">Attire</h3>
                <p className="mt-3 font-display text-xl italic text-espresso">{s.dressCode ?? <Tba>Dress code to follow</Tba>}</p>
                {s.dressCodeNote && <p className="mt-2 text-base text-espresso-soft">{s.dressCodeNote}</p>}
              </div>
              <div>
                <h3 className="eyebrow text-olive">Getting there</h3>
                <p className="mt-3 text-lg leading-snug text-espresso-soft">{s.directions ?? <Tba>Directions will be shared closer to the day</Tba>}</p>
              </div>
            </div>

            <div className="mt-14 flex flex-col items-center gap-8 border-t border-gold/40 pt-12">
              <Countdown target={target} />
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className="eyebrow w-full text-center text-[0.62rem] text-bistre sm:w-auto">Save the date</span>
                <a href="/calendar.ics" className="inline-flex min-h-11 items-center border border-olive px-4 font-display text-base italic text-olive transition-colors hover:bg-olive hover:text-parchment">
                  Apple &amp; Outlook
                </a>
                <a href={googleCalendarUrl(s, siteUrl)} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center border border-olive px-4 font-display text-base italic text-olive transition-colors hover:bg-olive hover:text-parchment">
                  Google Calendar
                </a>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
