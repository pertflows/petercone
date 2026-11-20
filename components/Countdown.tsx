"use client";

import { useEffect, useState } from "react";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60) };
}

export function Countdown({ target, caption }: { target: string; caption: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- start the clock only on the client to avoid hydration mismatch
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  const p = now === null ? null : parts(new Date(target).getTime() - now);
  const cells: [string, number | undefined][] = [
    ["days", p?.days],
    ["hours", p?.hours],
    ["minutes", p?.minutes],
  ];
  const done = p && p.days + p.hours + p.minutes === 0;

  return (
    <div className="flex flex-col items-center" role="timer" aria-live="off" aria-label={p ? `${p.days} days, ${p.hours} hours and ${p.minutes} minutes to go` : "Countdown to the wedding"}>
      {done ? (
        <p className="script text-4xl text-raspberry">Today is the day</p>
      ) : (
        <div className="flex items-stretch">
          {cells.map(([label, v], i) => (
            <div key={label} className={`flex min-w-[5.2rem] flex-col items-center px-3 sm:min-w-[7rem] sm:px-6 ${i ? "border-l border-gold/50" : ""}`}>
              <span className="font-display text-[2.6rem] leading-none tabular-nums text-olive sm:text-6xl">{v === undefined ? "—" : String(v).padStart(label === "days" ? 1 : 2, "0")}</span>
              <span className="eyebrow mt-2 text-[0.6rem] text-bistre">{label}</span>
            </div>
          ))}
        </div>
      )}
      <p className="mt-3 font-display text-sm italic text-bistre">{caption}</p>
    </div>
  );
}
