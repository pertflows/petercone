import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "node:crypto";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { storageAvailable, supabaseConfigured } from "./db";

/**
 * Admin authentication.
 *
 * • Production (Supabase configured): Supabase Auth email + password. The user
 *   must ALSO be listed in public.admin_users (or in the ADMIN_EMAILS env var).
 * • Local development without Supabase: a single ADMIN_PASSWORD, stored as an
 *   HMAC-signed, httpOnly cookie.
 */

export interface AdminSession {
  email: string;
}

const LOCAL_COOKIE = "pc_admin";
const SESSION_HOURS = 12;

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET (32+ chars) is required in production");
  return "dev-only-secret-dev-only-secret-dev-only";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  return A.length === B.length && timingSafeEqual(A, B);
}

export async function supabaseAuthClient() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          /* called from a Server Component — the proxy refreshes sessions */
        }
      },
    },
  });
}

async function isAllowedAdmin(email: string): Promise<boolean> {
  const env = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (env.includes(email.toLowerCase())) return true;
  const svc = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  const { data } = await svc.from("admin_users").select("email").ilike("email", email).maybeSingle();
  return Boolean(data);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  if (supabaseConfigured) {
    const sb = await supabaseAuthClient();
    const { data } = await sb.auth.getUser();
    const email = data.user?.email;
    if (!email || !(await isAllowedAdmin(email))) return null;
    return { email };
  }
  const raw = (await cookies()).get(LOCAL_COOKIE)?.value;
  if (!raw) return null;
  const [exp, sig] = raw.split(".");
  if (!exp || !sig || !safeEqual(sig, sign(`admin:${exp}`)) || Number(exp) < Date.now()) return null;
  return { email: "admin@local" };
}

/** Use at the top of every admin page and admin server action. */
export async function requireAdmin(): Promise<AdminSession> {
  const s = await getAdminSession();
  if (!s) redirect("/admin/login");
  return s;
}

export async function signInAdmin(email: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!storageAvailable) return { ok: false, error: "The guest list isn’t connected yet — set up Supabase to open the Guest Book (see README)." };
  if (supabaseConfigured) {
    const sb = await supabaseAuthClient();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error || !data.user?.email) return { ok: false, error: "Those details don’t match our records." };
    if (!(await isAllowedAdmin(data.user.email))) {
      await sb.auth.signOut();
      return { ok: false, error: "This account isn’t authorised for the guest list." };
    }
    return { ok: true };
  }
  const expected = process.env.ADMIN_PASSWORD ?? (process.env.NODE_ENV === "production" ? "" : "perticone");
  if (!expected || !safeEqual(password, expected)) return { ok: false, error: "That password isn’t right." };
  const exp = String(Date.now() + SESSION_HOURS * 3600_000);
  (await cookies()).set(LOCAL_COOKIE, `${exp}.${sign(`admin:${exp}`)}`, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_HOURS * 3600,
  });
  return { ok: true };
}

export async function signOutAdmin() {
  if (supabaseConfigured) await (await supabaseAuthClient()).auth.signOut();
  (await cookies()).delete(LOCAL_COOKIE);
}
