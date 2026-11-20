"use client";

import { startTransition } from "react";
import { useFormStatus } from "react-dom";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { pendingLabel?: string; busy?: boolean };

export function SubmitButton({ children, pendingLabel = "Saving…", busy, className = "btn", disabled, ...rest }: Props) {
  const status = useFormStatus();
  const pending = busy ?? status.pending;
  return (
    <button type="submit" className={className} {...rest} disabled={pending || disabled} aria-busy={pending || undefined}>
      {pending ? pendingLabel : children}
    </button>
  );
}

/** Submit button that asks for confirmation first (for destructive actions). */
export function ConfirmSubmit({ children, confirm: question, className = "btn btn-danger", pendingLabel = "Working…" }: { children: React.ReactNode; confirm: string; className?: string; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(question)) e.preventDefault();
      }}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

/**
 * onSubmit handler that dispatches a useActionState action WITHOUT React’s
 * automatic form reset, so typed values survive a validation error. The
 * form keeps `action={…}` as the no-JavaScript fallback.
 */
export function submitWithoutReset(dispatch: (fd: FormData) => void) {
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter;
    const fd = new FormData(e.currentTarget, submitter instanceof HTMLElement ? submitter : null);
    startTransition(() => dispatch(fd));
  };
}
