import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Guest, Household, HouseholdInput, Repository, RsvpSubmission } from "./types";
import { newInviteCode, newInviteToken, normalizeCode, normalizeName } from "./tokens";
import { statusFor } from "./status";

/**
 * Local JSON-file repository for development and previews when Supabase is not
 * configured. Data lives in ./.data/db.json (git-ignored). Never used in
 * production when SUPABASE env vars are present.
 */

interface Db {
  households: Household[];
  settings: Record<string, unknown>;
}

const FILE = path.join(process.cwd(), ".data", "db.json");
let queue: Promise<unknown> = Promise.resolve();

async function read(): Promise<Db> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Db;
  } catch {
    return { households: [], settings: {} };
  }
}

async function write(db: Db) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = FILE + "." + process.pid + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(db, null, 2));
  await fs.rename(tmp, FILE);
}

/** Serialize read-modify-write cycles. */
function mutate<T>(fn: (db: Db) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const db = await read();
    const result = await fn(db);
    await write(db);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

const clone = <T,>(v: T): T => structuredClone(v);

function buildGuests(householdId: string, input: HouseholdInput, existing: Guest[] = []): Guest[] {
  const named = input.guests.map((g) => {
    const prev = g.id ? existing.find((e) => e.id === g.id) : undefined;
    return {
      id: prev?.id ?? randomUUID(),
      householdId,
      firstName: g.firstName.trim(),
      lastName: g.lastName.trim(),
      isPlusOne: false,
      attending: prev?.attending ?? null,
      meal: prev?.meal ?? null,
      dietary: prev?.dietary ?? null,
    } satisfies Guest;
  });
  const plusOnes = input.plusOneAllowed ? existing.filter((g) => g.isPlusOne) : [];
  return [...named, ...plusOnes];
}

export const localRepository: Repository = {
  kind: "local",

  async findByToken(token) {
    const db = await read();
    return clone(db.households.find((h) => h.token === token) ?? null);
  },

  async findByCode(code) {
    const db = await read();
    const c = normalizeCode(code);
    return clone(db.households.find((h) => h.inviteCode === c) ?? null);
  },

  async findByName(first, last) {
    const db = await read();
    const f = normalizeName(first);
    const l = normalizeName(last);
    return clone(
      db.households.filter((h) =>
        h.guests.some((g) => !g.isPlusOne && normalizeName(g.firstName) === f && normalizeName(g.lastName) === l),
      ),
    );
  },

  submitRsvp(sub: RsvpSubmission) {
    return mutate((db) => {
      const h = db.households.find((x) => x.id === sub.householdId);
      if (!h) throw new Error("Invitation not found");
      const now = new Date().toISOString();
      for (const g of h.guests) {
        if (g.isPlusOne) continue;
        const r = sub.guests.find((x) => x.id === g.id);
        if (!r) continue;
        g.attending = r.attending;
        g.meal = r.attending ? r.meal : null;
        g.dietary = r.attending ? r.dietary : null;
      }
      h.guests = h.guests.filter((g) => !g.isPlusOne);
      if (sub.plusOne && h.plusOneAllowed) {
        h.guests.push({
          id: randomUUID(),
          householdId: h.id,
          firstName: sub.plusOne.firstName,
          lastName: sub.plusOne.lastName,
          isPlusOne: true,
          attending: true,
          meal: sub.plusOne.meal,
          dietary: sub.plusOne.dietary,
        });
      }
      h.rsvp = {
        householdId: h.id,
        status: statusFor(h.guests),
        songRequest: sub.songRequest,
        message: sub.message,
        submittedAt: h.rsvp?.submittedAt ?? now,
        updatedAt: now,
      };
      return clone(h);
    });
  },

  async listHouseholds() {
    const db = await read();
    return clone(db.households).sort((a, b) => a.name.localeCompare(b.name));
  },

  async getHousehold(id) {
    const db = await read();
    return clone(db.households.find((h) => h.id === id) ?? null);
  },

  createHousehold(input) {
    return mutate((db) => {
      const id = randomUUID();
      let code = newInviteCode();
      while (db.households.some((h) => h.inviteCode === code)) code = newInviteCode();
      const h: Household = {
        id,
        name: input.name.trim(),
        inviteCode: code,
        token: newInviteToken(),
        plusOneAllowed: input.plusOneAllowed,
        email: input.email ?? null,
        notes: input.notes ?? null,
        createdAt: new Date().toISOString(),
        guests: buildGuests(id, input),
        rsvp: null,
      };
      db.households.push(h);
      return clone(h);
    });
  },

  updateHousehold(id, input) {
    return mutate((db) => {
      const h = db.households.find((x) => x.id === id);
      if (!h) throw new Error("Household not found");
      h.name = input.name.trim();
      h.plusOneAllowed = input.plusOneAllowed;
      h.email = input.email ?? null;
      h.notes = input.notes ?? null;
      h.guests = buildGuests(id, input, h.guests);
      if (h.rsvp) h.rsvp.status = statusFor(h.guests);
      return clone(h);
    });
  },

  deleteHousehold(id) {
    return mutate((db) => {
      db.households = db.households.filter((h) => h.id !== id);
    });
  },

  clearRsvp(householdId) {
    return mutate((db) => {
      const h = db.households.find((x) => x.id === householdId);
      if (!h) return;
      h.rsvp = null;
      h.guests = h.guests.filter((g) => !g.isPlusOne).map((g) => ({ ...g, attending: null, meal: null, dietary: null }));
    });
  },

  async getSettingsOverrides() {
    return (await read()).settings ?? {};
  },

  saveSettingsOverrides(data) {
    return mutate((db) => {
      db.settings = data;
    });
  },
};
