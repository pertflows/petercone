import { getSettings } from "@/lib/settings";
import { icsFile } from "@/lib/calendar";

export async function GET(req: Request) {
  const s = await getSettings();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
  return new Response(icsFile(s, site), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="emily-and-joe-08-27-27.ics"',
      "Cache-Control": "public, max-age=300",
    },
  });
}
