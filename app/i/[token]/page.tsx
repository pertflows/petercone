import type { Metadata } from "next";
import { repo } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { toPublicInvitation } from "@/lib/invitation";
import { Site } from "@/components/Site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

/** Personal invitation link: /i/<unguessable token>. Pre-fills the household on the reply card. */
export default async function PersonalInvitation({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const s = await getSettings();
  const valid = /^[A-Za-z0-9_-]{24,200}$/.test(token);
  const h = valid ? await repo.findByToken(token) : null;
  // An unknown token simply shows the public invitation — it reveals nothing.
  return <Site s={s} invitation={h ? toPublicInvitation(h) : null} />;
}
