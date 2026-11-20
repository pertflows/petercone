import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { PageHeader } from "../../_components/ui";
import { WordsForm } from "./words-form";

export const metadata: Metadata = { title: "Words" };
export const dynamic = "force-dynamic";

export default async function WordsPage() {
  await requireAdmin();
  const s = await getSettings();
  return (
    <>
      <PageHeader eyebrow="Website" title="Words">
        <a href="/?skip-intro" target="_blank" rel="noreferrer" className="btn btn-ghost">
          View website ↗
        </a>
      </PageHeader>
      <p className="adm-muted -mt-4 max-w-2xl">
        Change any wording on the website. Everything updates as soon as you save. Use “Restore original” to undo a change.
      </p>
      <WordsForm
        initial={{
          couple: { brideFirst: s.couple.brideFirst, groomFirst: s.couple.groomFirst, primary: s.couple.primary, formal: s.couple.formal, futureHouseName: s.couple.futureHouseName },
          letter: { salutation: s.letter[0] ?? "", body: s.letter.slice(1, -1).join("\n\n"), closing: s.letter.length > 1 ? s.letter[s.letter.length - 1] : "" },
          copy: s.copy,
          timeline: s.timeline.map((e) => ({ title: e.title, time: e.time ?? "", note: e.note ?? "", icon: e.icon })),
          faqs: s.faqs.map((f) => ({ key: f.key, question: f.question, answer: f.answer ?? "" })),
        }}
      />
    </>
  );
}
