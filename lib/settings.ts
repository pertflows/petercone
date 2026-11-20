import "server-only";
import { defaultSettings, type WeddingSettings } from "./wedding.config";
import { repo } from "./db";

type Plain = Record<string, unknown>;
const isObj = (v: unknown): v is Plain => typeof v === "object" && v !== null && !Array.isArray(v);

function deepMerge<T>(base: T, over: unknown): T {
  if (!isObj(base) || !isObj(over)) return (over === undefined ? base : (over as T));
  const out: Plain = { ...base };
  for (const [k, v] of Object.entries(over)) {
    if (v === undefined) continue;
    out[k] = isObj(v) && isObj((base as Plain)[k]) ? deepMerge((base as Plain)[k], v) : v;
  }
  return out as T;
}

/** Config file defaults, overlaid with anything the couple saved in the admin portal. */
export async function getSettings(): Promise<WeddingSettings> {
  try {
    const over = await repo.getSettingsOverrides();
    return deepMerge(defaultSettings, over);
  } catch (e) {
    console.error("[settings] falling back to defaults:", e);
    return defaultSettings;
  }
}

/** RSVPs (and edits) are accepted through the end of the deadline day, in the venue timezone. */
export function rsvpOpen(s: WeddingSettings, now = new Date()): boolean {
  if (!s.rsvp.deadline) return true;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: s.timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  return today <= s.rsvp.deadline;
}
