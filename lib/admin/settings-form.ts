import { z } from "zod";
import type { WeddingSettings } from "@/lib/wedding.config";

/* Validation + shaping for the admin Settings form. Isomorphic (no server-only imports). */

const text = (max: number) =>
  z
    .string()
    .max(max, `Keep this under ${max} characters.`)
    .transform((s) => s.trim())
    .transform((s) => (s === "" ? null : s));
const time24 = z
  .string()
  .trim()
  .refine((s) => s === "" || /^([01]\d|2[0-3]):[0-5]\d$/.test(s), "Use 24-hour time, e.g. 16:30.")
  .transform((s) => (s === "" ? null : s));
const isoDate = z
  .string()
  .trim()
  .refine((s) => s === "" || (/^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`))), "Choose a valid date.")
  .transform((s) => (s === "" ? null : s));

export function validTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export const settingsSchema = z.object({
  deadline: isoDate,
  timezone: z.string().trim().min(1, "Choose a timezone.").refine(validTimeZone, "Unknown timezone."),
  ceremony: z.object({ venueName: text(160), address: text(300), timeLabel: text(120), startTime24: time24 }),
  reception: z.object({ venueName: text(160), address: text(300), timeLabel: text(120), startTime24: time24, endTime24: time24 }),
  dressCode: text(120),
  dressCodeNote: text(600),
  directions: text(2000),
  meals: z
    .string()
    .max(2000)
    .transform((s) => [...new Set(s.split(/\r?\n/).map((m) => m.trim().replace(/\s+/g, " ")).filter(Boolean))])
    .pipe(z.array(z.string().max(80, "Each meal must be under 80 characters.")).max(12, "Offer at most 12 meal choices.")),
  allowNameLookup: z.boolean(),
  askSongs: z.boolean(),
});

export type SettingsInput = z.infer<typeof settingsSchema>;

export function settingsFromForm(fd: FormData) {
  const s = (k: string) => {
    const v = fd.get(k);
    return typeof v === "string" ? v : "";
  };
  return {
    deadline: s("deadline"),
    timezone: s("timezone"),
    ceremony: { venueName: s("ceremony.venueName"), address: s("ceremony.address"), timeLabel: s("ceremony.timeLabel"), startTime24: s("ceremony.startTime24") },
    reception: {
      venueName: s("reception.venueName"),
      address: s("reception.address"),
      timeLabel: s("reception.timeLabel"),
      startTime24: s("reception.startTime24"),
      endTime24: s("reception.endTime24"),
    },
    dressCode: s("dressCode"),
    dressCodeNote: s("dressCodeNote"),
    directions: s("directions"),
    meals: s("meals"),
    allowNameLookup: fd.get("allowNameLookup") === "on",
    askSongs: fd.get("askSongs") === "on",
  };
}

/** The overridable subset of WeddingSettings, built from validated input. */
export function toOverrides(v: SettingsInput): Partial<WeddingSettings> {
  return {
    timezone: v.timezone,
    ceremony: v.ceremony,
    reception: v.reception,
    dressCode: v.dressCode,
    dressCodeNote: v.dressCodeNote,
    directions: v.directions,
    rsvp: { deadline: v.deadline, meals: v.meals, allowNameLookup: v.allowNameLookup, askSongs: v.askSongs },
  };
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Drop values identical to the config-file defaults so that later edits to
 * lib/wedding.config.ts still flow through for anything the couple hasn’t changed.
 */
export function pruneDefaults(over: Record<string, unknown>, defaults: unknown): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(over)) {
    const d = isObj(defaults) ? defaults[k] : undefined;
    if (isObj(v) && isObj(d)) {
      const sub = pruneDefaults(v, d);
      if (Object.keys(sub).length) out[k] = sub;
    } else if (!same(v, d)) out[k] = v;
  }
  return out;
}

/** Human labels for every field that is still a placeholder. */
export function placeholderFields(s: WeddingSettings): string[] {
  const out: string[] = [];
  const add = (cond: boolean, label: string) => cond && out.push(label);
  add(!s.rsvp.deadline, "RSVP deadline");
  add(!s.ceremony.venueName, "Ceremony venue");
  add(!s.ceremony.address, "Ceremony address");
  add(!s.ceremony.timeLabel, "Ceremony time (as written)");
  add(!s.ceremony.startTime24, "Ceremony start time");
  add(!s.reception.venueName, "Reception venue");
  add(!s.reception.address, "Reception address");
  add(!s.reception.timeLabel, "Reception time (as written)");
  add(!s.reception.startTime24, "Reception start time");
  add(!s.reception.endTime24, "Reception end time");
  add(!s.dressCode, "Dress code");
  add(!s.directions, "Directions");
  add(s.rsvp.meals.length === 0, "Meal choices (none — meal selection hidden)");
  s.timeline.forEach((e) => add(!e.time, `Timeline: ${e.title} time`));
  s.faqs.forEach((f) => add(!f.answer, `FAQ: ${f.question}`));
  return out;
}
