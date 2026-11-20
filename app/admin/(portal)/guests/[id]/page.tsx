import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { repo } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { householdState } from "@/lib/admin/stats";
import { inviteLink, siteOrigin } from "@/lib/admin/origin";
import { clearRsvpAction, deleteHouseholdAction } from "../../../actions";
import { CopyButton } from "../../../_components/copy-button";
import { HouseholdForm } from "../../../_components/household-form";
import { RsvpForm } from "../../../_components/rsvp-form";
import { ConfirmSubmit } from "../../../_components/submit-button";
import { Flash, PageHeader, Status } from "../../../_components/ui";

export const metadata: Metadata = { title: "Household" };

const FLASH: Record<string, string> = {
  created: "Household added. Copy their personal link below to send it.",
  household: "Household saved.",
  rsvp: "Reply saved.",
  cleared: "Reply cleared — they can reply again from their link.",
};

export default async function HouseholdPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [h, settings, origin, sp] = await Promise.all([repo.getHousehold(id), getSettings(), siteOrigin(), searchParams]);
  if (!h) notFound();

  const saved = typeof sp.saved === "string" ? FLASH[sp.saved] : undefined;
  const link = inviteLink(origin, h.token);
  const named = h.guests.filter((g) => !g.isPlusOne);
  const plusOne = h.guests.find((g) => g.isPlusOne) ?? null;
  const replied = h.rsvp ? new Date(h.rsvp.updatedAt).toLocaleString("en-US", { timeZone: settings.timezone, dateStyle: "medium", timeStyle: "short" }) : null;
  const formKey = JSON.stringify([h.rsvp?.updatedAt ?? null, sp.saved ?? null, h.name, h.email, h.notes, h.plusOneAllowed, named.map((g) => [g.id, g.firstName, g.lastName])]);
  const rsvpKey = JSON.stringify([h.rsvp?.updatedAt ?? null, h.guests.map((g) => g.id)]);

  return (
    <>
      <p>
        <Link href="/admin/guests">← All households</Link>
      </p>
      <PageHeader eyebrow="Household" title={h.name}>
        <Status state={householdState(h)} />
      </PageHeader>
      {saved && <Flash>{saved}</Flash>}

      <section aria-label="Invitation" className="adm-panel adm-panel-parchment grid gap-4 md:grid-cols-[auto_1fr] md:items-center md:gap-x-8">
        <div>
          <p className="adm-label">Invite code</p>
          <p className="adm-code text-xl">{h.inviteCode}</p>
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <p className="adm-label">Personal link</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input readOnly value={link} aria-label="Personal invitation link" className="adm-input adm-code min-w-0 flex-1 text-base" />
            <CopyButton value={link} className="btn" />
          </div>
        </div>
      </section>

      <section id="reply" className="adm-panel flex scroll-mt-6 flex-col gap-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2>Reply</h2>
          <p className="adm-muted text-base">{replied ? `Last updated ${replied}` : "No reply yet — record one below if they told you directly."}</p>
        </div>
        <RsvpForm
          key={rsvpKey}
          householdId={h.id}
          guests={named}
          plusOneAllowed={h.plusOneAllowed}
          plusOne={plusOne}
          songRequest={h.rsvp?.songRequest ?? null}
          message={h.rsvp?.message ?? null}
          meals={settings.rsvp.meals}
          askSongs={settings.rsvp.askSongs}
        />
        {h.rsvp && (
          <form action={clearRsvpAction} className="border-t border-[var(--hair)] pt-4">
            <input type="hidden" name="id" value={h.id} />
            <ConfirmSubmit confirm={`Clear the reply for ${h.name}? Their answers, meals, song and message will be removed.`} className="btn btn-danger btn-sm" pendingLabel="Clearing…">
              Clear reply
            </ConfirmSubmit>
          </form>
        )}
      </section>

      <section className="adm-panel flex flex-col gap-5">
        <h2>Household details</h2>
        <HouseholdForm
          key={formKey}
          initial={{
            id: h.id,
            name: h.name,
            email: h.email ?? "",
            notes: h.notes ?? "",
            plusOneAllowed: h.plusOneAllowed,
            plusOneName: plusOne ? `${plusOne.firstName} ${plusOne.lastName}`.trim() : null,
            guests: named.map((g) => ({ id: g.id, firstName: g.firstName, lastName: g.lastName })),
          }}
        />
      </section>

      <section className="flex flex-col gap-3 border border-[color-mix(in_srgb,var(--color-raspberry)_30%,transparent)] p-5">
        <h2 className="!text-raspberry">Delete household</h2>
        <p>This permanently removes {h.name}, every guest in it and their reply. Their personal link will stop working.</p>
        <form action={deleteHouseholdAction}>
          <input type="hidden" name="id" value={h.id} />
          <ConfirmSubmit confirm={`Permanently delete ${h.name} and their reply?`} pendingLabel="Deleting…">
            Delete household
          </ConfirmSubmit>
        </form>
      </section>
    </>
  );
}
