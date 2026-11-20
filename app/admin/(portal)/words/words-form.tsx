"use client";

import { useActionState, useState } from "react";
import { defaultSettings, type SiteCopy, type TimelineIcon } from "@/lib/wedding.config";
import { COPY_GROUPS, ICONS } from "@/lib/admin/words-form";
import { saveWordsAction, type ActionState } from "../../actions";
import { Field, Flash } from "../../_components/ui";
import { SubmitButton } from "../../_components/submit-button";

interface Words {
  couple: { brideFirst: string; groomFirst: string; primary: string; formal: string; futureHouseName: string };
  letter: { salutation: string; body: string; closing: string };
  copy: SiteCopy;
  timeline: { title: string; time: string; note: string; icon: TimelineIcon }[];
  faqs: { key: string; question: string; answer: string }[];
}

const D = defaultSettings;
const defaultLetter = { salutation: D.letter[0], body: D.letter.slice(1, -1).join("\n\n"), closing: D.letter[D.letter.length - 1] };

function move<T>(list: T[], i: number, d: number): T[] {
  const j = i + d;
  if (j < 0 || j >= list.length) return list;
  const out = [...list];
  [out[i], out[j]] = [out[j], out[i]];
  return out;
}

function Restore({ show, onClick }: { show: boolean; onClick: () => void }) {
  if (!show) return null;
  return (
    <button type="button" onClick={onClick} className="adm-help self-start underline decoration-dotted underline-offset-4">
      Restore original
    </button>
  );
}

export function WordsForm({ initial }: { initial: Words }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveWordsAction, {});
  const [w, setW] = useState<Words>(initial);
  const fe = state.fieldErrors ?? {};

  const setCopy = (k: keyof SiteCopy, v: string) => setW((x) => ({ ...x, copy: { ...x.copy, [k]: v } }));
  const setCouple = (k: keyof Words["couple"], v: string) => setW((x) => ({ ...x, couple: { ...x.couple, [k]: v } }));
  const setLetter = (k: keyof Words["letter"], v: string) => setW((x) => ({ ...x, letter: { ...x.letter, [k]: v } }));
  const setEvent = (i: number, patch: Partial<Words["timeline"][number]>) => setW((x) => ({ ...x, timeline: x.timeline.map((e, j) => (j === i ? { ...e, ...patch } : e)) }));
  const setFaq = (i: number, patch: Partial<Words["faqs"][number]>) => setW((x) => ({ ...x, faqs: x.faqs.map((f, j) => (j === i ? { ...f, ...patch } : f)) }));

  const coupleFields: { key: keyof Words["couple"]; label: string; help?: string }[] = [
    { key: "brideFirst", label: "Bride’s first name", help: "Shown large on the invitation." },
    { key: "groomFirst", label: "Groom’s first name", help: "Shown large on the invitation." },
    { key: "primary", label: "Your names, short", help: "Used throughout — e.g. “Emily & Joe”." },
    { key: "formal", label: "Your names, formal", help: "e.g. “Emily Peter & Joe Perticone”." },
    { key: "futureHouseName", label: "Household name", help: "On the envelope, letterhead and footer." },
  ];

  return (
    <form action={action} className="flex flex-col gap-8">
      <input type="hidden" name="payload" value={JSON.stringify(w)} />

      {state.error && <Flash tone="error">{state.error}</Flash>}
      {state.ok && state.message && <Flash>{state.message}</Flash>}

      <section className="adm-panel flex flex-col gap-5">
        <h2>Your names</h2>
        <div className="grid gap-5 md:grid-cols-2">
          {coupleFields.map((f) => (
            <Field key={f.key} label={f.label} htmlFor={`couple.${f.key}`} help={f.help} error={fe[`couple.${f.key}`]}>
              <input id={`couple.${f.key}`} value={w.couple[f.key]} onChange={(e) => setCouple(f.key, e.target.value)} maxLength={120} className="adm-input" />
              <Restore show={w.couple[f.key] !== D.couple[f.key]} onClick={() => setCouple(f.key, D.couple[f.key])} />
            </Field>
          ))}
        </div>
        <p className="adm-help">The E &amp; J monogram and wax seal are drawn artwork and don’t change with these names.</p>
      </section>

      <section className="adm-panel flex flex-col gap-5">
        <h2>A letter to our guests</h2>
        <Field label="Greeting" htmlFor="letter.salutation" error={fe["letter.salutation"]}>
          <input id="letter.salutation" value={w.letter.salutation} onChange={(e) => setLetter("salutation", e.target.value)} maxLength={120} className="adm-input" />
        </Field>
        <Field label="The letter" htmlFor="letter.body" help="Leave a blank line between paragraphs." error={fe["letter.body"]}>
          <textarea id="letter.body" value={w.letter.body} onChange={(e) => setLetter("body", e.target.value)} rows={10} maxLength={4000} className="adm-textarea" />
        </Field>
        <Field label="Closing line" htmlFor="letter.closing" help="Your names are signed underneath." error={fe["letter.closing"]}>
          <input id="letter.closing" value={w.letter.closing} onChange={(e) => setLetter("closing", e.target.value)} maxLength={200} className="adm-input" />
        </Field>
        <Restore
          show={JSON.stringify(w.letter) !== JSON.stringify(defaultLetter)}
          onClick={() => setW((x) => ({ ...x, letter: defaultLetter }))}
        />
      </section>

      {COPY_GROUPS.map((g) => (
        <section key={g.title} className="adm-panel flex flex-col gap-5">
          <h2>{g.title}</h2>
          {g.note && <p className="adm-help -mt-3">{g.note}</p>}
          <div className="grid gap-5 md:grid-cols-2">
            {g.fields.map((f) => (
              <Field key={f.key} label={f.label} htmlFor={`copy.${f.key}`} help={f.help} error={fe[`copy.${f.key}`]} className={f.long ? "md:col-span-2" : ""}>
                {f.long ? (
                  <textarea id={`copy.${f.key}`} value={w.copy[f.key]} onChange={(e) => setCopy(f.key, e.target.value)} rows={3} maxLength={f.max ?? 160} className="adm-textarea" />
                ) : (
                  <input id={`copy.${f.key}`} value={w.copy[f.key]} onChange={(e) => setCopy(f.key, e.target.value)} maxLength={f.max ?? 160} className="adm-input" />
                )}
                <Restore show={w.copy[f.key] !== D.copy[f.key]} onClick={() => setCopy(f.key, D.copy[f.key])} />
              </Field>
            ))}
          </div>

          {g.title === "Order of the day" && (
            <div className="flex flex-col gap-4">
              <p className="adm-label">Events</p>
              <ol className="flex flex-col gap-4">
                {w.timeline.map((e, i) => (
                  <li key={i} className="grid gap-3 border-b border-[var(--hair)] pb-4 sm:grid-cols-2">
                    <Field label={`Event ${i + 1}`} htmlFor={`tl-${i}-title`} error={fe[`timeline.${i}.title`]}>
                      <input id={`tl-${i}-title`} value={e.title} onChange={(ev) => setEvent(i, { title: ev.target.value })} maxLength={60} className="adm-input" />
                    </Field>
                    <Field label="Time" htmlFor={`tl-${i}-time`} help="Leave empty for “time to follow”.">
                      <input id={`tl-${i}-time`} value={e.time} onChange={(ev) => setEvent(i, { time: ev.target.value })} maxLength={40} placeholder="4:00 pm" className="adm-input" />
                    </Field>
                    <Field label="Note (optional)" htmlFor={`tl-${i}-note`}>
                      <input id={`tl-${i}-note`} value={e.note} onChange={(ev) => setEvent(i, { note: ev.target.value })} maxLength={200} className="adm-input" />
                    </Field>
                    <Field label="Drawing" htmlFor={`tl-${i}-icon`}>
                      <select id={`tl-${i}-icon`} value={e.icon} onChange={(ev) => setEvent(i, { icon: ev.target.value as TimelineIcon })} className="adm-select">
                        {ICONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <div className="flex flex-wrap gap-2 sm:col-span-2">
                      <button type="button" className="btn btn-ghost" onClick={() => setW((x) => ({ ...x, timeline: move(x.timeline, i, -1) }))} disabled={i === 0} aria-label={`Move ${e.title} up`}>
                        ↑ Up
                      </button>
                      <button type="button" className="btn btn-ghost" onClick={() => setW((x) => ({ ...x, timeline: move(x.timeline, i, 1) }))} disabled={i === w.timeline.length - 1} aria-label={`Move ${e.title} down`}>
                        ↓ Down
                      </button>
                      <button type="button" className="btn btn-ghost" onClick={() => setW((x) => ({ ...x, timeline: x.timeline.filter((_, j) => j !== i) }))} disabled={w.timeline.length === 1}>
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
              <button type="button" className="btn btn-ghost self-start" onClick={() => setW((x) => ({ ...x, timeline: [...x.timeline, { title: "", time: "", note: "", icon: "champagne" }] }))} disabled={w.timeline.length >= 12}>
                + Add an event
              </button>
            </div>
          )}

          {g.title === "Questions & answers" && (
            <div className="flex flex-col gap-4">
              <p className="adm-label">Questions</p>
              <p className="adm-help -mt-3">Leave an answer empty and guests see “details to follow”.</p>
              <ol className="flex flex-col gap-4">
                {w.faqs.map((f, i) => (
                  <li key={f.key} className="flex flex-col gap-3 border-b border-[var(--hair)] pb-4">
                    <Field label={`Question ${i + 1}`} htmlFor={`faq-${f.key}-q`} error={fe[`faqs.${i}.question`]}>
                      <input id={`faq-${f.key}-q`} value={f.question} onChange={(e) => setFaq(i, { question: e.target.value })} maxLength={200} className="adm-input" />
                    </Field>
                    <Field label="Answer" htmlFor={`faq-${f.key}-a`}>
                      <textarea id={`faq-${f.key}-a`} value={f.answer} onChange={(e) => setFaq(i, { answer: e.target.value })} rows={3} maxLength={2000} className="adm-textarea" />
                    </Field>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="btn btn-ghost" onClick={() => setW((x) => ({ ...x, faqs: move(x.faqs, i, -1) }))} disabled={i === 0} aria-label={`Move question ${i + 1} up`}>
                        ↑ Up
                      </button>
                      <button type="button" className="btn btn-ghost" onClick={() => setW((x) => ({ ...x, faqs: move(x.faqs, i, 1) }))} disabled={i === w.faqs.length - 1} aria-label={`Move question ${i + 1} down`}>
                        ↓ Down
                      </button>
                      <button type="button" className="btn btn-ghost" onClick={() => setW((x) => ({ ...x, faqs: x.faqs.filter((_, j) => j !== i) }))}>
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
              <button
                type="button"
                className="btn btn-ghost self-start"
                onClick={() => setW((x) => ({ ...x, faqs: [...x.faqs, { key: `q-${Date.now().toString(36)}`, question: "", answer: "" }] }))}
                disabled={w.faqs.length >= 20}
              >
                + Add a question
              </button>
            </div>
          )}
        </section>
      ))}

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-[var(--rule)] bg-ivory/95 px-4 py-3 md:mx-0 md:px-0">
        <SubmitButton busy={pending}>Save words</SubmitButton>
        {state.ok && <span className="adm-muted">Saved.</span>}
        {state.error && <span className="adm-error">{state.error}</span>}
      </div>
    </form>
  );
}
