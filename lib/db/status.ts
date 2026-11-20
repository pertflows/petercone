import type { Guest, RsvpStatus } from "./types";

export function statusFor(guests: Guest[]): RsvpStatus {
  const invited = guests.filter((g) => !g.isPlusOne);
  const yes = invited.filter((g) => g.attending === true).length;
  if (yes === 0) return "declined";
  if (yes === invited.length) return "attending";
  return "partial";
}
