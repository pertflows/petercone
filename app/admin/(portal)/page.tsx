import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { repo } from "@/lib/db";
import { getSettings, rsvpOpen } from "@/lib/settings";
import { formatDeadline } from "@/lib/format";
import { computeStats } from "@/lib/admin/stats";
import { PageHeader } from "../_components/ui";

function daysUntil(iso: string, tz: string) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return Math.round((Date.parse(`${iso}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000);
}

const dateFmt = (iso: string, tz: string) => new Date(iso).toLocaleDateString("en-US", { timeZone: tz, month: "short", day: "numeric" });

export default async function Dashboard() {
  await requireAdmin();
  const [households, settings] = await Promise.all([repo.listHouseholds(), getSettings()]);
  const s = computeStats(households, settings.rsvp.meals);
  const deadline = formatDeadline(settings.rsvp.deadline);
  const open = rsvpOpen(settings);
  const days = settings.rsvp.deadline ? daysUntil(settings.rsvp.deadline, settings.timezone) : null;
  const mealMax = Math.max(1, ...s.meals.map((m) => m.count), s.mealUnselected);

  return (
    <>
      <PageHeader eyebrow="Overview" title="Replies at a glance">
        <a href="/api/admin/export" className="btn btn-ghost" download>
          Export guest list (CSV)
        </a>
      </PageHeader>

      <section aria-label="RSVP deadline" className="adm-panel adm-panel-parchment flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="adm-label">Reply by</p>
          {deadline ? <p className="font-display text-2xl text-olive-deep">{deadline}</p> : <p className="tba text-xl">No deadline set yet</p>}
        </div>
        <p className="adm-muted">
          {!settings.rsvp.deadline ? (
            <>
              Replies stay open until you <Link href="/admin/settings">set a deadline</Link>.
            </>
          ) : open ? (
            days === 0 ? "Replies close at the end of today." : `${days} day${days === 1 ? "" : "s"} left — replies are open.`
          ) : (
            "Replies are closed to guests. You can still edit any reply here."
          )}
        </p>
      </section>

      <section aria-label="Totals" className="grid grid-cols-2 gap-px overflow-hidden border border-[var(--hair)] bg-[var(--hair)] md:grid-cols-4">
        {[
          { label: "Invited guests", value: s.invited, note: s.plusOnesAllowed ? `+ ${s.plusOnesAllowed} plus-one${s.plusOnesAllowed === 1 ? "" : "s"} allowed` : `${s.households} households` },
          { label: "Attending", value: s.attending, note: s.attendingPlusOnes ? `incl. ${s.attendingPlusOnes} plus-one${s.attendingPlusOnes === 1 ? "" : "s"}` : "including plus-ones" },
          { label: "Declined", value: s.declined, note: "regretfully" },
          { label: "Awaiting", value: s.awaiting, note: "no reply yet" },
        ].map((t) => (
          <div key={t.label} className="flex flex-col gap-2 bg-ivory p-4 md:p-5">
            <p className="adm-label">{t.label}</p>
            <p className="adm-figure">{t.value}</p>
            <p className="adm-muted text-base">{t.note}</p>
          </div>
        ))}
      </section>

      <section aria-label="Progress" className="grid gap-6 md:grid-cols-2">
        <div className="adm-panel flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <p className="adm-label">Attendance</p>
            <p className="font-display text-2xl text-olive-deep">{s.attendancePct}%</p>
          </div>
          <div className="adm-bar" role="presentation">
            <span style={{ width: `${s.attendancePct}%` }} />
          </div>
          <p className="adm-muted text-base">of invited guests are attending (not counting plus-ones).</p>
        </div>
        <div className="adm-panel flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <p className="adm-label">Households replied</p>
            <p className="font-display text-2xl text-olive-deep">
              {s.householdsResponded} <span className="text-lg adm-muted">/ {s.households}</span>
            </p>
          </div>
          <div className="adm-bar" role="presentation">
            <span style={{ width: `${s.responsePct}%` }} />
          </div>
          <p className="adm-muted text-base">
            {s.households - s.householdsResponded} household{s.households - s.householdsResponded === 1 ? "" : "s"} still to reply.{" "}
            {s.households - s.householdsResponded > 0 && <Link href="/admin/guests?filter=awaiting">See who</Link>}
          </p>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="adm-panel flex flex-col gap-4">
          <h2>Meal selections</h2>
          {settings.rsvp.meals.length === 0 && s.meals.length === 0 ? (
            <p className="adm-muted">
              Meal selection is off. <Link href="/admin/settings#meals">Add meal choices</Link> to ask guests.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {s.meals.map((m) => (
                <li key={m.meal} className="flex flex-col gap-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="adm-break">{m.meal}</span>
                    <span className="font-display text-xl text-olive-deep tabular-nums">{m.count}</span>
                  </div>
                  <div className="adm-bar">
                    <span style={{ width: `${(m.count / mealMax) * 100}%` }} />
                  </div>
                </li>
              ))}
              {s.mealUnselected > 0 && (
                <li className="flex items-baseline justify-between gap-3 adm-muted">
                  <span className="italic">No meal chosen</span>
                  <span className="tabular-nums">{s.mealUnselected}</span>
                </li>
              )}
            </ul>
          )}
        </section>

        <section className="adm-panel flex flex-col gap-4">
          <h2>Dietary notes</h2>
          {s.dietary.length === 0 ? (
            <p className="adm-muted">None so far.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-[var(--hair)]">
              {s.dietary.map((d, i) => (
                <li key={i} className="flex flex-col py-2 first:pt-0 sm:flex-row sm:justify-between sm:gap-4">
                  <span>
                    {d.name} <span className="adm-muted text-base">· {d.household}</span>
                  </span>
                  <span className="adm-break italic text-espresso">{d.restriction}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {settings.rsvp.askSongs || s.songs.length > 0 ? (
          <section className="adm-panel flex flex-col gap-4">
            <h2>Song requests</h2>
            {s.songs.length === 0 ? (
              <p className="adm-muted">No requests yet.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-[var(--hair)]">
                {s.songs.map((x, i) => (
                  <li key={i} className="py-2 first:pt-0">
                    <span className="adm-break italic">“{x.song}”</span> <span className="adm-muted text-base">— {x.household}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}

        <section className="adm-panel flex flex-col gap-4 md:col-span-2">
          <h2>Notes from guests</h2>
          {s.messages.length === 0 ? (
            <p className="adm-muted">No messages yet.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-[var(--hair)]">
              {s.messages.map((m, i) => (
                <li key={i} className="flex flex-col gap-1 py-3 first:pt-0">
                  <p className="adm-break whitespace-pre-line font-serif text-lg italic text-espresso">“{m.message}”</p>
                  <p className="adm-label text-base">
                    {m.household} · {dateFmt(m.at, settings.timezone)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
