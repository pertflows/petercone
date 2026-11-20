import type { Household } from "./db/types";

/**
 * The only shape of a household ever sent to a guest's browser. It contains
 * just their own invitation — never other households, notes or emails.
 */
export interface PublicInvitation {
  token: string;
  name: string;
  plusOneAllowed: boolean;
  guests: { id: string; firstName: string; lastName: string; attending: boolean | null; meal: string | null; dietary: string | null }[];
  plusOne: { firstName: string; lastName: string; meal: string | null; dietary: string | null } | null;
  reply: { status: string; songRequest: string | null; message: string | null; updatedAt: string } | null;
}

export function toPublicInvitation(h: Household): PublicInvitation {
  const p = h.guests.find((g) => g.isPlusOne);
  return {
    token: h.token,
    name: h.name,
    plusOneAllowed: h.plusOneAllowed,
    guests: h.guests
      .filter((g) => !g.isPlusOne)
      .map((g) => ({ id: g.id, firstName: g.firstName, lastName: g.lastName, attending: g.attending, meal: g.meal, dietary: g.dietary })),
    plusOne: p ? { firstName: p.firstName, lastName: p.lastName, meal: p.meal, dietary: p.dietary } : null,
    reply: h.rsvp ? { status: h.rsvp.status, songRequest: h.rsvp.songRequest, message: h.rsvp.message, updatedAt: h.rsvp.updatedAt } : null,
  };
}

/** “Emily”, “Emily & Joe”, “Ann, Bob & Cy” */
export function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
}
