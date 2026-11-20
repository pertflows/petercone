# Emily & Joe · 08.27.27

The wedding invitation and RSVP site for **Emily Peter & Joe Perticone**, Friday, August 27, 2027.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Motion, and Supabase, and deployed on Vercel.

## What's here

| Route | What it is |
| --- | --- |
| `/` | The invitation. It opens with a wax-sealed envelope, then shows the hero, a letter to guests, details with a countdown, the order of the day, the gallery, the RSVP card, FAQs and the footer. |
| `/i/<token>` | A guest's personal link. It greets the household by name and pre-fills the reply card with only their invitation. |
| `/calendar.ics` | An Add to Calendar file, generated from the current settings. |
| `/admin` | The couple's private Guest Book: a dashboard, households, CSV import and export, manual RSVP edits and site settings. |

Visitors see the envelope once per browser session. Add `?skip-intro` to any URL to bypass it.

## Editing wedding details

Everything guests see comes from **`lib/wedding.config.ts`**. Any value set to `null` is an unconfirmed placeholder. The site shows "Details to follow" there and never makes anything up.

You can also change things **without a redeploy**: **/admin → Details** covers venues, times, dress code, the deadline and meals, and **/admin → Words** covers every line of wording (your names, the letter, headings, the order of the day, FAQs and the thank-you messages). Saved changes override the config file, and each field has a “Restore original”.

Still to confirm: venue names and addresses, ceremony and reception times, the timezone, dress code, directions, the RSVP deadline, meal options, timeline times, and the FAQ answers (accommodations, transportation, parking, children, registry).

Photos are in `public/photos/`, and the gallery order is set in `photos` in the config.

## Local development

```bash
npm install
node scripts/seed-local.mjs   # optional: demo households (prints their codes & links)
npm run dev
```

Without Supabase environment variables, data is stored in `.data/db.json`, which is git-ignored. The admin password is `perticone`, or `ADMIN_PASSWORD` if you set it. This fallback is refused when the site runs in Vercel production.

## Going live (Supabase + Vercel)

1. Create a Supabase project. In the SQL editor, run `supabase/migrations/20261120000000_wedding_schema.sql`.
2. Add the couple's emails as admins:
   ```sql
   insert into public.admin_users (email) values ('emily@…'), ('joe@…');
   ```
3. In **Authentication → Users**, create users with those emails and passwords. Turn off public sign-ups.
4. In Vercel, import the repo and set the variables from `.env.example`. `SUPABASE_SERVICE_ROLE_KEY` and `SESSION_SECRET` must stay server-only.
5. Deploy. Then sign in at `/admin`, import the guest list (**Import** includes a CSV template), and send each household its personal link from **Export invitation links**.

## Security model

- **Row-level security is on for every table, and anonymous users have no policies.** The public Supabase key can't read anything.
- **Guests never query the database.** Server actions check the invitation token, code or exact full name, then read only that household with the service-role key, which stays on the server (`server-only`).
- **Personal links use 192-bit random tokens.** They're marked `noindex`, `no-store` and `no-referrer`.
- **RSVP submissions are validated on the server with zod.** Guest IDs must belong to the token's household, plus-ones are only accepted when allowed, meals must be one of the offered choices, and the deadline is enforced. There's also a honeypot field and per-IP rate limits on lookups and submissions.
- **Each household has at most one reply.** The primary key is on `household_id`, and `submit_rsvp()` is a single transaction. Guests can update their reply until the deadline.
- **Admin access needs Supabase Auth plus an `admin_users` / `ADMIN_EMAILS` entry.** Every admin page, server action and export route checks this on the server. CSV exports are protected against formula injection.

## Design notes

- **Palette:** Cashmere `#D2B29A`, Secret Safari `#C4B967`, Spanish Bistre `#847334`, Violet Kiss `#EEA1D7` and Chaotic Roses `#BB2968`, on olive, ivory, parchment, antique gold and espresso.
- **Type:** Bodoni Moda for editorial display, Pinyon Script for calligraphy (decorative only), and Cormorant Garamond for body text.
- **Hand-made vector artwork:** the E & J monogram (`lib/monogram-paths.ts`, glyph outlines from Great Vibes, Pinyon Script and Bodoni Moda Italic), the wax seal, the gilt oval frame, the lace border tiles, flamed tulips, olive sprigs, lily of the valley, a butterfly and the pen-and-ink program vignettes.
- **Motion respects `prefers-reduced-motion`.**
