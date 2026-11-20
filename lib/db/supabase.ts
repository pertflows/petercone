import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Guest, Household, HouseholdInput, Repository, RsvpRecord } from "./types";
import { newInviteCode, newInviteToken, normalizeCode, normalizeName } from "./tokens";
import { statusFor } from "./status";

/**
 * Supabase repository. Uses the SERVICE ROLE key, so it must only ever be
 * imported from server code (enforced by `server-only`). Every caller is
 * responsible for authorisation (token check for guests, admin session for admin).
 */

let client: SupabaseClient | null = null;
function db(): SupabaseClient {
  if (!client) {
    client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

const SELECT = "*, guests(*), rsvps(*)";

/* eslint-disable @typescript-eslint/no-explicit-any */
function toHousehold(row: any): Household {
  const guests: Guest[] = ((row.guests ?? []) as any[])
    .sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at))
    .map((g) => ({
      id: g.id,
      householdId: g.household_id,
      firstName: g.first_name,
      lastName: g.last_name,
      isPlusOne: g.is_plus_one,
      attending: g.attending,
      meal: g.meal,
      dietary: g.dietary,
    }));
  const r = Array.isArray(row.rsvps) ? row.rsvps[0] : row.rsvps;
  const rsvp: RsvpRecord | null = r
    ? { householdId: r.household_id, status: r.status, songRequest: r.song_request, message: r.message, submittedAt: r.submitted_at, updatedAt: r.updated_at }
    : null;
  return {
    id: row.id,
    name: row.name,
    inviteCode: row.invite_code,
    token: row.token,
    plusOneAllowed: row.plus_one_allowed,
    email: row.email,
    notes: row.notes,
    createdAt: row.created_at,
    guests,
    rsvp,
  };
}

function check<T>(res: { data: T; error: any }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

async function one(column: string, value: string): Promise<Household | null> {
  const row = check(await db().from("households").select(SELECT).eq(column, value).maybeSingle());
  return row ? toHousehold(row) : null;
}

async function syncGuests(householdId: string, input: HouseholdInput) {
  const existing = check(await db().from("guests").select("id").eq("household_id", householdId).eq("is_plus_one", false)) as { id: string }[];
  const keep = new Set(input.guests.filter((g) => g.id).map((g) => g.id!));
  const remove = existing.filter((e) => !keep.has(e.id)).map((e) => e.id);
  if (remove.length) check(await db().from("guests").delete().in("id", remove));
  for (const [i, g] of input.guests.entries()) {
    const row = { household_id: householdId, first_name: g.firstName.trim(), last_name: g.lastName.trim(), sort_order: i };
    if (g.id && existing.some((e) => e.id === g.id)) check(await db().from("guests").update(row).eq("id", g.id));
    else check(await db().from("guests").insert(row));
  }
  if (!input.plusOneAllowed) check(await db().from("guests").delete().eq("household_id", householdId).eq("is_plus_one", true));
}

async function refreshStatus(householdId: string) {
  const h = await one("id", householdId);
  if (h?.rsvp) check(await db().from("rsvps").update({ status: statusFor(h.guests) }).eq("household_id", householdId));
}

export const supabaseRepository: Repository = {
  kind: "supabase",

  findByToken: (token) => one("token", token),
  findByCode: (code) => one("invite_code", normalizeCode(code)),

  async findByName(first, last) {
    const f = normalizeName(first);
    const l = normalizeName(last);
    if (!f || !l) return [];
    // Narrow with a case-insensitive prefix match, then compare normalised names exactly.
    const rows = check(
      await db().from("guests").select("household_id, first_name, last_name").eq("is_plus_one", false).ilike("first_name", `${first.trim().slice(0, 1)}%`),
    ) as { household_id: string; first_name: string; last_name: string }[];
    const ids = [...new Set(rows.filter((r) => normalizeName(r.first_name) === f && normalizeName(r.last_name) === l).map((r) => r.household_id))];
    if (!ids.length) return [];
    return (check(await db().from("households").select(SELECT).in("id", ids)) as any[]).map(toHousehold);
  },

  async submitRsvp(sub) {
    check(await db().rpc("submit_rsvp", { payload: sub }));
    const h = await one("id", sub.householdId);
    if (!h) throw new Error("Invitation not found");
    return h;
  },

  async listHouseholds() {
    return (check(await db().from("households").select(SELECT).order("name")) as any[]).map(toHousehold);
  },

  getHousehold: (id) => one("id", id),

  async createHousehold(input) {
    let row: any = null;
    for (let attempt = 0; attempt < 5 && !row; attempt++) {
      const res = await db()
        .from("households")
        .insert({ name: input.name.trim(), invite_code: newInviteCode(), token: newInviteToken(), plus_one_allowed: input.plusOneAllowed, email: input.email ?? null, notes: input.notes ?? null })
        .select("id")
        .single();
      if (res.error && res.error.code !== "23505") throw new Error(res.error.message);
      row = res.data;
    }
    if (!row) throw new Error("Could not allocate an invitation code");
    await syncGuests(row.id, input);
    return (await one("id", row.id))!;
  },

  async updateHousehold(id, input) {
    check(await db().from("households").update({ name: input.name.trim(), plus_one_allowed: input.plusOneAllowed, email: input.email ?? null, notes: input.notes ?? null }).eq("id", id));
    await syncGuests(id, input);
    await refreshStatus(id);
    return (await one("id", id))!;
  },

  async deleteHousehold(id) {
    check(await db().from("households").delete().eq("id", id));
  },

  async clearRsvp(householdId) {
    check(await db().from("rsvps").delete().eq("household_id", householdId));
    check(await db().from("guests").delete().eq("household_id", householdId).eq("is_plus_one", true));
    check(await db().from("guests").update({ attending: null, meal: null, dietary: null }).eq("household_id", householdId));
  },

  async getSettingsOverrides() {
    const row = check(await db().from("site_settings").select("data").eq("id", 1).maybeSingle()) as { data: Record<string, unknown> } | null;
    return row?.data ?? {};
  },

  async saveSettingsOverrides(data) {
    check(await db().from("site_settings").upsert({ id: 1, data, updated_at: new Date().toISOString() }));
  },
};
