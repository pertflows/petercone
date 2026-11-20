"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { repo } from "@/lib/db";
import { getSettings, rsvpOpen } from "@/lib/settings";
import { formatDeadline } from "@/lib/format";
import { toPublicInvitation, type PublicInvitation } from "@/lib/invitation";

/* ── tiny best-effort rate limiter (per server instance) ───────────────────── */
const hits = new Map<string, number[]>();
async function limited(bucket: string, max: number, windowMs: number): Promise<boolean> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "local";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) hits.clear();
  return list.length > max;
}

export type LookupResult =
  | { ok: true; invitation: PublicInvitation }
  | { ok: false; error: string; needsCode?: boolean };

const lookupSchema = z.union([
  z.object({ mode: z.literal("code"), code: z.string().trim().min(3).max(40) }),
  z.object({ mode: z.literal("name"), firstName: z.string().trim().min(1).max(100), lastName: z.string().trim().min(1).max(100) }),
]);

export async function lookupInvitation(input: unknown): Promise<LookupResult> {
  if (await limited("lookup", 25, 10 * 60_000)) return { ok: false, error: "Too many attempts — please wait a few minutes and try again." };
  const parsed = lookupSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please fill in the details on your card." };
  const s = await getSettings();
  const v = parsed.data;

  if (v.mode === "code") {
    const h = await repo.findByCode(v.code);
    if (!h) return { ok: false, error: "We couldn’t find that invitation code. Please check your card and try again." };
    return { ok: true, invitation: toPublicInvitation(h) };
  }

  if (!s.rsvp.allowNameLookup) return { ok: false, error: "Please use the code printed on your invitation.", needsCode: true };
  const found = await repo.findByName(v.firstName, v.lastName);
  if (found.length === 1) return { ok: true, invitation: toPublicInvitation(found[0]) };
  if (found.length > 1) return { ok: false, error: "We found more than one invitation under that name. Please use the code printed on your invitation.", needsCode: true };
  return { ok: false, error: "We couldn’t find that name on our guest list. Try the name exactly as it appears on your invitation, or use your invitation code." };
}

const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v.length ? v : null))
    .nullable()
    .optional()
    .transform((v) => v ?? null);

const submitSchema = z.object({
  token: z.string().min(24).max(200),
  guests: z
    .array(z.object({ id: z.string().min(1).max(64), attending: z.boolean(), meal: text(80), dietary: text(500) }))
    .min(1)
    .max(30),
  plusOne: z
    .object({ firstName: z.string().trim().min(1).max(100), lastName: z.string().trim().max(100).default(""), meal: text(80), dietary: text(500) })
    .nullable(),
  songRequest: text(300),
  message: text(2000),
  website: z.string().max(0).optional(), // honeypot
});

export type SubmitResult = { ok: true; invitation: PublicInvitation } | { ok: false; error: string };

export async function submitRsvp(input: unknown): Promise<SubmitResult> {
  if (await limited("submit", 20, 10 * 60_000)) return { ok: false, error: "Too many attempts — please wait a few minutes and try again." };
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Something on the card isn’t quite right — please check each guest has a reply." };
  const v = parsed.data;

  const s = await getSettings();
  if (!rsvpOpen(s)) {
    return { ok: false, error: `Replies closed on ${formatDeadline(s.rsvp.deadline)}. Please reach out to Emily & Joe directly.` };
  }

  // Authorise: the token identifies exactly one household; guests can only answer for themselves.
  const h = await repo.findByToken(v.token);
  if (!h) return { ok: false, error: "This invitation could not be verified. Please use the link or code from your invitation." };
  const invitedIds = new Set(h.guests.filter((g) => !g.isPlusOne).map((g) => g.id));
  if (v.guests.length !== invitedIds.size || v.guests.some((g) => !invitedIds.has(g.id))) {
    return { ok: false, error: "Please reply for each guest named on your invitation." };
  }
  const meals = s.rsvp.meals;
  const badMeal = (m: string | null) => meals.length > 0 && m !== null && !meals.includes(m);
  for (const g of v.guests) {
    if (g.attending && meals.length && !g.meal) return { ok: false, error: "Please choose a dinner selection for each guest attending." };
    if (badMeal(g.meal)) return { ok: false, error: "Please choose a dinner selection from the card." };
  }

  let plusOne = v.plusOne;
  if (plusOne) {
    if (!h.plusOneAllowed) return { ok: false, error: "This invitation doesn’t include an additional guest." };
    if (!v.guests.some((g) => g.attending)) plusOne = null; // a guest can't come on their own
    else if (meals.length && !plusOne.meal) return { ok: false, error: "Please choose a dinner selection for your guest." };
    else if (badMeal(plusOne.meal)) return { ok: false, error: "Please choose a dinner selection from the card." };
  }

  try {
    const updated = await repo.submitRsvp({
      householdId: h.id,
      guests: v.guests.map((g) => ({ id: g.id, attending: g.attending, meal: meals.length ? g.meal : null, dietary: g.dietary })),
      plusOne: plusOne ? { ...plusOne, meal: meals.length ? plusOne.meal : null } : null,
      songRequest: s.rsvp.askSongs ? v.songRequest : null,
      message: v.message,
    });
    return { ok: true, invitation: toPublicInvitation(updated) };
  } catch (e) {
    console.error("[rsvp] submit failed", e);
    return { ok: false, error: "We couldn’t save your reply just now. Please try again in a moment." };
  }
}
