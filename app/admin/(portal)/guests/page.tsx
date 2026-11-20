import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { repo } from "@/lib/db";
import { guestName, householdState, matchesFilter, matchesQuery, type GuestFilter } from "@/lib/admin/stats";
import { inviteLink, siteOrigin } from "@/lib/admin/origin";
import { CopyButton } from "../../_components/copy-button";
import { Flash, GuestMark, PageHeader, Status } from "../../_components/ui";

export const metadata: Metadata = { title: "Guests" };

const FILTERS: { value: GuestFilter; label: string }[] = [
  { value: "all", label: "Everyone" },
  { value: "awaiting", label: "Awaiting reply" },
  { value: "attending", label: "Attending" },
  { value: "partial", label: "Partly attending" },
  { value: "declined", label: "Declined" },
  { value: "plusone", label: "Plus-one allowed" },
];

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function GuestsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = one(sp.q).slice(0, 100);
  const filterRaw = one(sp.filter);
  const filter: GuestFilter = FILTERS.some((f) => f.value === filterRaw) ? (filterRaw as GuestFilter) : "all";
  const imported = one(sp.imported);
  const deleted = one(sp.deleted);

  const [all, origin] = await Promise.all([repo.listHouseholds(), siteOrigin()]);
  const list = all.filter((h) => matchesQuery(h, q) && matchesFilter(h, filter));
  const guestTotal = list.reduce((n, h) => n + h.guests.filter((g) => !g.isPlusOne).length, 0);

  return (
    <>
      <PageHeader eyebrow="Guest list" title="Households">
        <Link href="/admin/guests/new" className="btn">
          Add household
        </Link>
        <a href="/api/admin/export/links" className="btn btn-ghost" download>
          Export invitation links
        </a>
      </PageHeader>

      {imported && /^\d+$/.test(imported) && (
        <Flash>
          Imported {imported} household{imported === "1" ? "" : "s"}.
        </Flash>
      )}
      {deleted && <Flash>Household deleted.</Flash>}

      <form method="get" role="search" className="adm-panel grid gap-4 md:grid-cols-[1fr_16rem_auto] md:items-end">
        <div className="flex flex-col gap-1">
          <label htmlFor="q" className="adm-label">
            Search
          </label>
          <input id="q" name="q" type="search" defaultValue={q} placeholder="Name, guest or invite code" className="adm-input" autoComplete="off" />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="filter" className="adm-label">
            Show
          </label>
          <select id="filter" name="filter" defaultValue={filter} className="adm-select">
            {FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-3">
          <button type="submit" className="btn flex-1 md:flex-none">
            Apply
          </button>
          {(q || filter !== "all") && (
            <Link href="/admin/guests" className="btn btn-ghost flex-1 md:flex-none">
              Reset
            </Link>
          )}
        </div>
      </form>

      <p className="adm-muted -mt-4">
        Showing {list.length} of {all.length} household{all.length === 1 ? "" : "s"} · {guestTotal} invited guest{guestTotal === 1 ? "" : "s"}
      </p>

      {all.length === 0 ? (
        <div className="adm-panel flex flex-col items-start gap-3">
          <h2>No households yet</h2>
          <p>Add households one at a time, or import your whole list from a spreadsheet.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/guests/new" className="btn">
              Add household
            </Link>
            <Link href="/admin/import" className="btn btn-ghost">
              Import CSV
            </Link>
          </div>
        </div>
      ) : list.length === 0 ? (
        <p className="adm-panel">No households match that search.</p>
      ) : (
        <table className="adm-table">
          <thead>
            <tr>
              <th scope="col">Household</th>
              <th scope="col">Guests</th>
              <th scope="col">Reply</th>
              <th scope="col">Invitation</th>
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {list.map((h) => {
              const link = inviteLink(origin, h.token);
              const plusOne = h.guests.find((g) => g.isPlusOne);
              return (
                <tr key={h.id}>
                  <td>
                    <Link href={`/admin/guests/${h.id}`} className="font-display text-lg text-olive-deep adm-break">
                      {h.name}
                    </Link>
                    {h.plusOneAllowed && (
                      <div className="mt-1">
                        <span className="adm-tag">{plusOne ? `+1 · ${guestName(plusOne)}` : "+1 allowed"}</span>
                      </div>
                    )}
                  </td>
                  <td data-label="Guests">
                    <ul className="flex flex-col">
                      {h.guests.map((g) => (
                        <li key={g.id} className="flex items-baseline justify-between gap-3 md:justify-start">
                          <span className="adm-break">
                            {guestName(g)}
                            {g.isPlusOne && <span className="adm-muted text-base"> (guest)</span>}
                          </span>
                          {h.rsvp && <GuestMark attending={g.attending} />}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td data-label="Reply" className="adm-td-inline">
                    <Status state={householdState(h)} />
                  </td>
                  <td data-label="Invitation">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span className="adm-code">{h.inviteCode}</span>
                      <CopyButton value={link} />
                    </div>
                  </td>
                  <td className="md:text-right">
                    <Link href={`/admin/guests/${h.id}`} className="btn btn-ghost btn-sm mt-2 w-full md:mt-0 md:w-auto">
                      Open
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}
