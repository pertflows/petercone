"use client";

import { useActionState, useId, useState } from "react";
import { saveHouseholdAction, type ActionState } from "../actions";
import { Field, Flash } from "./ui";
import { SubmitButton, submitWithoutReset } from "./submit-button";

export interface HouseholdFormValues {
  id?: string;
  name: string;
  email: string;
  notes: string;
  plusOneAllowed: boolean;
  plusOneName?: string | null;
  guests: { id: string; firstName: string; lastName: string }[];
}

let seq = 0;
const blank = () => ({ key: `new-${++seq}`, id: "", firstName: "", lastName: "" });

export function HouseholdForm({ initial }: { initial: HouseholdFormValues }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveHouseholdAction, {});
  const [rows, setRows] = useState(() => (initial.guests.length ? initial.guests.map((g) => ({ key: g.id, ...g })) : [blank()]));
  const uid = useId();
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} onSubmit={submitWithoutReset(action)} className="flex flex-col gap-6" noValidate>
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      {state.error && <Flash tone="error">{state.error}</Flash>}

      <Field label="Household name" htmlFor={`${uid}-name`} help="As it appears on the reply card, e.g. “The Rossi Family”." error={fe.name}>
        <input id={`${uid}-name`} name="name" defaultValue={initial.name} required maxLength={120} className="adm-input" aria-invalid={fe.name ? true : undefined} />
      </Field>

      <fieldset className="flex flex-col gap-3">
        <legend className="adm-label mb-1">Guests</legend>
        <ul className="flex flex-col gap-3">
          {rows.map((r, i) => (
            <li key={r.key} className="grid grid-cols-[1fr_auto] gap-2 border-b border-[var(--hair)] pb-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:border-0 sm:pb-0">
              <input type="hidden" name="guestId" value={r.id} />
              <div className="flex flex-col gap-1">
                <label htmlFor={`${uid}-f${r.key}`} className="adm-help not-italic">
                  First name {i + 1}
                </label>
                <input
                  id={`${uid}-f${r.key}`}
                  name="firstName"
                  defaultValue={r.firstName}
                  maxLength={80}
                  autoComplete="off"
                  className="adm-input"
                />
              </div>
              <div className="col-start-1 flex flex-col gap-1 sm:col-start-auto">
                <label htmlFor={`${uid}-l${r.key}`} className="adm-help not-italic">
                  Last name {i + 1}
                </label>
                <input id={`${uid}-l${r.key}`} name="lastName" defaultValue={r.lastName} maxLength={80} autoComplete="off" className="adm-input" />
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm col-start-2 row-span-2 row-start-1 self-end sm:col-start-auto sm:row-span-1 sm:row-start-auto"
                onClick={() => setRows((rs) => (rs.length > 1 ? rs.filter((x) => x.key !== r.key) : [blank()]))}
                aria-label={`Remove guest ${i + 1}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        {fe.guests && <p className="adm-error">{fe.guests}</p>}
        <div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setRows((rs) => (rs.length < 20 ? [...rs, blank()] : rs))} disabled={rows.length >= 20}>
            + Add guest
          </button>
        </div>
        {initial.id && <p className="adm-help">Removing a guest also removes their reply.</p>}
      </fieldset>

      <div className="flex flex-col gap-1">
        <label className="adm-check">
          <input type="checkbox" name="plusOneAllowed" defaultChecked={initial.plusOneAllowed} />
          <span>May bring a plus-one</span>
        </label>
        {initial.plusOneName && <p className="adm-help">Their guest: {initial.plusOneName}. Turning this off removes the plus-one from the reply.</p>}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Email (optional)" htmlFor={`${uid}-email`} error={fe.email}>
          <input id={`${uid}-email`} name="email" type="email" inputMode="email" autoComplete="off" defaultValue={initial.email} maxLength={200} className="adm-input" aria-invalid={fe.email ? true : undefined} />
        </Field>
        <Field label="Private notes (optional)" htmlFor={`${uid}-notes`} help="Only visible here." error={fe.notes}>
          <textarea id={`${uid}-notes`} name="notes" defaultValue={initial.notes} maxLength={1000} rows={3} className="adm-textarea" />
        </Field>
      </div>

      <div>
        <SubmitButton busy={pending}>{initial.id ? "Save household" : "Add household"}</SubmitButton>
      </div>
    </form>
  );
}
