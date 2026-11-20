import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { supabaseConfigured } from "@/lib/db";
import { signOutAction } from "../actions";
import { AdminNav } from "../_components/nav";
import { Monogram } from "../_components/monogram";
import { SubmitButton } from "../_components/submit-button";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return (
    <>
      <header className="border-b border-[var(--rule)] bg-ivory/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 pt-4 md:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link href="/admin" className="flex min-h-11 items-center gap-3 no-underline" aria-label="Guest Book overview">
              <Monogram className="h-11 w-11 text-olive-deep" />
              <span className="flex flex-col leading-tight">
                <span className="font-display text-xl text-olive-deep">The Guest Book</span>
                <span className="adm-label text-base">Emily &amp; Joe · 08.27.27</span>
              </span>
            </Link>
            <form action={signOutAction} className="flex items-center gap-3">
              <span className="adm-muted hidden text-base sm:inline adm-break">{session.email}</span>
              <SubmitButton className="btn btn-ghost btn-sm" pendingLabel="Signing out…">
                Sign out
              </SubmitButton>
            </form>
          </div>
          <AdminNav />
        </div>
      </header>
      {!supabaseConfigured && (
        <p className="border-b border-[var(--hair)] bg-parchment px-4 py-1 text-center text-base adm-muted">
          Local preview mode — data is stored in <span className="adm-code">.data/db.json</span>
        </p>
      )}
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 md:px-8 md:py-10">{children}</main>
      <footer className="mx-auto max-w-6xl px-4 pb-10 md:px-8">
        <hr className="adm-rule-double" />
        <p className="adm-label mt-3 text-center text-base">The Perticones · Private</p>
      </footer>
    </>
  );
}
