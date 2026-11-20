import { randomBytes, randomInt } from "node:crypto";

/** 32 bytes of randomness, URL-safe — used in personal invitation links. */
export function newInviteToken(): string {
  return randomBytes(24).toString("base64url");
}

const WORDS = ["OLIVE", "ROSE", "LACE", "IVORY", "TULIP", "AMALFI", "VELVET", "GILT", "PEARL", "LINEN", "CAMEO", "BISTRE"];

/** Human-friendly code for paper invitations, e.g. “TULIP-4821”. */
export function newInviteCode(): string {
  return `${WORDS[randomInt(WORDS.length)]}-${randomInt(1000, 10000)}`;
}

export function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "").replace(/^([A-Z]+)(\d+)$/, "$1-$2");
}

export function normalizeName(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}
