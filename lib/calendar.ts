import type { WeddingSettings } from "./wedding.config";
import { zonedToUtc } from "./format";

const pad = (n: number) => String(n).padStart(2, "0");
const utcStamp = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
const dayStamp = (iso: string) => iso.replace(/-/g, "");
const nextDay = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + 1));
  return `${t.getUTCFullYear()}${pad(t.getUTCMonth() + 1)}${pad(t.getUTCDate())}`;
};

export function eventWindow(s: WeddingSettings): { allDay: true; start: string; end: string } | { allDay: false; start: Date; end: Date } {
  const startT = s.ceremony.startTime24 ?? s.reception.startTime24;
  if (!startT) return { allDay: true, start: dayStamp(s.date), end: nextDay(s.date) };
  const start = zonedToUtc(s.date, startT, s.timezone);
  const end = s.reception.endTime24 ? zonedToUtc(s.date, s.reception.endTime24, s.timezone) : new Date(start.getTime() + 6 * 3600_000);
  return { allDay: false, start, end: end > start ? end : new Date(end.getTime() + 24 * 3600_000) };
}

function where(s: WeddingSettings) {
  return [s.ceremony.venueName, s.ceremony.address].filter(Boolean).join(", ");
}

export function googleCalendarUrl(s: WeddingSettings, siteUrl: string): string {
  const w = eventWindow(s);
  const dates = w.allDay ? `${w.start}/${w.end}` : `${utcStamp(w.start)}/${utcStamp(w.end)}`;
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: `${s.couple.primary}’s Wedding`,
    dates,
    details: `Celebrating ${s.couple.formal}. Details & RSVP: ${siteUrl}`,
    location: where(s),
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}

const esc = (t: string) => t.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

export function icsFile(s: WeddingSettings, siteUrl: string): string {
  const w = eventWindow(s);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//The Perticones//Wedding//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:perticone-wedding-${s.date}@perticone`,
    `DTSTAMP:${utcStamp(new Date())}`,
    ...(w.allDay ? [`DTSTART;VALUE=DATE:${w.start}`, `DTEND;VALUE=DATE:${w.end}`] : [`DTSTART:${utcStamp(w.start)}`, `DTEND:${utcStamp(w.end)}`]),
    `SUMMARY:${esc(`${s.couple.primary}’s Wedding`)}`,
    `DESCRIPTION:${esc(`Celebrating ${s.couple.formal}. Details & RSVP: ${siteUrl}`)}`,
    ...(where(s) ? [`LOCATION:${esc(where(s))}`] : []),
    `URL:${siteUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}
