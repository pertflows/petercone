"use client";

import { useActionState } from "react";
import type { WeddingSettings } from "@/lib/wedding.config";
import { saveSettingsAction, type SettingsState } from "../../actions";
import { Field, Flash } from "../../_components/ui";
import { SubmitButton, submitWithoutReset } from "../../_components/submit-button";

function Tba({ show }: { show: boolean }) {
  return show ? <span className="adm-tag ml-2 align-middle">Placeholder</span> : null;
}

export function SettingsForm({ settings: s, placeholders, zones }: { settings: WeddingSettings; placeholders: string[]; zones: string[] }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(saveSettingsAction, {});
  const fe = state.fieldErrors ?? {};
  const list = state.placeholders ?? placeholders;
  const inv = (k: string) => (fe[k] ? true : undefined);

  const text = (name: string, label: string, value: string | null, opts: { help?: string; placeholder?: string; max?: number; type?: string } = {}) => (
    <Field label={label} htmlFor={name} help={opts.help} error={fe[name]}>
      <input
        id={name}
        name={name}
        type={opts.type ?? "text"}
        defaultValue={value ?? ""}
        placeholder={opts.placeholder}
        maxLength={opts.max ?? 160}
        className="adm-input"
        aria-invalid={inv(name)}
      />
    </Field>
  );

  return (
    <form action={action} onSubmit={submitWithoutReset(action)} className="flex flex-col gap-8">
      <section aria-label="Still to confirm" className="adm-panel adm-panel-parchment flex flex-col gap-2">
        <p className="adm-label">Still to confirm</p>
        {list.length === 0 ? (
          <p>Every detail is filled in. Beautiful.</p>
        ) : (
          <>
            <p className="adm-muted">These show as “details to follow” on the website:</p>
            <ul className="flex flex-wrap gap-2">
              {list.map((p) => (
                <li key={p} className="adm-tag">
                  {p}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {state.error && <Flash tone="error">{state.error}</Flash>}
      {state.ok && state.message && <Flash>{state.message}</Flash>}

      <section className="adm-panel flex flex-col gap-5">
        <h2>Replies</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="RSVP deadline" htmlFor="deadline" help="Guests can reply or change their answer through the end of this day." error={fe.deadline}>
            <input id="deadline" name="deadline" type="date" defaultValue={s.rsvp.deadline ?? ""} className="adm-input" aria-invalid={inv("deadline")} />
          </Field>
          <Field label="Timezone" htmlFor="timezone" help="The venue’s timezone — used for the deadline, countdown and calendar." error={fe.timezone}>
            <select id="timezone" name="timezone" defaultValue={s.timezone} className="adm-select">
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field
          label="Meal choices"
          htmlFor="meals"
          help="One per line. Leave empty to skip meal selection on the reply card."
          error={fe.meals ?? Object.entries(fe).find(([k]) => k.startsWith("meals."))?.[1]}
        >
          <textarea id="meals" name="meals" defaultValue={s.rsvp.meals.join("\n")} rows={4} className="adm-textarea" placeholder={"Filet\nBranzino\nGarden risotto"} />
        </Field>
        <div className="flex flex-col">
          <label className="adm-check">
            <input type="checkbox" name="allowNameLookup" defaultChecked={s.rsvp.allowNameLookup} />
            <span>Guests can find their invitation by name</span>
          </label>
          <label className="adm-check">
            <input type="checkbox" name="askSongs" defaultChecked={s.rsvp.askSongs} />
            <span>Ask for a song request</span>
          </label>
        </div>
      </section>

      <section className="adm-panel flex flex-col gap-5">
        <h2>
          The ceremony <Tba show={!s.ceremony.venueName} />
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          {text("ceremony.venueName", "Venue", s.ceremony.venueName)}
          {text("ceremony.address", "Address", s.ceremony.address, { max: 300 })}
          {text("ceremony.timeLabel", "Time, as written", s.ceremony.timeLabel, { placeholder: "Four o’clock in the afternoon", max: 120 })}
          {text("ceremony.startTime24", "Start time", s.ceremony.startTime24, { type: "time", help: "Used for the countdown and calendar invite." })}
        </div>
      </section>

      <section className="adm-panel flex flex-col gap-5">
        <h2>
          The reception <Tba show={!s.reception.venueName} />
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          {text("reception.venueName", "Venue", s.reception.venueName)}
          {text("reception.address", "Address", s.reception.address, { max: 300 })}
          {text("reception.timeLabel", "Time, as written", s.reception.timeLabel, { placeholder: "Dinner and dancing to follow", max: 120 })}
          <div className="grid grid-cols-2 gap-4">
            {text("reception.startTime24", "Starts", s.reception.startTime24, { type: "time" })}
            {text("reception.endTime24", "Ends", s.reception.endTime24, { type: "time" })}
          </div>
        </div>
      </section>

      <section className="adm-panel flex flex-col gap-5">
        <h2>Attire &amp; directions</h2>
        <div className="grid gap-5 md:grid-cols-2">
          {text("dressCode", "Dress code", s.dressCode, { placeholder: "Black tie optional", max: 120 })}
          <Field label="Dress code note" htmlFor="dressCodeNote" error={fe.dressCodeNote}>
            <textarea id="dressCodeNote" name="dressCodeNote" defaultValue={s.dressCodeNote ?? ""} rows={2} maxLength={600} className="adm-textarea" />
          </Field>
        </div>
        <Field label="Directions" htmlFor="directions" help="A map link is made automatically from each address." error={fe.directions}>
          <textarea id="directions" name="directions" defaultValue={s.directions ?? ""} rows={4} maxLength={2000} className="adm-textarea" />
        </Field>
      </section>

      <p className="adm-muted">
        The order of the day, the questions &amp; answers and all other wording live under <a href="/admin/words" className="underline">Words</a>.
      </p>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-[var(--rule)] bg-ivory/95 px-4 py-3 md:mx-0 md:px-0">
        <SubmitButton busy={pending}>Save settings</SubmitButton>
        {state.ok && <span className="adm-muted">Saved.</span>}
        {state.error && <span className="adm-error">{state.error}</span>}
      </div>
    </form>
  );
}
