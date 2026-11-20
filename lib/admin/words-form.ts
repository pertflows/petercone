import { z } from "zod";
import type { SiteCopy, TimelineIcon } from "@/lib/wedding.config";

/* Validation for the admin “Words” page. Isomorphic (no server-only imports). */

export interface CopyField {
  key: keyof SiteCopy;
  label: string;
  help?: string;
  long?: boolean;
  max?: number;
}

/** Every editable line, grouped in the order guests meet it. */
export const COPY_GROUPS: { title: string; note?: string; fields: CopyField[] }[] = [
  {
    title: "The envelope",
    note: "The first thing guests see. Personal links greet the household by name instead of the greeting line.",
    fields: [
      { key: "envelopeEyebrow", label: "Small line above" },
      { key: "envelopeGreeting", label: "Greeting" },
      { key: "envelopePrompt", label: "Button", max: 40 },
    ],
  },
  {
    title: "The invitation",
    fields: [
      { key: "heroEyebrow", label: "Small line above the names" },
      { key: "heroTagline", label: "Script line under the names" },
      { key: "heroDate", label: "Date line" },
      { key: "heroCtaLabel", label: "Reply button — small label", max: 40 },
      { key: "heroCtaSub", label: "Reply button — main text", max: 60 },
    ],
  },
  {
    title: "The details card",
    fields: [
      { key: "detailsEyebrow", label: "Small line above" },
      { key: "detailsTitle", label: "Heading", max: 40 },
      { key: "countdownCaption", label: "Under the countdown" },
    ],
  },
  {
    title: "Order of the day",
    fields: [
      { key: "programTitle", label: "Heading (script)" },
      { key: "programSubtitle", label: "Line under the heading" },
    ],
  },
  {
    title: "Photographs",
    fields: [
      { key: "galleryEyebrow", label: "Small line above" },
      { key: "galleryTitle", label: "Heading", max: 30 },
      { key: "galleryScript", label: "Script beside the heading", max: 40 },
      { key: "galleryCaption1", label: "Caption under the Positano polaroid", max: 40 },
      { key: "galleryCaption2", label: "Caption under the beach polaroid", max: 40 },
    ],
  },
  {
    title: "The reply card",
    fields: [
      { key: "rsvpEyebrow", label: "Small line above" },
      { key: "rsvpTitle", label: "Heading (script)", max: 40 },
      { key: "thanksTitle", label: "Thank-you card heading — attending", max: 60 },
      { key: "thanksBody", label: "Thank-you card message — attending", long: true, max: 400 },
      { key: "declineTitle", label: "Thank-you card heading — declined", max: 60 },
      { key: "declineBody", label: "Thank-you card message — declined", long: true, max: 400 },
      { key: "signoff", label: "Sign-off before your names", help: "e.g. “with love,” — your names are added after it.", max: 40 },
    ],
  },
  {
    title: "Questions & answers",
    fields: [
      { key: "faqEyebrow", label: "Small line above" },
      { key: "faqTitle", label: "Heading", max: 30 },
      { key: "faqScript", label: "Second line of the heading", max: 40 },
    ],
  },
  {
    title: "The closing",
    fields: [
      { key: "footerScript", label: "Script farewell" },
      { key: "footerLine", label: "Line before your names", help: "Your names are added after it." },
    ],
  },
];

export const ICONS: { value: TimelineIcon; label: string }[] = [
  { value: "rings", label: "Rings" },
  { value: "champagne", label: "Champagne" },
  { value: "plate", label: "Dinner plate" },
  { value: "cake", label: "Cake" },
  { value: "dancing", label: "Dancing" },
];

const req = (max: number, what = "This") =>
  z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(1, `${what} can’t be empty.`).max(max, `Keep this under ${max} characters.`));
const opt = (max: number) =>
  z
    .string()
    .max(max, `Keep this under ${max} characters.`)
    .transform((s) => s.trim())
    .transform((s) => (s === "" ? null : s));

const copyShape = Object.fromEntries(
  COPY_GROUPS.flatMap((g) => g.fields).map((f) => [f.key, req(f.max ?? 160)]),
) as Record<keyof SiteCopy, ReturnType<typeof req>>;

export const wordsSchema = z.object({
  couple: z.object({
    brideFirst: req(30, "Bride’s first name"),
    groomFirst: req(30, "Groom’s first name"),
    primary: req(60, "Short names"),
    formal: req(120, "Formal names"),
    futureHouseName: req(60, "Household name"),
  }),
  letter: z.object({
    salutation: req(120, "The greeting"),
    body: req(4000, "The letter"),
    closing: opt(200),
  }),
  copy: z.object(copyShape),
  timeline: z
    .array(
      z.object({
        title: req(60, "Each event title"),
        time: opt(40),
        note: opt(200),
        icon: z.enum(["rings", "champagne", "plate", "cake", "dancing"]),
      }),
    )
    .min(1, "Keep at least one event.")
    .max(12, "At most 12 events."),
  faqs: z
    .array(
      z.object({
        key: z.string().regex(/^[a-z0-9-]{1,40}$/),
        question: req(200, "Each question"),
        answer: opt(2000),
      }),
    )
    .max(20, "At most 20 questions."),
});

export type WordsInput = z.infer<typeof wordsSchema>;

/** Split the letter textarea into paragraphs (blank line = new paragraph). */
export function paragraphs(body: string): string[] {
  return body
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.replace(/\s*\r?\n\s*/g, " ").trim())
    .filter(Boolean);
}
