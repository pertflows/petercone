import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { supabaseConfigured } from "@/lib/db";
import { Monogram } from "../_components/monogram";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getAdminSession()) redirect("/admin");
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="adm-panel paper-parchment flex flex-col items-center gap-5 px-6 py-10 text-center md:px-10">
          <Monogram className="h-20 w-20 text-olive-deep" />
          <div>
            <p className="adm-label">Emily &amp; Joe</p>
            <h1>The Guest Book</h1>
          </div>
          <hr className="adm-rule w-24" />
          <p className="adm-muted">Private — for the couple only.</p>
          <LoginForm showEmail={supabaseConfigured} />
        </div>
      </div>
    </main>
  );
}
