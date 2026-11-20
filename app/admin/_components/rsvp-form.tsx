"use client";

import { useActionState, useState } from "react";
import { saveRsvpAction, type ActionState } from "../actions";
import { Flash } from "./ui";
import { SubmitButton, submitWithoutReset } from "./submit-button";

interface G {
  id: string;
  firstName: string;
  lastName: string;
  attending: boolean | null;
  meal: string | null;
  dietary: string | null;
}

export interface RsvpFormProps {
  householdId: string;
  guests: G[];
  plusOneAllowed: boolean;
  plusOne: G | null;
  songRequest: string | null;
  message: string | null;
  meals: string[];
  askSongs: boolean;
}

function MealSelect({ id, name, value, meals }: { id: string; name: string; value: string | null; meals: string[] }) {
  const options = value && !meals.includes(value) ? [...meals, value] : meals;
  return (
    <select id={id} name={name} defaultValue={value ?? ""} className="adm-select">
      <option value="">— Not chosen —</option>
      {options.map((m) => (
        <option key={m} value={m}>
          {m}
        </option>
      ))}
    </select>
  );
}

export function RsvpForm(p: RsvpFormProps) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveRsvpAction, {});
  const [answers, setAnswers] = useState<Record<string, boolean | null>>(() => Object.fromEntries(p.guests.map((g) => [g.id, g.attending])));
  const fe = state.fieldErrors ?? {};
  const hasMeals = p.meals.length > 0 || p.guests.some((g) => g.meal) || Boolean(p.plusOne?.meal);

  return (
    <form action={action} onSubmit={submitWithoutReset(action)} className="flex flex-col gap-6">
      <input type="hidden" name="id" value={p.householdId} />
      {state.error && <Flash tone="error">{state.error}</Flash>}

      <ul className="flex flex-col gap-5">
        {p.guests.map((g) => {
          const yes = answers[g.id] === true;
          const err = fe[`attending.${g.id}`];
          return (
            <li key={g.id} className="flex flex-col gap-3 border-b border-[var(--hair)] pb-5 last:border-0 last:pb-0">
              <fieldset className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <legend className="sr-only">Is {g.firstName} attending?</legend>
                <span className="font-display text-lg text-olive-deep" aria-hidden>
                  {g.firstName} {g.lastName}
                </span>
                <div className="adm-seg self-start" role="radiogroup" aria-label={`${g.firstName} ${g.lastName} attending`}>
                  <label>
                    <input type="radio" name={`attending.${g.id}`} value="yes" defaultChecked={g.attending === true} onChange={() => setAnswers((a) => ({ ...a, [g.id]: true }))} />
                    Joyfully accepts
                  </label>
                  <label>
                    <input type="radio" name={`attending.${g.id}`} value="no" defaultChecked={g.attending === false} onChange={() => setAnswers((a) => ({ ...a, [g.id]: false }))} />
                    Declines
                  </label>
                </div>
              </fieldset>
              {err && <p className="adm-error">{err}</p>}
              {yes && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {hasMeals && (
                    <div className="flex flex-col gap-1">
                      <label htmlFor={`meal-${g.id}`} className="adm-label">
                        Meal
                      </label>
                      <MealSelect id={`meal-${g.id}`} name={`meal.${g.id}`} value={g.meal} meals={p.meals} />
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <label htmlFor={`diet-${g.id}`} className="adm-label">
                      Dietary needs
                    </label>
                    <input id={`diet-${g.id}`} name={`dietary.${g.id}`} defaultValue={g.dietary ?? ""} maxLength={300} className="adm-input" placeholder="None" />
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {p.plusOneAllowed && (
        <fieldset className="adm-panel adm-panel-parchment flex flex-col gap-4">
          <legend className="adm-label px-1">Plus-one</legend>
          <p className="adm-help -mt-2">Leave the name blank if they aren’t bringing a guest.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="po-first" className="adm-label">
                First name
              </label>
              <input id="po-first" name="plusOne.firstName" defaultValue={p.plusOne?.firstName ?? ""} maxLength={80} className="adm-input" aria-invalid={fe["plusOne.firstName"] ? true : undefined} />
              {fe["plusOne.firstName"] && <p className="adm-error">{fe["plusOne.firstName"]}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="po-last" className="adm-label">
                Last name
              </label>
              <input id="po-last" name="plusOne.lastName" defaultValue={p.plusOne?.lastName ?? ""} maxLength={80} className="adm-input" />
            </div>
            {hasMeals && (
              <div className="flex flex-col gap-1">
                <label htmlFor="po-meal" className="adm-label">
                  Meal
                </label>
                <MealSelect id="po-meal" name="plusOne.meal" value={p.plusOne?.meal ?? null} meals={p.meals} />
              </div>
            )}
            <div className="flex flex-col gap-1">
              <label htmlFor="po-diet" className="adm-label">
                Dietary needs
              </label>
              <input id="po-diet" name="plusOne.dietary" defaultValue={p.plusOne?.dietary ?? ""} maxLength={300} className="adm-input" placeholder="None" />
            </div>
          </div>
        </fieldset>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {(p.askSongs || p.songRequest) && (
          <div className="flex flex-col gap-1">
            <label htmlFor="song" className="adm-label">
              Song request
            </label>
            <input id="song" name="songRequest" defaultValue={p.songRequest ?? ""} maxLength={300} className="adm-input" />
          </div>
        )}
        <div className="flex flex-col gap-1 md:col-span-2">
          <label htmlFor="msg" className="adm-label">
            Message to the couple
          </label>
          <textarea id="msg" name="message" defaultValue={p.message ?? ""} maxLength={2000} rows={3} className="adm-textarea" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton busy={pending}>Save reply</SubmitButton>
        <p className="adm-help">Saving here works even after the RSVP deadline.</p>
      </div>
    </form>
  );
}
