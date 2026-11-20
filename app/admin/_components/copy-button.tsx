"use client";

import { useState } from "react";

export function CopyButton({ value, label = "Copy link", className = "btn btn-ghost btn-sm" }: { value: string; label?: string; className?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      // Fallback for older mobile browsers / non-secure contexts.
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      setState(ok ? "copied" : "failed");
    }
    setTimeout(() => setState("idle"), 2000);
  }
  return (
    <button type="button" className={className} onClick={copy} aria-live="polite">
      {state === "copied" ? "Copied ✓" : state === "failed" ? "Press & hold to copy" : label}
    </button>
  );
}
