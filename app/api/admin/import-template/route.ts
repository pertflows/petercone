import { getAdminSession } from "@/lib/auth";
import { csvResponse, toCsv } from "@/lib/admin/csv";
import { IMPORT_TEMPLATE_ROWS } from "@/lib/admin/import";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getAdminSession())) return Response.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  return csvResponse(toCsv(IMPORT_TEMPLATE_ROWS), "guest-list-template.csv");
}
