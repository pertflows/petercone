// Seeds .data/db.json with demo households for LOCAL development only.
// Usage: node scripts/seed-local.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { randomUUID, randomBytes } from "node:crypto";

const now = new Date().toISOString();
const hh = (name, code, guests, plusOneAllowed = false) => {
  const id = randomUUID();
  return {
    id, name, inviteCode: code, token: randomBytes(24).toString("base64url"), plusOneAllowed,
    email: null, notes: "Demo household", createdAt: now, rsvp: null,
    guests: guests.map(([firstName, lastName]) => ({ id: randomUUID(), householdId: id, firstName, lastName, isPlusOne: false, attending: null, meal: null, dietary: null })),
  };
};
const households = [
  hh("The Rossi Family", "TULIP-1111", [["Maria", "Rossi"], ["Paolo", "Rossi"]]),
  hh("Sam Bennett & Guest", "OLIVE-2222", [["Sam", "Bennett"]], true),
];
mkdirSync(".data", { recursive: true });
writeFileSync(".data/db.json", JSON.stringify({ households, settings: {} }, null, 2));
for (const h of households) console.log(`${h.name.padEnd(24)} code ${h.inviteCode}  link /i/${h.token}`);
