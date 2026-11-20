import type { HouseholdState } from "@/lib/admin/stats";
import { STATE_LABEL } from "@/lib/admin/stats";

export function Status({ state }: { state: HouseholdState }) {
  return (
    <span className="adm-status" data-s={state}>
      {STATE_LABEL[state]}
    </span>
  );
}

export function GuestMark({ attending }: { attending: boolean | null }) {
  const s = attending === true ? "attending" : attending === false ? "declined" : "awaiting";
  const label = attending === true ? "Yes" : attending === false ? "No" : "—";
  return (
    <span className="adm-status" data-s={s} aria-label={attending === true ? "attending" : attending === false ? "not attending" : "no reply"}>
      {label}
    </span>
  );
}

export function Flash({ children, tone = "ok" }: { children: React.ReactNode; tone?: "ok" | "error" }) {
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`adm-flash ${tone === "error" ? "adm-flash-error" : ""}`}>
      {children}
    </div>
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="adm-label">{eyebrow}</p>}
        <h1>{title}</h1>
      </div>
      {children && <div className="flex flex-wrap gap-3">{children}</div>}
    </header>
  );
}

export function Field({ label, htmlFor, help, error, children, className = "" }: { label: string; htmlFor?: string; help?: React.ReactNode; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={htmlFor} className="adm-label">
        {label}
      </label>
      {children}
      {help && <p className="adm-help">{help}</p>}
      {error && (
        <p className="adm-error" id={htmlFor ? `${htmlFor}-error` : undefined}>
          {error}
        </p>
      )}
    </div>
  );
}
