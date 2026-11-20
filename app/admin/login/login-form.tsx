"use client";

import { useActionState } from "react";
import { loginAction, type ActionState } from "../actions";
import { SubmitButton, submitWithoutReset } from "../_components/submit-button";

export function LoginForm({ showEmail }: { showEmail: boolean }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(loginAction, {});
  return (
    <form action={action} onSubmit={submitWithoutReset(action)} className="flex w-full flex-col gap-4 text-left">
      {showEmail && (
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="adm-label">
            Email
          </label>
          <input id="email" name="email" type="email" autoComplete="username" required className="adm-input" />
        </div>
      )}
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="adm-label">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="adm-input" aria-invalid={state.error ? true : undefined} aria-describedby={state.error ? "login-error" : undefined} />
      </div>
      {state.error && (
        <p id="login-error" role="alert" className="adm-error">
          {state.error}
        </p>
      )}
      <SubmitButton className="btn w-full" pendingLabel="Signing in…" busy={pending}>
        Sign in
      </SubmitButton>
    </form>
  );
}
