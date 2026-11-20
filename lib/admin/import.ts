import { z } from "zod";
import { parseCsv } from "./csv";

/** Columns accepted by the guest-list import. */
export const IMPORT_COLUMNS = ["household", "first_name", "last_name", "plus_one", "email", "notes"] as const;
const REQUIRED = ["household", "first_name", "last_name"] as const;

export const IMPORT_TEMPLATE_ROWS: string[][] = [
  [...IMPORT_COLUMNS],
  ["The Rossi Family", "Maria", "Rossi", "no", "maria@example.com", "Bride’s aunt"],
  ["The Rossi Family", "Paolo", "Rossi", "no", "", ""],
  ["The Rossi Family", "Lucia", "Rossi", "no", "", "Age 9"],
  ["Sam Carter", "Sam", "Carter", "yes", "sam@example.com", "College roommate"],
];

export const MAX_IMPORT_ROWS = 1500;

export interface ImportHousehold {
  name: string;
  plusOneAllowed: boolean;
  email: string | null;
  notes: string | null;
  guests: { firstName: string; lastName: string }[];
  /** A household with this name already exists — it will be skipped. */
  duplicate: boolean;
}

export interface ImportResult {
  households: ImportHousehold[];
  /** Problems that stop the import entirely. */
  errors: string[];
  /** Rows or values that were skipped / ignored. */
  warnings: string[];
  guestCount: number;
}

const TRUTHY = new Set(["yes", "y", "true", "1", "x", "✓"]);
const emailSchema = z.email();

const normHeader = (h: string) => h.trim().toLowerCase().replace(/[\s-]+/g, "_");
const normKey = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();
const clean = (s: string | undefined, max: number) => (s ?? "").trim().replace(/\s+/g, " ").slice(0, max);

/**
 * Parse an uploaded guest-list CSV. Rows sharing the same `household` value
 * (case-insensitive) become one household.
 */
export function parseGuestImport(text: string, existingNames: string[] = []): ImportResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const rows = parseCsv(text);
  if (rows.length === 0) return { households: [], errors: ["The file is empty."], warnings, guestCount: 0 };

  const header = rows[0].map(normHeader);
  const col = Object.fromEntries(IMPORT_COLUMNS.map((c) => [c, header.indexOf(c)])) as Record<(typeof IMPORT_COLUMNS)[number], number>;
  const missing = REQUIRED.filter((c) => col[c] === -1);
  if (missing.length) {
    errors.push(`Missing column${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}. The first row must be the header: ${IMPORT_COLUMNS.join(",")}`);
    return { households: [], errors, warnings, guestCount: 0 };
  }
  const body = rows.slice(1);
  if (body.length === 0) errors.push("The file has a header row but no guests.");
  if (body.length > MAX_IMPORT_ROWS) {
    errors.push(`That’s ${body.length} rows — please import at most ${MAX_IMPORT_ROWS} at a time.`);
    return { households: [], errors, warnings, guestCount: 0 };
  }

  const existing = new Set(existingNames.map(normKey));
  const groups = new Map<string, ImportHousehold>();
  let guestCount = 0;

  body.forEach((r, idx) => {
    const line = idx + 2;
    const get = (c: (typeof IMPORT_COLUMNS)[number], max: number) => (col[c] === -1 ? "" : clean(r[col[c]], max));
    const household = get("household", 120);
    const first = get("first_name", 80);
    const last = get("last_name", 80);
    if (!household && !first && !last) return;
    if (!household) {
      warnings.push(`Row ${line}: no household name — skipped.`);
      return;
    }
    const key = normKey(household);
    let h = groups.get(key);
    if (!h) {
      h = { name: household, plusOneAllowed: false, email: null, notes: null, guests: [], duplicate: existing.has(key) };
      groups.set(key, h);
    }
    if (TRUTHY.has(get("plus_one", 10).toLowerCase())) h.plusOneAllowed = true;
    const email = get("email", 200);
    if (email) {
      if (!emailSchema.safeParse(email).success) warnings.push(`Row ${line}: “${email}” isn’t a valid email — ignored.`);
      else if (!h.email) h.email = email;
    }
    const notes = get("notes", 500);
    if (notes) h.notes = h.notes ? (h.notes.includes(notes) ? h.notes : `${h.notes}; ${notes}`.slice(0, 1000)) : notes;
    if (!first && !last) {
      warnings.push(`Row ${line}: no guest name — only household details were used.`);
      return;
    }
    if (h.guests.length >= 20) {
      warnings.push(`Row ${line}: ${household} already has 20 guests — skipped.`);
      return;
    }
    h.guests.push({ firstName: first, lastName: last });
    guestCount++;
  });

  const households = [...groups.values()];
  for (const h of households) {
    if (h.guests.length === 0) errors.push(`${h.name}: no guests listed.`);
  }
  return { households, errors, warnings, guestCount };
}
