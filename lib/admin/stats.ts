import type { Household, RsvpStatus } from "@/lib/db/types";

export type HouseholdState = RsvpStatus | "awaiting";

export function householdState(h: Household): HouseholdState {
  return h.rsvp ? h.rsvp.status : "awaiting";
}

export const STATE_LABEL: Record<HouseholdState, string> = {
  attending: "Attending",
  declined: "Declined",
  partial: "Partly attending",
  awaiting: "Awaiting reply",
};

export const guestName = (g: { firstName: string; lastName: string }) => `${g.firstName} ${g.lastName}`.trim();

export interface Stats {
  households: number;
  householdsResponded: number;
  invited: number;
  attending: number;
  attendingPlusOnes: number;
  declined: number;
  awaiting: number;
  plusOnesAllowed: number;
  attendancePct: number;
  responsePct: number;
  meals: { meal: string; count: number }[];
  mealUnselected: number;
  dietary: { name: string; household: string; restriction: string }[];
  songs: { household: string; song: string }[];
  messages: { household: string; message: string; at: string }[];
}

const pct = (n: number, d: number) => (d === 0 ? 0 : Math.round((n / d) * 100));

export function computeStats(list: Household[], mealOptions: string[]): Stats {
  let invited = 0;
  let attending = 0;
  let attendingPlusOnes = 0;
  let declined = 0;
  let awaiting = 0;
  let plusOnesAllowed = 0;
  let mealUnselected = 0;
  const meals = new Map<string, number>(mealOptions.map((m) => [m, 0]));
  const dietary: Stats["dietary"] = [];
  const songs: Stats["songs"] = [];
  const messages: Stats["messages"] = [];

  for (const h of list) {
    if (h.plusOneAllowed) plusOnesAllowed++;
    for (const g of h.guests) {
      if (!g.isPlusOne) invited++;
      if (g.attending === true) {
        attending++;
        if (g.isPlusOne) attendingPlusOnes++;
        if (g.meal) meals.set(g.meal, (meals.get(g.meal) ?? 0) + 1);
        else mealUnselected++;
        if (g.dietary?.trim()) dietary.push({ name: guestName(g) + (g.isPlusOne ? " (guest)" : ""), household: h.name, restriction: g.dietary.trim() });
      } else if (g.attending === false && !g.isPlusOne) declined++;
      else if (!g.isPlusOne) awaiting++;
    }
    if (h.rsvp?.songRequest?.trim()) songs.push({ household: h.name, song: h.rsvp.songRequest.trim() });
    if (h.rsvp?.message?.trim()) messages.push({ household: h.name, message: h.rsvp.message.trim(), at: h.rsvp.updatedAt });
  }
  messages.sort((a, b) => b.at.localeCompare(a.at));
  const householdsResponded = list.filter((h) => h.rsvp).length;

  return {
    households: list.length,
    householdsResponded,
    invited,
    attending,
    attendingPlusOnes,
    declined,
    awaiting,
    plusOnesAllowed,
    attendancePct: pct(attending - attendingPlusOnes, invited),
    responsePct: pct(householdsResponded, list.length),
    meals: [...meals].map(([meal, count]) => ({ meal, count })),
    mealUnselected,
    dietary,
    songs,
    messages,
  };
}

export type GuestFilter = "all" | HouseholdState | "plusone";

export function matchesQuery(h: Household, q: string): boolean {
  const n = q.trim().toLowerCase();
  if (!n) return true;
  const hay = [h.name, h.inviteCode, h.email ?? "", ...h.guests.map(guestName)].join(" \u0000 ").toLowerCase();
  return n.split(/\s+/).every((part) => hay.includes(part));
}

export function matchesFilter(h: Household, f: GuestFilter): boolean {
  if (f === "all") return true;
  if (f === "plusone") return h.plusOneAllowed;
  return householdState(h) === f;
}
