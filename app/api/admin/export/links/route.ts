import { getAdminSession } from "@/lib/auth";
import { repo } from "@/lib/db";
import { csvResponse, toCsv } from "@/lib/admin/csv";
import { inviteLink, siteOrigin } from "@/lib/admin/origin";
import { STATE_LABEL, guestName, householdState } from "@/lib/admin/stats";

export const dynamic = "force-dynamic";

/** Household → personal invitation link, for sending by text or email. */
export async function GET() {
  if (!(await getAdminSession())) return Response.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const [households, origin] = await Promise.all([repo.listHouseholds(), siteOrigin()]);
  const rows: unknown[][] = [["household", "guests", "invite_code", "link", "email", "status"]];
  for (const h of households) {
    rows.push([
      h.name,
      h.guests.filter((g) => !g.isPlusOne).map(guestName).join(", "),
      h.inviteCode,
      inviteLink(origin, h.token),
      h.email ?? "",
      STATE_LABEL[householdState(h)],
    ]);
  }
  const stamp = new Date().toISOString().slice(0, 10);
  return csvResponse(toCsv(rows), `perticone-invitation-links-${stamp}.csv`);
}
