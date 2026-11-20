"use client";

import { useAnimate, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { markIntroDone, useIntroDone } from "@/lib/intro";
import { WaxSeal } from "@/components/ornaments/WaxSeal";
import { Bouquet, Butterfly } from "@/components/ornaments/Botanicals";
import { Lace } from "@/components/ornaments/Stationery";

/** Silk-smooth ease used for paper moving through the air. */
const SILK = [0.65, 0, 0.35, 1] as const;
const PAPER = [0.22, 0.61, 0.36, 1] as const;

const ENVELOPE = "#ecd2c8";
const ENVELOPE_SHADE = "#dcb9ad";

export function EnvelopeIntro({ addressee, houseName, couple }: { addressee: string | null; houseName: string; couple: string }) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const reduce = useReducedMotion();
  const done = useIntroDone();
  const [phase, setPhase] = useState<"idle" | "opening" | "gone">("idle");

  // lock page scroll while the envelope is on stage
  useEffect(() => {
    if (done) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [done]);

  const finish = () => {
    window.scrollTo(0, 0);
    markIntroDone();
    setPhase("gone");
  };

  async function open() {
    if (phase !== "idle") return;
    setPhase("opening");
    if (reduce) {
      await animate(scope.current, { opacity: 0 }, { duration: 0.4 });
      return finish();
    }
    // 1 · the seal cracks and falls away
    await animate(".seal-whole", { opacity: 0 }, { duration: 0.01 });
    await animate(".seal-half", { opacity: 1 }, { duration: 0.01 });
    animate(".seal-l", { x: -46, y: 70, rotate: -38, opacity: 0 }, { duration: 0.85, ease: [0.5, 0, 0.75, 0] });
    await animate(".seal-r", { x: 46, y: 80, rotate: 32, opacity: 0 }, { duration: 0.85, ease: [0.5, 0, 0.75, 0], delay: 0.05 });
    // 2 · the flap lifts on its crease
    animate(".flap", { rotateX: 180 }, { duration: 1.05, ease: SILK });
    await animate(".flap", { zIndex: 1 }, { duration: 0.01, delay: 0.5 });
    await new Promise((r) => setTimeout(r, 380));
    // 3 · the invitation slides out
    await animate(".card", { y: "-64%" }, { duration: 1.2, ease: PAPER });
    // 4 · …and unfolds into the page
    animate(".env-body", { y: 260, opacity: 0, rotate: 3 }, { duration: 1.1, ease: SILK });
    animate(".chrome", { opacity: 0 }, { duration: 0.6 });
    animate(".card", { y: "-30%", scale: 3.2, opacity: 0 }, { duration: 1.5, ease: SILK, delay: 0.15 });
    await animate(scope.current, { opacity: 0 }, { duration: 1, ease: "easeInOut", delay: 0.55 });
    finish();
  }

  if (done || phase === "gone") return null;

  return (
    <div
      ref={scope}
      id="envelope-intro"
      role="dialog"
      aria-modal="true"
      aria-label="Your invitation"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-espresso px-4"
      style={{ backgroundImage: "url(/textures/paper-grain.svg), radial-gradient(90% 70% at 50% 45%, #4a3426 0%, #2b1d15 60%, #160d08 100%)", backgroundSize: "320px 320px, 100% 100%" }}
    >
      {/* still-life corners */}
      <div className="chrome pointer-events-none absolute inset-0" aria-hidden>
        <Bouquet className="absolute -bottom-10 -left-20 h-[360px] w-[260px] opacity-80 sm:left-0 sm:h-[520px] sm:w-[380px]" />
        <Bouquet mirror className="absolute -bottom-12 -right-24 h-[300px] w-[220px] opacity-70 sm:right-0 sm:h-[460px] sm:w-[340px]" />
        <div className="absolute right-[10%] top-[6%] w-12 sm:w-14" style={{ animation: "float-petal 8s ease-in-out infinite" }}>
          <Butterfly className="w-full -rotate-12" />
        </div>
      </div>

      <div className="chrome relative z-10 mb-10 text-center text-parchment sm:mb-14">
        <p className="eyebrow text-[0.65rem] text-parchment/60">{addressee ? "Specially for" : "You are cordially invited"}</p>
        <p className="mt-3 font-display text-[clamp(1.5rem,6vw,2.2rem)] italic leading-tight text-ivory">{addressee ?? "To our dearest family & friends"}</p>
      </div>

      {/* ── the envelope ───────────────────────────────────────────── */}
      <button
        type="button"
        onClick={open}
        disabled={phase !== "idle"}
        aria-label="Open your invitation"
        className="env-body relative z-10 block aspect-[3/2] w-[min(88vw,520px)] cursor-pointer focus-visible:outline-offset-8"
        style={{ perspective: 1400 }}
      >
        {/* back panel + striped liner */}
        <span className="absolute inset-0 shadow-[0_40px_70px_-25px_rgb(0_0_0/0.75)]" style={{ background: ENVELOPE_SHADE }} />
        <span className="absolute inset-x-[3%] top-[2%] h-[60%] stripes-olive-fine opacity-90" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }} />

        {/* the invitation card inside */}
        <span className="card absolute inset-x-[6%] top-[5%] z-[2] block h-[90%]">
          <Lace width={12} className="paper flex h-full w-full flex-col items-center justify-center text-center">
            <span className="eyebrow block text-[0.5rem] text-bistre sm:text-[0.6rem]">Together with their families</span>
            <span className="script mt-1 block text-[clamp(2.2rem,10vw,3.6rem)] leading-none text-raspberry">{couple}</span>
            <span className="mt-1 block font-display text-[0.8rem] italic text-olive sm:text-sm">are getting married · 08.27.27</span>
          </Lace>
        </span>

        {/* front pocket: side & bottom folds */}
        <span className="absolute inset-0 z-[3]" style={{ filter: "drop-shadow(0 -1px 1px rgb(90 50 30 / 0.25))" }}>
          <span className="paper absolute inset-0" style={{ background: ENVELOPE, backgroundImage: "url(/textures/paper-grain.svg), linear-gradient(100deg, rgb(255 255 255 / 0.18), transparent 40%)", clipPath: "polygon(0 0, 52% 56%, 0 100%)" }} />
          <span className="paper absolute inset-0" style={{ background: ENVELOPE, backgroundImage: "url(/textures/paper-grain.svg), linear-gradient(260deg, rgb(0 0 0 / 0.05), transparent 40%)", clipPath: "polygon(100% 0, 48% 56%, 100% 100%)" }} />
          <span className="paper absolute inset-0" style={{ background: ENVELOPE, backgroundImage: "url(/textures/paper-grain.svg), linear-gradient(0deg, rgb(120 70 50 / 0.10), transparent 60%)", clipPath: "polygon(0 100%, 50% 46%, 100% 100%)" }} />
        </span>
        <span className="pointer-events-none absolute inset-x-0 bottom-[7%] z-[4] block text-center">
          <span className="script block text-[clamp(1.3rem,5vw,1.9rem)] text-raspberry/80">{houseName}</span>
        </span>

        {/* top flap — two faces so the inside shows the liner as it opens */}
        <span className="flap absolute inset-x-0 top-0 z-[5] block h-[60%]" style={{ transformOrigin: "50% 0%", transformStyle: "preserve-3d" }}>
          <span
            className="absolute inset-0"
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", background: ENVELOPE, backgroundImage: "url(/textures/paper-grain.svg), linear-gradient(180deg, rgb(255 255 255 / 0.25), transparent 70%)", clipPath: "polygon(0 0, 100% 0, 50% 100%)", filter: "drop-shadow(0 3px 3px rgb(80 40 20 / 0.3))" }}
          />
          <span className="stripes-olive-fine absolute inset-0" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateX(180deg)", clipPath: "polygon(0 0, 100% 0, 50% 100%)" }} />
        </span>

        {/* wax seal at the point of the flap */}
        <span className="pointer-events-none absolute left-1/2 top-[60%] z-[6] block w-[26%] -translate-x-1/2 -translate-y-1/2">
          <span className="seal-whole block" style={{ animation: phase === "idle" && !reduce ? "sway 4s ease-in-out infinite" : undefined }}>
            <WaxSeal className="block w-full" />
          </span>
          <span className="seal-half seal-l absolute inset-0 block opacity-0">
            <WaxSeal half="left" className="block w-full" />
          </span>
          <span className="seal-half seal-r absolute inset-0 block opacity-0">
            <WaxSeal half="right" className="block w-full" />
          </span>
        </span>
      </button>

      <div className="chrome relative z-10 mt-12 flex flex-col items-center gap-2 text-parchment">
        <button type="button" onClick={open} disabled={phase !== "idle"} className="group flex min-h-12 items-center gap-3 px-4 font-display text-xl italic text-ivory">
          <span className="h-px w-8 bg-gold transition-all duration-500 group-hover:w-12" />
          Kindly open
          <span className="h-px w-8 bg-gold transition-all duration-500 group-hover:w-12" />
        </button>
        <p className="eyebrow text-[0.58rem] text-parchment/50">Tap the seal</p>
      </div>

      <button type="button" onClick={finish} className="chrome absolute bottom-[max(14px,env(safe-area-inset-bottom))] right-4 z-10 min-h-11 px-3 text-sm italic text-parchment/55 underline decoration-parchment/25 underline-offset-4 hover:text-parchment">
        Skip to invitation
      </button>
    </div>
  );
}
