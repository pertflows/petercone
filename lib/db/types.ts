export type RsvpStatus = "attending" | "declined" | "partial";

export interface Guest {
  id: string;
  householdId: string;
  firstName: string;
  lastName: string;
  isPlusOne: boolean;
  /** null = no reply yet */
  attending: boolean | null;
  meal: string | null;
  dietary: string | null;
}

export interface RsvpRecord {
  householdId: string;
  status: RsvpStatus;
  songRequest: string | null;
  message: string | null;
  submittedAt: string;
  updatedAt: string;
}

export interface Household {
  id: string;
  /** e.g. “The Rossi Family” — shown on the reply card. */
  name: string;
  /** Short human-friendly code printed on paper invitations, e.g. “OLIVE-4821”. */
  inviteCode: string;
  /** Long unguessable token used in personal links: /i/<token>. */
  token: string;
  plusOneAllowed: boolean;
  email: string | null;
  notes: string | null;
  createdAt: string;
  guests: Guest[];
  rsvp: RsvpRecord | null;
}

export interface GuestInput {
  id?: string;
  firstName: string;
  lastName: string;
}

export interface HouseholdInput {
  name: string;
  plusOneAllowed: boolean;
  email?: string | null;
  notes?: string | null;
  guests: GuestInput[];
}

export interface RsvpSubmission {
  householdId: string;
  guests: { id: string; attending: boolean; meal: string | null; dietary: string | null }[];
  plusOne: { firstName: string; lastName: string; meal: string | null; dietary: string | null } | null;
  songRequest: string | null;
  message: string | null;
}

export interface Repository {
  kind: "supabase" | "local";
  // guest-facing (always called server-side)
  findByToken(token: string): Promise<Household | null>;
  findByCode(code: string): Promise<Household | null>;
  findByName(firstName: string, lastName: string): Promise<Household[]>;
  submitRsvp(sub: RsvpSubmission): Promise<Household>;
  // admin
  listHouseholds(): Promise<Household[]>;
  getHousehold(id: string): Promise<Household | null>;
  createHousehold(input: HouseholdInput): Promise<Household>;
  updateHousehold(id: string, input: HouseholdInput): Promise<Household>;
  deleteHousehold(id: string): Promise<void>;
  clearRsvp(householdId: string): Promise<void>;
  getSettingsOverrides(): Promise<Record<string, unknown>>;
  saveSettingsOverrides(data: Record<string, unknown>): Promise<void>;
}
