"use client";

import { useSyncExternalStore } from "react";

/**
 * Shared “has the envelope been opened?” state, so the hero can choreograph its
 * entrance to begin exactly as the invitation unfolds into the page.
 */
const listeners = new Set<() => void>();
let done: boolean | null = null;

function read(): boolean {
  if (done === null) done = typeof document !== "undefined" && document.documentElement.dataset.opened === "1";
  return done;
}

export function markIntroDone() {
  done = true;
  document.documentElement.dataset.opened = "1";
  try {
    sessionStorage.setItem("pc-opened", "1");
  } catch {
    /* private mode */
  }
  listeners.forEach((l) => l());
}

export function useIntroDone(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => false,
  );
}

/** Inline, pre-paint script: skip the envelope if it was already opened this session. */
export const INTRO_BOOT_SCRIPT = `try{if(sessionStorage.getItem('pc-opened')==='1'||/[?&]skip-intro\\b/.test(location.search)){document.documentElement.dataset.opened='1'}}catch(e){}`;
