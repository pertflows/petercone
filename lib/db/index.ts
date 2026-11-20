import "server-only";
import type { Repository } from "./types";
import { localRepository } from "./local";
import { supabaseRepository } from "./supabase";

export const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

if (!supabaseConfigured && process.env.VERCEL_ENV === "production") {
  throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
}

export const repo: Repository = supabaseConfigured ? supabaseRepository : localRepository;

export * from "./types";
