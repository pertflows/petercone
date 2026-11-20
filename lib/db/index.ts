import "server-only";
import type { Repository } from "./types";
import { localRepository } from "./local";
import { supabaseRepository } from "./supabase";

export const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

/**
 * Where guest data lives:
 *  • Supabase when configured (production).
 *  • A local JSON file during development.
 *  • Nowhere on a hosted deploy without Supabase (Vercel's filesystem is read-only):
 *    the invitation site still works, and the reply card says RSVPs open soon.
 */
const hosted = Boolean(process.env.VERCEL);
export const storageAvailable = supabaseConfigured || !hosted;

const offline = (): never => {
  throw new Error("RSVP storage is not connected yet. Configure Supabase (see README).");
};

const disabledRepository: Repository = {
  kind: "local",
  findByToken: async () => null,
  findByCode: async () => null,
  findByName: async () => [],
  submitRsvp: offline,
  listHouseholds: async () => [],
  getHousehold: async () => null,
  createHousehold: offline,
  updateHousehold: offline,
  deleteHousehold: offline,
  clearRsvp: offline,
  getSettingsOverrides: async () => ({}),
  saveSettingsOverrides: offline,
};

export const repo: Repository = supabaseConfigured ? supabaseRepository : storageAvailable ? localRepository : disabledRepository;

export * from "./types";
