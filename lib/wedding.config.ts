/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE PERTICONE WEDDING — central configuration
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Everything guests see is driven from this file. Anything set to `null` is a
 *  placeholder: the site shows a graceful “details to follow” note in its place
 *  instead of inventing information. Replace each `null` once it is confirmed.
 *
 *  Most of these values can also be overridden later — without a redeploy —
 *  from the admin portal (/admin → Settings). Saved settings win over this file.
 */

export type TimelineIcon = "rings" | "champagne" | "plate" | "cake" | "dancing";

export interface TimelineEvent {
  /** e.g. "4:00 pm". null = time to be announced. */
  time: string | null;
  title: string;
  /** Optional one-line note shown under the title. */
  note: string | null;
  icon: TimelineIcon;
}

export interface FaqItem {
  key: string;
  question: string;
  /** null = placeholder (“Details to follow”). */
  answer: string | null;
}

export interface Photo {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Render in black & white for the editorial mix. */
  mono?: boolean;
  /** CSS object-position for art-directed cropping. */
  focus?: string;
}

export interface WeddingSettings {
  couple: {
    brideFirst: string;
    brideFull: string;
    groomFirst: string;
    groomFull: string;
    primary: string; // “Emily & Joe”
    formal: string; // “Emily Peter & Joe Perticone”
    surname: string; // “Perticone”
    houseName: string; // “The Perticones”
    futureHouseName: string; // “The Future Perticones”
    monogram: string; // “E & J”
  };
  /** Local wedding date (YYYY-MM-DD). Confirmed. */
  date: string;
  dateLong: string;
  dateNumeric: string;
  /** IANA timezone of the venue — used for the countdown & calendar file. */
  timezone: string;

  ceremony: {
    venueName: string | null;
    address: string | null;
    /** 24h “HH:MM”, used for calendar + countdown. null = TBA. */
    startTime24: string | null;
    /** Human time, e.g. “4:00 in the afternoon”. */
    timeLabel: string | null;
  };
  reception: {
    venueName: string | null;
    address: string | null;
    startTime24: string | null;
    timeLabel: string | null;
    /** 24h end time for the calendar entry. */
    endTime24: string | null;
  };
  dressCode: string | null;
  dressCodeNote: string | null;
  /** Free-form directions; a map link is generated from the address. */
  directions: string | null;

  timeline: TimelineEvent[];

  rsvp: {
    /** ISO date (YYYY-MM-DD) — after this date guests can no longer change replies. null = no deadline yet. */
    deadline: string | null;
    /** Meal choices offered on the reply card. Empty array hides meal selection. */
    meals: string[];
    /** Let guests find their invitation by first + last name (in addition to their private link / code). */
    allowNameLookup: boolean;
    /** Ask for song requests on the reply card. */
    askSongs: boolean;
  };

  letter: string[];

  faqs: FaqItem[];

  /** Every other line of wording on the site — editable in /admin → Words. */
  copy: SiteCopy;
}

export interface SiteCopy {
  envelopeEyebrow: string;
  envelopeGreeting: string;
  envelopePrompt: string;
  heroEyebrow: string;
  heroTagline: string;
  heroDate: string;
  heroCtaLabel: string;
  heroCtaSub: string;
  detailsEyebrow: string;
  detailsTitle: string;
  countdownCaption: string;
  programTitle: string;
  programSubtitle: string;
  galleryEyebrow: string;
  galleryTitle: string;
  galleryScript: string;
  galleryCaption1: string;
  galleryCaption2: string;
  rsvpEyebrow: string;
  rsvpTitle: string;
  thanksTitle: string;
  thanksBody: string;
  declineTitle: string;
  declineBody: string;
  signoff: string;
  faqEyebrow: string;
  faqTitle: string;
  faqScript: string;
  footerScript: string;
  footerLine: string;
}

export const defaultCopy: SiteCopy = {
  envelopeEyebrow: "You are cordially invited",
  envelopeGreeting: "To our dearest family & friends",
  envelopePrompt: "Kindly open",
  heroEyebrow: "Together with their families",
  heroTagline: "are getting married!",
  heroDate: "Friday, August 27, 2027",
  heroCtaLabel: "Kindly reply",
  heroCtaSub: "Respond to our invitation",
  detailsEyebrow: "You are invited",
  detailsTitle: "The Details",
  countdownCaption: "until we say “I do”",
  programTitle: "The Order of the Day",
  programSubtitle: "An evening in five small acts.",
  galleryEyebrow: "A few favourites",
  galleryTitle: "Moments",
  galleryScript: "ti amo",
  galleryCaption1: "Positano",
  galleryCaption2: "Amalfi",
  rsvpEyebrow: "Répondez s’il vous plaît",
  rsvpTitle: "Kindly Reply",
  thanksTitle: "Grazie mille",
  thanksBody: "Your reply is safely in our hands. We cannot wait to celebrate with you on Friday, the twenty-seventh of August.",
  declineTitle: "You’ll be missed",
  declineBody: "Thank you for letting us know. We’ll raise a glass to you on the day, and hope to celebrate together soon.",
  signoff: "with love,",
  faqEyebrow: "Good to know",
  faqTitle: "Questions",
  faqScript: "& answers",
  footerScript: "Ci vediamo presto",
  footerLine: "See you soon — with love,",
};

export const defaultSettings: WeddingSettings = {
  couple: {
    brideFirst: "Emily",
    brideFull: "Emily Peter",
    groomFirst: "Joe",
    groomFull: "Joe Perticone",
    primary: "Emily & Joe",
    formal: "Emily Peter & Joe Perticone",
    surname: "Perticone",
    houseName: "The Perticones",
    futureHouseName: "The Future Perticones",
    monogram: "E & J",
  },
  date: "2027-08-27",
  dateLong: "Friday, the twenty-seventh of August, two thousand twenty-seven",
  dateNumeric: "08.27.27",
  timezone: "America/New_York", // PLACEHOLDER — set to the venue’s timezone

  ceremony: {
    venueName: null, // PLACEHOLDER
    address: null, // PLACEHOLDER
    startTime24: null, // PLACEHOLDER e.g. "16:00"
    timeLabel: null, // PLACEHOLDER e.g. "Four o’clock in the afternoon"
  },
  reception: {
    venueName: null, // PLACEHOLDER
    address: null, // PLACEHOLDER
    startTime24: null, // PLACEHOLDER
    timeLabel: null, // PLACEHOLDER
    endTime24: null, // PLACEHOLDER
  },
  dressCode: null, // PLACEHOLDER e.g. "Black tie optional"
  dressCodeNote: null,
  directions: null, // PLACEHOLDER

  timeline: [
    { time: null, title: "The Ceremony", note: null, icon: "rings" },
    { time: null, title: "Cocktail Hour", note: null, icon: "champagne" },
    { time: null, title: "Dinner", note: null, icon: "plate" },
    { time: null, title: "Cutting of the Cake", note: null, icon: "cake" },
    { time: null, title: "Dancing", note: null, icon: "dancing" },
  ],

  rsvp: {
    deadline: null, // PLACEHOLDER e.g. "2027-07-15"
    meals: [], // PLACEHOLDER e.g. ["Filet", "Branzino", "Garden risotto"]
    allowNameLookup: true,
    askSongs: true,
  },

  letter: [
    "Dearest friends and family,",
    "Of all the joys we have been given, none compares to the people who have loved us along the way. You are the reason this day already feels so full.",
    "On these pages you will find everything you need — the when, the where, and a little card to tell us you’ll be there. We cannot wait to raise a glass with you, share a long dinner, and dance well past the hour we should.",
    "With all our love and gratitude,",
  ],

  faqs: [
    { key: "dress", question: "What should I wear?", answer: null },
    { key: "accommodations", question: "Where should I stay?", answer: null },
    { key: "transportation", question: "How do I get there?", answer: null },
    { key: "parking", question: "Is there parking?", answer: null },
    { key: "children", question: "Are children welcome?", answer: null },
    { key: "plusones", question: "May I bring a guest?", answer: "Your invitation lists everyone we have the joy of hosting. If a guest is included, you’ll see a place for them on your reply card." },
    { key: "registry", question: "Is there a registry?", answer: null },
    { key: "rsvp", question: "When should I reply by?", answer: null },
  ],

  copy: defaultCopy,
};

/** Photographs of the couple (supplied by them — never generated). */
export const photos = {
  hero: {
    src: "/photos/amalfi-beach-engagement.webp",
    alt: "Emily and Joe on the beach in Amalfi, Emily showing her engagement ring",
    width: 1500,
    height: 2000,
    focus: "50% 55%",
  },
  letter: {
    src: "/photos/amalfi-ring-selfie.webp",
    alt: "Emily holding up her engagement ring beside Joe in Amalfi",
    width: 1500,
    height: 2000,
    focus: "55% 40%",
  },
  gallery: [
    { src: "/photos/amalfi-ring-closeup.webp", alt: "Emily’s hand with her pear-cut engagement ring, Joe smiling behind", width: 2000, height: 1500, focus: "55% 50%" },
    { src: "/photos/osk-babe-and-a-bottle-2018.webp", alt: "Emily and Joe dressed up at a 2018 formal", width: 1500, height: 2000, mono: true, focus: "50% 55%" },
    { src: "/photos/positano-toast.webp", alt: "A champagne toast in front of Positano, ring on Emily’s finger", width: 1500, height: 2000, focus: "55% 60%" },
    { src: "/photos/couch.webp", alt: "Emily and Joe laughing together on a couch", width: 1500, height: 2000, mono: true, focus: "50% 35%" },
    { src: "/photos/amalfi-beach-engagement.webp", alt: "Emily and Joe on the beach in Amalfi", width: 1500, height: 2000, focus: "50% 50%" },
    { src: "/photos/amalfi-ring-selfie.webp", alt: "Emily showing her ring next to Joe on the Amalfi coast", width: 1500, height: 2000, mono: true, focus: "50% 45%" },
  ] satisfies Photo[],
};
