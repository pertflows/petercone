"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState, useTransition } from "react";
import { lookupInvitation, submitRsvp } from "@/app/actions";
import { joinNames, type PublicInvitation } from "@/lib/invitation";
import { Monogram } from "@/components/ornaments/Monogram";
import { WaxSeal } from "@/components/ornaments/WaxSeal";
import { Lace, Fleuron } from "@/components/ornaments/Stationery";
import { Blossom, LilyOfTheValley, Tulip } from "@/components/ornaments/Botanicals";
import { Reveal } from "@/components/motion";

interface Props {
  initial: PublicInvitation | null;
  meals: string[];
  askSongs: boolean;
  allowNameLookup: boolean;
  deadlineLabel: string | null;
  open: boolean;
  /** false until guest storage (Supabase) is connected. */
  enabled: boolean;
  houseName: string;
  couple: string;
  copy: RsvpCopy;
}

export interface RsvpCopy {
  eyebrow: string;
  title: string;
  thanksTitle: string;
  thanksBody: string;
  declineTitle: string;
  declineBody: string;
  signoff: string;
}

type GuestState = { id: string; attending: boolean | null; meal: string | null; dietary: string };
type Stage = "find" | "card" | "sent";

const EASE = [0.22, 0.61, 0.36, 1] as const;

function fromInv(i: PublicInvitation | null): GuestState[] {
  return (i?.guests ?? []).map((g) => ({ id: g.id, attending: g.attending, meal: g.meal, dietary: g.dietary ?? "" }));
}

function lineInput(extra = "") {
  return `w-full border-0 border-b border-espresso/35 bg-transparent px-0.5 py-2 text-[1.15rem] text-espresso placeholder:italic placeholder:text-espresso/40 focus:border-roses focus:outline-none focus:ring-0 ${extra}`;
}

function Choice({ checked, onSelect, label, name, value }: { checked: boolean; onSelect: () => void; label: string; name: string; value: string }) {
  return (
    <label className={`flex min-h-12 cursor-pointer items-center gap-3 border px-3 py-2 transition-colors duration-300 ${checked ? "border-olive bg-olive text-parchment" : "border-espresso/25 text-espresso hover:border-olive"}`}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onSelect} className="sr-only" />
      <span aria-hidden className={`relative flex h-5 w-5 shrink-0 items-center justify-center border ${checked ? "border-parchment" : "border-espresso/50"}`}>
        {checked && (
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M4 10.5l4 4L16.5 5" />
          </svg>
        )}
      </span>
      <span className="font-display text-[1.05rem] italic leading-tight">{label}</span>
    </label>
  );
}

export function Rsvp({ initial, meals, askSongs, allowNameLookup, deadlineLabel, open, enabled, houseName, couple, copy }: Props) {
  const reduce = useReducedMotion();
  const uid = useId();
  const [stage, setStage] = useState<Stage>(initial ? (initial.reply ? "sent" : "card") : "find");
  const [inv, setInv] = useState<PublicInvitation | null>(initial);
  const [mode, setMode] = useState<"name" | "code">(allowNameLookup ? "name" : "code");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const [guests, setGuests] = useState<GuestState[]>(() => fromInv(initial));
  const [bringGuest, setBringGuest] = useState(Boolean(initial?.plusOne));
  const [plus, setPlus] = useState({ firstName: initial?.plusOne?.firstName ?? "", lastName: initial?.plusOne?.lastName ?? "", meal: initial?.plusOne?.meal ?? null, dietary: initial?.plusOne?.dietary ?? "" });
  const [song, setSong] = useState(initial?.reply?.songRequest ?? "");
  const [message, setMessage] = useState(initial?.reply?.message ?? "");

  function load(i: PublicInvitation) {
    setInv(i);
    setGuests(fromInv(i));
    setBringGuest(Boolean(i.plusOne));
    setPlus({ firstName: i.plusOne?.firstName ?? "", lastName: i.plusOne?.lastName ?? "", meal: i.plusOne?.meal ?? null, dietary: i.plusOne?.dietary ?? "" });
    setSong(i.reply?.songRequest ?? "");
    setMessage(i.reply?.message ?? "");
  }

  function updateGuest(i: number, patch: Partial<GuestState>) {
    setError(null);
    setGuests((s) => s.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  }

  const anyAttending = guests.some((g) => g.attending);
  const allAnswered = guests.every((g) => g.attending !== null);

  function find(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const r = await lookupInvitation(mode === "code" ? { mode, code } : { mode, firstName: first, lastName: last });
      if (!r.ok) {
        setError(r.error);
        if (r.needsCode) setMode("code");
        return;
      }
      load(r.invitation);
      setStage("card");
    });
  }

  function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!inv) return;
    setError(null);
    if (!allAnswered) return setError("Please let us know for each guest — accepts or declines.");
    const website = (new FormData(e.currentTarget).get("website") as string) ?? "";
    start(async () => {
      const r = await submitRsvp({
        token: inv.token,
        guests: guests.map((g) => ({ id: g.id, attending: Boolean(g.attending), meal: g.attending ? g.meal : null, dietary: g.attending ? g.dietary : null })),
        plusOne: inv.plusOneAllowed && bringGuest && anyAttending && plus.firstName.trim() ? plus : null,
        songRequest: song,
        message,
        website,
      });
      if (!r.ok) return setError(r.error);
      load(r.invitation);
      setStage("sent");
      requestAnimationFrame(() => document.getElementById("rsvp")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }));
    });
  }

  const attendingNames = inv
    ? [...inv.guests.filter((g) => g.attending).map((g) => g.firstName), ...(inv.plusOne ? [inv.plusOne.firstName] : [])]
    : [];
  const everyoneNames = inv ? inv.guests.map((g) => g.firstName) : [];
  const declinedAll = inv?.reply?.status === "declined";

  const cardMotion = {
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 80, rotate: -1.5 },
    animate: { opacity: 1, y: 0, rotate: 0 },
    exit: reduce ? { opacity: 0 } : { opacity: 0, y: 140, scale: 0.92, transition: { duration: 0.6, ease: EASE } },
    transition: { duration: 0.9, ease: EASE },
  };

  return (
    <section id="rsvp" aria-labelledby="rsvp-title" className="relative overflow-hidden px-3 pb-24 pt-20 sm:px-8 md:pb-32 md:pt-28" style={{ background: "repeating-linear-gradient(90deg, #4b1026 0px, #6e1a3a 34px, #5a1430 58px, #3b0a1d 92px, #561330 118px, #4b1026 140px)" }}>
      {/* velvet drape: grain + falloff */}
      <div aria-hidden className="grain pointer-events-none absolute inset-0 opacity-70 mix-blend-soft-light" />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(120% 70% at 50% 40%, transparent 30%, rgb(25 4 12 / 0.65))" }} />

      <Reveal className="relative mx-auto max-w-xl text-center text-parchment">
        <p className="eyebrow text-violet/90">{copy.eyebrow}</p>
        <h2 id="rsvp-title" className="script mt-3 text-[clamp(3.4rem,14vw,6rem)] leading-none text-ivory">
          {copy.title}
        </h2>
        <p className="mt-4 text-lg italic text-parchment/80">
          {deadlineLabel ? <>The favour of your reply is requested by {deadlineLabel}.</> : <>The favour of your reply is requested at your earliest convenience.</>}
        </p>
      </Reveal>

      {/* the open envelope */}
      <div className="relative mx-auto mt-[calc(min(30vw,170px)+2.5rem)] max-w-2xl sm:mt-36">
        <Tulip tone="blush" lean={0.5} open={0.8} className="pointer-events-none absolute -left-10 -top-16 z-20 hidden h-80 rotate-[-18deg] sm:block" />
        <Tulip tone="ivory" lean={-0.3} open={0.5} className="pointer-events-none absolute -right-8 top-24 z-20 hidden h-72 rotate-[14deg] sm:block" />

        {/* envelope back + raised flap */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 top-16 sm:top-24">
          <div className="paper-blush absolute inset-x-0 -top-[min(30vw,170px)] mx-auto h-[min(30vw,170px)] w-full origin-bottom" style={{ clipPath: "polygon(0 100%, 50% 0, 100% 100%)", filter: "brightness(0.93)" }} />
          <div className="paper-blush absolute inset-0 shadow-[0_40px_80px_-30px_rgb(10_0_5/0.8)]" style={{ backgroundImage: "url(/textures/paper-grain.svg), repeating-linear-gradient(90deg, rgb(74 82 38 / 0.85) 0 6px, rgb(244 234 214 / 0.85) 6px 12px)", backgroundSize: "320px 320px, auto" }} />
        </div>

        <div className="relative z-10 mx-auto w-[calc(100%-12px)] pb-[18%] sm:w-[88%] sm:pb-[14%]">
          <AnimatePresence mode="wait">
            {stage !== "sent" ? (
              <motion.div key={stage === "find" ? "find" : `card-${inv?.token}`} {...cardMotion}>
                <Lace width={22} className="paper relative shadow-[0_30px_60px_-20px_rgb(20_0_8/0.7)]">
                  <div className="px-5 py-10 sm:px-12 sm:py-12">
                    <div className="flex flex-col items-center text-center">
                      <Monogram className="h-16 w-16 text-olive" ampColor="#bb2968" />
                      <Fleuron className="mt-2 w-36 text-gold" />
                    </div>

                    {!open && stage === "card" && (
                      <p className="mt-6 border border-raspberry/40 bg-blush/50 p-3 text-center text-base italic text-raspberry" role="status">
                        Replies are now closed{deadlineLabel ? ` (they were due ${deadlineLabel})` : ""}. Please reach out to {couple} directly with any changes.
                      </p>
                    )}

                    {stage === "find" && !enabled && (
                      <div className="mt-6 text-center" role="status">
                        <h3 className="font-display text-[1.7rem] italic text-espresso">Replies open soon</h3>
                        <p className="mx-auto mt-3 max-w-sm text-lg leading-relaxed text-espresso-soft">
                          Your personal reply card will arrive with your invitation. Until then, save the date — we can’t wait to celebrate with you.
                        </p>
                        <a href="/calendar.ics" className="mt-8 inline-flex min-h-12 items-center bg-olive px-8 font-display text-lg italic text-parchment transition-colors hover:bg-olive-deep">
                          Add to calendar
                        </a>
                      </div>
                    )}

                    {stage === "find" && enabled && (
                      <form onSubmit={find} className="mt-6" noValidate>
                        <h3 className="text-center font-display text-[1.7rem] italic text-espresso">Find your invitation</h3>
                        <p className="mx-auto mt-2 max-w-sm text-center text-base text-espresso-soft">
                          {mode === "name" ? "Enter the name of anyone on your invitation." : "Enter the code printed on your invitation card."}
                        </p>
                        <div className="mt-6 space-y-5">
                          {mode === "name" ? (
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                              <label className="block">
                                <span className="eyebrow text-[0.62rem] text-bistre">First name</span>
                                <input value={first} onChange={(e) => setFirst(e.target.value)} autoComplete="given-name" required className={lineInput()} />
                              </label>
                              <label className="block">
                                <span className="eyebrow text-[0.62rem] text-bistre">Last name</span>
                                <input value={last} onChange={(e) => setLast(e.target.value)} autoComplete="family-name" required className={lineInput()} />
                              </label>
                            </div>
                          ) : (
                            <label className="block">
                              <span className="eyebrow text-[0.62rem] text-bistre">Invitation code</span>
                              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} autoCapitalize="characters" autoComplete="off" spellCheck={false} placeholder="e.g. TULIP-1234" required className={lineInput("font-display tracking-[0.12em]")} />
                            </label>
                          )}
                        </div>
                        {error && (
                          <p role="alert" className="mt-5 text-center text-base italic text-raspberry">
                            {error}
                          </p>
                        )}
                        <div className="mt-8 flex flex-col items-center gap-4">
                          <button type="submit" disabled={pending} className="inline-flex min-h-12 items-center justify-center gap-3 bg-olive px-8 font-display text-lg italic text-parchment transition-colors hover:bg-olive-deep disabled:opacity-60">
                            {pending ? "Searching…" : "Find my invitation"}
                          </button>
                          {allowNameLookup && (
                            <button type="button" onClick={() => { setMode(mode === "name" ? "code" : "name"); setError(null); }} className="min-h-11 text-base italic text-bistre underline decoration-gold/60 underline-offset-4">
                              {mode === "name" ? "I have an invitation code" : "Search by name instead"}
                            </button>
                          )}
                        </div>
                      </form>
                    )}

                    {stage === "card" && inv && (
                      <form onSubmit={send} className="mt-6" noValidate>
                        <p className="eyebrow text-center text-[0.62rem] text-bistre">This card is reserved for</p>
                        <h3 className="mt-2 text-center font-display text-[clamp(1.7rem,6vw,2.2rem)] italic leading-tight text-espresso">{inv.name}</h3>
                        {inv.reply && <p className="mt-2 text-center text-sm italic text-espresso-soft">You’ve already replied — feel free to make changes below.</p>}

                        <fieldset disabled={!open} className="mt-8 space-y-8">
                          {guests.map((g, i) => {
                            const meta = inv.guests[i];
                            const nm = `${uid}-g${i}`;
                            return (
                              <div key={g.id} className="border-t border-gold/40 pt-6">
                                <p className="font-display text-[1.45rem] leading-tight text-olive">
                                  {meta.firstName} {meta.lastName}
                                </p>
                                <div role="radiogroup" aria-label={`Reply for ${meta.firstName}`} className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                  <Choice name={nm} value="yes" checked={g.attending === true} onSelect={() => updateGuest(i, { attending: true })} label="Accepts with pleasure" />
                                  <Choice name={nm} value="no" checked={g.attending === false} onSelect={() => updateGuest(i, { attending: false })} label="Declines with regret" />
                                </div>
                                <AnimatePresence initial={false}>
                                  {g.attending && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} className="overflow-hidden">
                                      <div className="space-y-4 pt-4">
                                        {meals.length > 0 && (
                                          <div>
                                            <span className="eyebrow text-[0.62rem] text-bistre">Dinner</span>
                                            <div role="radiogroup" aria-label={`Dinner for ${meta.firstName}`} className="mt-2 flex flex-wrap gap-2">
                                              {meals.map((m) => (
                                                <label key={m} className={`flex min-h-11 cursor-pointer items-center border px-3 font-display text-base italic transition-colors ${g.meal === m ? "border-roses bg-roses text-ivory" : "border-espresso/25 text-espresso hover:border-roses"}`}>
                                                  <input type="radio" className="sr-only" name={`${nm}-meal`} checked={g.meal === m} onChange={() => updateGuest(i, { meal: m })} />
                                                  {m}
                                                </label>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        <label className="block">
                                          <span className="eyebrow text-[0.62rem] text-bistre">Dietary needs or allergies</span>
                                          <input value={g.dietary} maxLength={500} onChange={(e) => updateGuest(i, { dietary: e.target.value })} placeholder="None" className={lineInput()} />
                                        </label>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}

                          {inv.plusOneAllowed && anyAttending && (
                            <div className="border-t border-gold/40 pt-6">
                              <label className="flex min-h-11 cursor-pointer items-center gap-3">
                                <input type="checkbox" checked={bringGuest} onChange={(e) => setBringGuest(e.target.checked)} className="h-5 w-5 accent-olive" />
                                <span className="font-display text-[1.25rem] italic text-olive">I’ll be bringing a guest</span>
                              </label>
                              <AnimatePresence initial={false}>
                                {bringGuest && (
                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} className="overflow-hidden">
                                    <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
                                      <label className="block">
                                        <span className="eyebrow text-[0.62rem] text-bistre">Guest’s first name</span>
                                        <input value={plus.firstName} maxLength={100} onChange={(e) => setPlus({ ...plus, firstName: e.target.value })} className={lineInput()} />
                                      </label>
                                      <label className="block">
                                        <span className="eyebrow text-[0.62rem] text-bistre">Last name</span>
                                        <input value={plus.lastName} maxLength={100} onChange={(e) => setPlus({ ...plus, lastName: e.target.value })} className={lineInput()} />
                                      </label>
                                      {meals.length > 0 && (
                                        <div className="sm:col-span-2">
                                          <span className="eyebrow text-[0.62rem] text-bistre">Their dinner</span>
                                          <div className="mt-2 flex flex-wrap gap-2">
                                            {meals.map((m) => (
                                              <label key={m} className={`flex min-h-11 cursor-pointer items-center border px-3 font-display text-base italic transition-colors ${plus.meal === m ? "border-roses bg-roses text-ivory" : "border-espresso/25 text-espresso hover:border-roses"}`}>
                                                <input type="radio" className="sr-only" name={`${uid}-plus-meal`} checked={plus.meal === m} onChange={() => setPlus({ ...plus, meal: m })} />
                                                {m}
                                              </label>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      <label className="block sm:col-span-2">
                                        <span className="eyebrow text-[0.62rem] text-bistre">Their dietary needs</span>
                                        <input value={plus.dietary} maxLength={500} onChange={(e) => setPlus({ ...plus, dietary: e.target.value })} placeholder="None" className={lineInput()} />
                                      </label>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}

                          <div className="space-y-6 border-t border-gold/40 pt-6">
                            {askSongs && anyAttending && (
                              <label className="block">
                                <span className="eyebrow text-[0.62rem] text-bistre">A song that will get you dancing</span>
                                <input value={song} maxLength={300} onChange={(e) => setSong(e.target.value)} placeholder="Optional" className={lineInput()} />
                              </label>
                            )}
                            <label className="block">
                              <span className="eyebrow text-[0.62rem] text-bistre">A note for {couple}</span>
                              <textarea
                                value={message}
                                maxLength={2000}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={4}
                                placeholder="Optional"
                                className="mt-1 w-full resize-y border-0 bg-transparent px-0.5 text-[1.15rem] leading-[2.2rem] text-espresso placeholder:italic placeholder:text-espresso/40 focus:outline-none focus:ring-0"
                                style={{ backgroundImage: "linear-gradient(transparent calc(2.2rem - 1px), rgb(43 29 21 / 0.3) calc(2.2rem - 1px), rgb(43 29 21 / 0.3) 2.2rem)", backgroundSize: "100% 2.2rem", backgroundAttachment: "local" }}
                              />
                            </label>
                            {/* honeypot — hidden from people, irresistible to bots */}
                            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />
                          </div>
                        </fieldset>

                        {error && (
                          <p role="alert" className="mt-6 text-center text-base italic text-raspberry">
                            {error}
                          </p>
                        )}

                        {open && (
                          <div className="mt-10 flex flex-col items-center gap-3">
                            <button type="submit" disabled={pending} className="group inline-flex min-h-14 items-center gap-3 bg-olive py-2 pl-2 pr-7 text-parchment transition-colors hover:bg-olive-deep disabled:opacity-60">
                              <WaxSeal className={`h-11 w-11 transition-transform duration-700 ${pending ? "animate-spin" : "group-hover:rotate-12"}`} />
                              <span className="font-display text-lg italic">{pending ? "Sealing your reply…" : inv.reply ? "Update our reply" : "Seal & send our reply"}</span>
                            </button>
                            {!initial && (
                              <button type="button" onClick={() => { setStage("find"); setError(null); }} className="min-h-11 text-sm italic text-bistre underline decoration-gold/60 underline-offset-4">
                                Not your invitation?
                              </button>
                            )}
                          </div>
                        )}
                      </form>
                    )}
                  </div>
                </Lace>
              </motion.div>
            ) : (
              inv && (
                <motion.div key="sent" initial={reduce ? { opacity: 0 } : { opacity: 0, y: -60, rotateX: 40 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 1.1, ease: EASE, delay: reduce ? 0 : 0.2 }} style={{ transformPerspective: 1200 }} role="status" aria-live="polite">
                  <div className="paper-parchment relative px-6 pb-14 pt-16 text-center shadow-[0_30px_60px_-20px_rgb(20_0_8/0.7)] outline outline-1 outline-offset-[-10px] outline-gold/70 sm:px-14">
                    <motion.div className="absolute -top-9 left-1/2 -translate-x-1/2" initial={reduce ? false : { scale: 1.8, opacity: 0, rotate: -30 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 180, damping: 14, delay: reduce ? 0 : 0.9 }}>
                      <WaxSeal className="h-20 w-20" />
                    </motion.div>
                    <p className="eyebrow text-[0.62rem] text-bistre">{houseName}</p>
                    <h3 className="script mt-4 text-[clamp(2.8rem,11vw,4.2rem)] leading-none text-raspberry">{declinedAll ? copy.declineTitle : copy.thanksTitle}</h3>
                    <p className="mt-4 font-display text-[1.5rem] italic text-olive">{joinNames(declinedAll ? everyoneNames : attendingNames)}</p>
                    <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-espresso-soft">
                      {declinedAll ? copy.declineBody : copy.thanksBody}
                    </p>
                    <Fleuron className="mx-auto mt-8 w-40 text-gold" />
                    <p className="script mt-4 text-4xl text-espresso-soft">{copy.signoff} {couple}</p>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                      {!declinedAll && (
                        <a href="/calendar.ics" className="inline-flex min-h-11 items-center border border-olive px-4 font-display text-base italic text-olive hover:bg-olive hover:text-parchment">
                          Add to calendar
                        </a>
                      )}
                      {open && (
                        <button type="button" onClick={() => setStage("card")} className="inline-flex min-h-11 items-center px-4 text-base italic text-bistre underline decoration-gold/60 underline-offset-4">
                          Change our reply
                        </button>
                      )}
                    </div>
                    <LilyOfTheValley className="pointer-events-none absolute -left-4 bottom-4 h-28 -rotate-12" />
                    <Blossom className="pointer-events-none absolute right-6 top-6 w-8" />
                  </div>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
