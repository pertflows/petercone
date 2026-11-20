"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, signInAdmin, signOutAdmin } from "@/lib/auth";
import { repo } from "@/lib/db";
import type { HouseholdInput, RsvpSubmission } from "@/lib/db/types";
import { getSettings } from "@/lib/settings";
import { defaultSettings } from "@/lib/wedding.config";
import { parseGuestImport, type ImportResult } from "@/lib/admin/import";
import { placeholderFields, pruneDefaults, settingsFromForm, settingsSchema, toOverrides } from "@/lib/admin/settings-form";

/**
 * Every action below authorises on the server with requireAdmin() before
 * reading input, and validates all input with zod. Never trust the client.
 */

export interface ActionState {
  ok?: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
}

const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" ? v : "";
};
const strs = (fd: FormData, k: string) => fd.getAll(k).map((v) => (typeof v === "string" ? v : ""));
const optText = (max: number) =>
  z
    .string()
    .max(max, `Keep this under ${max} characters.`)
    .transform((s) => s.trim())
    .transform((s) => (s === "" ? null : s));
const idSchema = z.uuid();

function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

function refreshAll() {
  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout");
}

/* ── Auth ─────────────────────────────────────────────────────────────────── */

const loginSchema = z.object({
  email: z.string().trim().max(200),
  password: z.string().min(1, "Enter the password.").max(200),
});

export async function loginAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({ email: str(fd, "email"), password: str(fd, "password") });
  if (!parsed.success) return { error: "Please enter your sign-in details." };
  const res = await signInAdmin(parsed.data.email, parsed.data.password);
  if (!res.ok) {
    // A small, constant delay blunts password guessing.
    await new Promise((r) => setTimeout(r, 700));
    return { error: "Those details didn’t work. Please try again." };
  }
  redirect("/admin");
}

export async function signOutAction() {
  await requireAdmin();
  await signOutAdmin();
  redirect("/admin/login");
}

/* ── Households ───────────────────────────────────────────────────────────── */

const householdSchema = z.object({
  name: z.string().trim().min(1, "Give the household a name.").max(120, "Keep the name under 120 characters."),
  email: z
    .string()
    .trim()
    .max(200)
    .refine((s) => s === "" || z.email().safeParse(s).success, "That email doesn’t look right.")
    .transform((s) => (s === "" ? null : s)),
  notes: optText(1000),
  plusOneAllowed: z.boolean(),
  guests: z
    .array(
      z.object({
        id: z.union([idSchema, z.literal("")]).transform((s) => (s === "" ? undefined : s)),
        firstName: z.string().trim().max(80),
        lastName: z.string().trim().max(80),
      }),
    )
    .max(20, "At most 20 guests per household.")
    .transform((list) => list.filter((g) => g.firstName || g.lastName))
    .refine((list) => list.length > 0, "Add at least one guest.")
    .refine((list) => list.every((g) => g.firstName), "Every guest needs a first name."),
});

export async function saveHouseholdAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const idRaw = str(fd, "id");
  const id = idRaw ? idSchema.safeParse(idRaw) : null;
  if (id && !id.success) return { error: "Unknown household." };

  const ids = strs(fd, "guestId");
  const firsts = strs(fd, "firstName");
  const lasts = strs(fd, "lastName");
  const parsed = householdSchema.safeParse({
    name: str(fd, "name"),
    email: str(fd, "email"),
    notes: str(fd, "notes"),
    plusOneAllowed: fd.get("plusOneAllowed") === "on",
    guests: firsts.map((f, i) => ({ id: ids[i] ?? "", firstName: f, lastName: lasts[i] ?? "" })),
  });
  if (!parsed.success) return { error: "Please check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };

  const input: HouseholdInput = parsed.data;
  let householdId: string;
  try {
    if (id?.success) {
      const existing = await repo.getHousehold(id.data);
      if (!existing) return { error: "That household no longer exists." };
      // Only keep guest ids that really belong to this household.
      const own = new Set(existing.guests.map((g) => g.id));
      input.guests = input.guests.map((g) => (g.id && own.has(g.id) ? g : { ...g, id: undefined }));
      await repo.updateHousehold(id.data, input);
      householdId = id.data;
    } else {
      householdId = (await repo.createHousehold(input)).id;
    }
  } catch (e) {
    console.error("[admin] save household", e);
    return { error: "Something went wrong saving the household. Please try again." };
  }
  refreshAll();
  redirect(`/admin/guests/${householdId}?saved=${id ? "household" : "created"}`);
}

export async function deleteHouseholdAction(fd: FormData) {
  await requireAdmin();
  const id = idSchema.safeParse(str(fd, "id"));
  if (!id.success) redirect("/admin/guests");
  await repo.deleteHousehold(id.data);
  refreshAll();
  redirect("/admin/guests?deleted=1");
}

/* ── Manual RSVP ──────────────────────────────────────────────────────────── */

const rsvpSchema = z.object({
  guests: z.array(
    z.object({
      id: idSchema,
      attending: z.enum(["yes", "no"], { error: "Choose attending or not." }),
      meal: optText(80),
      dietary: optText(300),
    }),
  ),
  plusOne: z.object({ firstName: optText(80), lastName: optText(80), meal: optText(80), dietary: optText(300) }),
  songRequest: optText(300),
  message: optText(2000),
});

export async function saveRsvpAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.safeParse(str(fd, "id"));
  if (!id.success) return { error: "Unknown household." };
  const h = await repo.getHousehold(id.data);
  if (!h) return { error: "That household no longer exists." };
  const settings = await getSettings();

  // Iterate the household’s own guests (from the database), not ids sent by the browser.
  const named = h.guests.filter((g) => !g.isPlusOne);
  const parsed = rsvpSchema.safeParse({
    guests: named.map((g) => ({ id: g.id, attending: str(fd, `attending.${g.id}`), meal: str(fd, `meal.${g.id}`), dietary: str(fd, `dietary.${g.id}`) })),
    plusOne: { firstName: str(fd, "plusOne.firstName"), lastName: str(fd, "plusOne.lastName"), meal: str(fd, "plusOne.meal"), dietary: str(fd, "plusOne.dietary") },
    songRequest: str(fd, "songRequest"),
    message: str(fd, "message"),
  });
  if (!parsed.success) {
    const fe: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const [scope, idx, field] = issue.path;
      const key = scope === "guests" && typeof idx === "number" ? `${String(field)}.${named[idx]?.id}` : issue.path.join(".");
      if (!fe[key]) fe[key] = issue.message;
    }
    return { error: "Please mark every guest as attending or not.", fieldErrors: fe };
  }

  // Meals must be one of the offered choices (or the value already on file).
  const allowedMeal = (meal: string | null, current: string | null) => (meal && (settings.rsvp.meals.includes(meal) || meal === current) ? meal : null);
  const v = parsed.data;
  const prevPlusOne = h.guests.find((g) => g.isPlusOne) ?? null;
  const plusOneName = v.plusOne.firstName;
  if (!plusOneName && v.plusOne.lastName) return { error: "The plus-one needs a first name.", fieldErrors: { "plusOne.firstName": "Add a first name." } };

  const sub: RsvpSubmission = {
    householdId: h.id,
    guests: v.guests.map((g) => {
      const cur = named.find((n) => n.id === g.id)!;
      const yes = g.attending === "yes";
      return { id: g.id, attending: yes, meal: yes ? allowedMeal(g.meal, cur.meal) : null, dietary: yes ? g.dietary : null };
    }),
    plusOne:
      h.plusOneAllowed && plusOneName
        ? { firstName: plusOneName, lastName: v.plusOne.lastName ?? "", meal: allowedMeal(v.plusOne.meal, prevPlusOne?.meal ?? null), dietary: v.plusOne.dietary }
        : null,
    songRequest: v.songRequest,
    message: v.message,
  };
  try {
    // Admins may record replies regardless of the RSVP deadline.
    await repo.submitRsvp(sub);
  } catch (e) {
    console.error("[admin] save rsvp", e);
    return { error: "Something went wrong saving the reply. Please try again." };
  }
  refreshAll();
  redirect(`/admin/guests/${h.id}?saved=rsvp#reply`);
}

export async function clearRsvpAction(fd: FormData) {
  await requireAdmin();
  const id = idSchema.safeParse(str(fd, "id"));
  if (!id.success) redirect("/admin/guests");
  await repo.clearRsvp(id.data);
  refreshAll();
  redirect(`/admin/guests/${id.data}?saved=cleared`);
}

/* ── CSV import ───────────────────────────────────────────────────────────── */

export interface ImportState {
  csv: string;
  result: ImportResult | null;
  error?: string;
}

const csvSchema = z.string().max(500_000, "That file is too large (500 KB max). Split it into smaller files.");

export async function previewImportAction(_prev: ImportState, fd: FormData): Promise<ImportState> {
  await requireAdmin();
  const parsed = csvSchema.safeParse(str(fd, "csv"));
  if (!parsed.success) return { csv: "", result: null, error: parsed.error.issues[0].message };
  if (!parsed.data.trim()) return { csv: "", result: null, error: "Paste your guest list or choose a CSV file first." };
  const existing = (await repo.listHouseholds()).map((h) => h.name);
  return { csv: parsed.data, result: parseGuestImport(parsed.data, existing) };
}

export async function confirmImportAction(_prev: ImportState, fd: FormData): Promise<ImportState> {
  await requireAdmin();
  const parsed = csvSchema.safeParse(str(fd, "csv"));
  if (!parsed.success) return { csv: "", result: null, error: parsed.error.issues[0].message };
  const existing = (await repo.listHouseholds()).map((h) => h.name);
  const result = parseGuestImport(parsed.data, existing);
  if (result.errors.length) return { csv: parsed.data, result, error: "Please fix the problems below before importing." };

  let created = 0;
  try {
    for (const h of result.households) {
      if (h.duplicate) continue;
      await repo.createHousehold({ name: h.name, plusOneAllowed: h.plusOneAllowed, email: h.email, notes: h.notes, guests: h.guests });
      created++;
    }
  } catch (e) {
    console.error("[admin] import", e);
    refreshAll();
    return { csv: parsed.data, result, error: `Import stopped after ${created} household${created === 1 ? "" : "s"}. Re-run the preview — households already added will be skipped.` };
  }
  refreshAll();
  redirect(`/admin/guests?imported=${created}`);
}

/* ── Settings ─────────────────────────────────────────────────────────────── */

export interface SettingsState extends ActionState {
  placeholders?: string[];
}

export async function saveSettingsAction(_prev: SettingsState, fd: FormData): Promise<SettingsState> {
  await requireAdmin();
  const current = await getSettings();
  const parsed = settingsSchema.safeParse(settingsFromForm(fd, current));
  if (!parsed.success) return { error: "Please check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };

  const overrides = pruneDefaults(toOverrides(parsed.data, current), defaultSettings);
  try {
    await repo.saveSettingsOverrides(overrides);
  } catch (e) {
    console.error("[admin] save settings", e);
    return { error: "Something went wrong saving settings. Please try again." };
  }
  revalidatePath("/");
  refreshAll();
  return { ok: true, message: "Settings saved — the website is updated.", placeholders: placeholderFields(await getSettings()) };
}
