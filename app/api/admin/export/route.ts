import { getAdminSession } from "@/lib/auth";
import { repo } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { csvResponse, toCsv } from "@/lib/admin/csv";
import { STATE_LABEL, householdState } from "@/lib/admin/stats";

export const dynamic = "force-dynamic";

/** One row per guest — for the planner, caterer and venue. */
export async function GET() {
  if (!(await getAdminSession())) return Response.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });

  const [households, settings] = await Promise.all([repo.listHouseholds(), getSettings()]);
  const tz = settings.timezone;
  const when = (iso: string | null | undefined) =>
    iso ? new Date(iso).toLocaleString("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).replace(",", "") : "";

  const rows: unknown[][] = [
    ["household", "first_name", "last_name", "plus_one", "attending", "household_status", "meal", "dietary", "invite_code", "song_request", "message", "replied_at", "email", "notes"],
  ];
  for (const h of households) {
    for (const g of h.guests) {
      rows.push([
        h.name,
        g.firstName,
        g.lastName,
        g.isPlusOne ? "yes" : "no",
        g.attending === true ? "yes" : g.attending === false ? "no" : "awaiting",
        STATE_LABEL[householdState(h)],
        g.meal ?? "",
        g.dietary ?? "",
        h.inviteCode,
        h.rsvp?.songRequest ?? "",
        h.rsvp?.message ?? "",
        when(h.rsvp?.updatedAt),
        h.email ?? "",
        h.notes ?? "",
      ]);
    }
  }
  const stamp = new Date().toISOString().slice(0, 10);
  return csvResponse(toCsv(rows), `perticone-guest-list-${stamp}.csv`);
}
