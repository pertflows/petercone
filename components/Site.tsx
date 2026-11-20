import { headers } from "next/headers";
import type { WeddingSettings } from "@/lib/wedding.config";
import { photos } from "@/lib/wedding.config";
import type { PublicInvitation } from "@/lib/invitation";
import { joinNames } from "@/lib/invitation";
import { formatDeadline } from "@/lib/format";
import { rsvpOpen } from "@/lib/settings";
import { storageAvailable } from "@/lib/db";
import { INTRO_BOOT_SCRIPT } from "@/lib/intro";
import { EnvelopeIntro } from "./EnvelopeIntro";
import { FloatingNav } from "./FloatingNav";
import { Hero } from "./sections/Hero";
import { Letter } from "./sections/Letter";
import { Details } from "./sections/Details";
import { Timeline } from "./sections/Timeline";
import { Gallery } from "./sections/Gallery";
import { Rsvp } from "./sections/Rsvp";
import { Faq } from "./sections/Faq";
import { Footer } from "./sections/Footer";

export async function Site({ s, invitation }: { s: WeddingSettings; invitation: PublicInvitation | null }) {
  const h = await headers();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  const greeting = invitation ? joinNames(invitation.guests.map((g) => g.firstName)) : null;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: INTRO_BOOT_SCRIPT }} />
      <EnvelopeIntro addressee={invitation?.name ?? null} houseName={s.couple.futureHouseName} couple={s.couple.primary} copy={{ eyebrow: s.copy.envelopeEyebrow, greeting: s.copy.envelopeGreeting, prompt: s.copy.envelopePrompt }} />
      <FloatingNav />
      <main>
        <Hero s={s} guestName={greeting} />
        <Letter s={s} />
        <Details s={s} siteUrl={siteUrl} />
        <Timeline s={s} />
        <Gallery photos={photos.gallery} copy={{ eyebrow: s.copy.galleryEyebrow, title: s.copy.galleryTitle, script: s.copy.galleryScript, caption1: s.copy.galleryCaption1, caption2: s.copy.galleryCaption2 }} />
        <Rsvp
          initial={invitation}
          meals={s.rsvp.meals}
          askSongs={s.rsvp.askSongs}
          allowNameLookup={s.rsvp.allowNameLookup}
          deadlineLabel={formatDeadline(s.rsvp.deadline)}
          open={rsvpOpen(s)}
          enabled={storageAvailable}
          houseName={s.couple.futureHouseName}
          couple={s.couple.primary}
          copy={{ eyebrow: s.copy.rsvpEyebrow, title: s.copy.rsvpTitle, thanksTitle: s.copy.thanksTitle, thanksBody: s.copy.thanksBody, declineTitle: s.copy.declineTitle, declineBody: s.copy.declineBody, signoff: s.copy.signoff }}
        />
        <Faq s={s} />
      </main>
      <Footer s={s} />
    </>
  );
}
