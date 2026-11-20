"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Photo } from "@/lib/wedding.config";
import { PhotoCorners, Fleuron } from "@/components/ornaments/Stationery";
import { Blossom, OliveSprig } from "@/components/ornaments/Botanicals";
import { Parallax, PhotoReveal, Reveal } from "@/components/motion";

type Mount = "polaroid" | "corners" | "gilt" | "deckle";

/** Art direction for each slot in the collage. */
const SLOTS: { mount: Mount; rotate: number; desktop: string; mobile: string; caption?: string; from: "bottom" | "left" | "right"; speed: number }[] = [
  { mount: "gilt", rotate: -1.5, desktop: "md:col-[1/8] md:row-[1/6]", mobile: "col-span-2", from: "left", speed: 0.04 },
  { mount: "corners", rotate: 2.5, desktop: "md:col-[8/13] md:row-[2/9]", mobile: "col-span-1", from: "right", speed: 0.1 },
  { mount: "polaroid", rotate: -3, desktop: "md:col-[2/7] md:row-[6/13]", mobile: "col-span-1 mt-10", caption: "Positano", from: "bottom", speed: 0.14 },
  { mount: "deckle", rotate: 1.5, desktop: "md:col-[7/12] md:row-[9/15]", mobile: "col-span-1", from: "bottom", speed: 0.06 },
  { mount: "polaroid", rotate: 2, desktop: "md:col-[1/6] md:row-[13/19]", mobile: "col-span-1 mt-8", caption: "Amalfi", from: "left", speed: 0.12 },
  { mount: "corners", rotate: -2, desktop: "md:col-[6/11] md:row-[15/20]", mobile: "col-span-2 mx-6", from: "right", speed: 0.08 },
];

function photoFilter(p: Photo) {
  return p.mono ? "grayscale(1) contrast(1.08) brightness(1.02) sepia(0.1)" : "sepia(0.16) saturate(0.88) contrast(1.03)";
}

function Framed({ p, mount, caption, onOpen, priority }: { p: Photo; mount: Mount; caption?: string; onOpen: () => void; priority?: boolean }) {
  const img = (
    <button type="button" onClick={onOpen} className="group relative block h-full w-full cursor-zoom-in overflow-hidden" aria-label={`Enlarge photograph: ${p.alt}`}>
      <Image src={p.src} alt={p.alt} fill priority={priority} sizes="(max-width: 768px) 90vw, 45vw" className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-paper)] group-hover:scale-[1.04]" style={{ objectPosition: p.focus, filter: photoFilter(p) }} />
      <span aria-hidden className="absolute inset-0 shadow-[inset_0_0_60px_rgb(40_25_10/0.35)]" />
    </button>
  );
  const ratio = p.width > p.height ? "aspect-[4/3]" : "aspect-[3/4]";

  switch (mount) {
    case "polaroid":
      return (
        <figure className="bg-[#fdfaf3] p-3 pb-14 shadow-[0_18px_40px_-18px_rgb(43_29_21/0.55)] sm:p-4 sm:pb-16">
          <div className={`relative ${ratio}`}>{img}</div>
          {caption && <figcaption className="script absolute bottom-3 left-0 right-0 text-center text-3xl text-espresso-soft sm:bottom-4">{caption}</figcaption>}
        </figure>
      );
    case "corners":
      return (
        <figure className="bg-cream p-4 shadow-[0_14px_34px_-18px_rgb(43_29_21/0.55)] sm:p-6">
          <div className={`relative ${ratio}`}>
            {img}
            <PhotoCorners />
          </div>
        </figure>
      );
    case "gilt":
      return (
        <figure className="p-[10px] shadow-[0_24px_50px_-22px_rgb(43_29_21/0.65)]" style={{ background: "linear-gradient(135deg,#f3dfa2,#a47a35 30%,#e8cd85 50%,#7d6230 75%,#d5b46c)" }}>
          <div className="bg-espresso p-[3px]">
            <div className={`relative ${ratio}`}>{img}</div>
          </div>
        </figure>
      );
    case "deckle":
      return (
        <figure className="deckle bg-ivory p-3 shadow-[0_18px_40px_-20px_rgb(43_29_21/0.5)]">
          <div className={`relative ${ratio}`}>{img}</div>
        </figure>
      );
  }
}

export function Gallery({ photos }: { photos: Photo[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const touchX = useRef<number | null>(null);

  const show = (i: number) => {
    lastFocus.current = document.activeElement as HTMLElement;
    setOpen(i);
  };
  const close = useCallback(() => {
    setOpen(null);
    lastFocus.current?.focus();
  }, []);
  const step = useCallback((d: number) => setOpen((o) => (o === null ? o : (o + d + photos.length) % photos.length)), [photos.length]);

  useEffect(() => {
    if (open === null) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close, step]);

  return (
    <section id="gallery" aria-labelledby="gallery-title" className="paper relative overflow-hidden px-5 py-20 sm:px-8 md:py-28">
      <Reveal className="relative mx-auto max-w-5xl text-center md:text-left">
        <p className="eyebrow text-bistre">A few favourites</p>
        <h2 id="gallery-title" className="mt-2 flex flex-col items-center md:flex-row md:items-baseline md:gap-6">
          <span className="display text-[clamp(3.2rem,13vw,7.5rem)] uppercase text-olive">Moments</span>
          <span className="script mt-1 text-[clamp(2.4rem,9vw,4rem)] text-roses md:mt-0">ti amo</span>
        </h2>
        <Fleuron className="mx-auto mt-4 w-40 text-gold md:mx-0" />
      </Reveal>

      <div className="relative mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-x-4 gap-y-8 md:mt-20 md:grid-cols-12 md:grid-rows-[repeat(19,minmax(44px,auto))] md:gap-x-6 md:gap-y-0">
        {photos.slice(0, SLOTS.length).map((p, i) => {
          const slot = SLOTS[i];
          return (
            <Parallax key={p.src + i} speed={slot.speed} className={`relative ${slot.mobile} ${slot.desktop} md:col-span-auto self-start`} style={{ zIndex: i % 2 ? 2 : 1 }}>
              <div style={{ transform: `rotate(${slot.rotate}deg)` }}>
                <PhotoReveal from={slot.from} delay={0.05}>
                  <Framed p={p} mount={slot.mount} caption={slot.caption} onOpen={() => show(i)} />
                </PhotoReveal>
              </div>
            </Parallax>
          );
        })}
        <OliveSprig className="pointer-events-none absolute -right-6 bottom-[-30px] hidden w-56 rotate-[160deg] md:block" />
        <Blossom className="pointer-events-none absolute right-[8%] top-[44%] hidden w-10 md:block" />
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Photograph viewer"
            className="fixed inset-0 z-[80] flex items-center justify-center bg-espresso/95 p-4 grain"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.1 : 0.45 }}
            onClick={close}
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
              touchX.current = null;
            }}
          >
            <AnimatePresence mode="wait">
              <motion.figure
                key={open}
                className="relative flex max-h-full w-full max-w-4xl flex-col items-center"
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
                transition={{ duration: reduce ? 0.1 : 0.5, ease: [0.22, 0.61, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-[#fdfaf3] p-2.5 sm:p-4">
                  <Image
                    src={photos[open].src}
                    alt={photos[open].alt}
                    width={photos[open].width}
                    height={photos[open].height}
                    sizes="(max-width: 768px) 92vw, 900px"
                    className="h-auto max-h-[72svh] w-auto max-w-full object-contain"
                    style={{ filter: photoFilter(photos[open]) }}
                  />
                </div>
                <figcaption className="mt-4 max-w-xl px-4 text-center text-base italic text-parchment/85">{photos[open].alt}</figcaption>
              </motion.figure>
            </AnimatePresence>

            <button ref={closeRef} type="button" onClick={close} className="absolute right-3 top-[max(12px,env(safe-area-inset-top))] flex h-12 w-12 items-center justify-center text-parchment" aria-label="Close photograph">
              <svg viewBox="0 0 24 24" className="h-6 w-6" stroke="currentColor" strokeWidth="1.2" fill="none" aria-hidden>
                <path d="M5 5l14 14M19 5L5 19" />
              </svg>
            </button>
            <div className="absolute bottom-[max(16px,env(safe-area-inset-bottom))] left-0 right-0 flex items-center justify-center gap-6 text-parchment" onClick={(e) => e.stopPropagation()}>
              <button type="button" onClick={() => step(-1)} className="flex h-12 w-12 items-center justify-center" aria-label="Previous photograph">
                <svg viewBox="0 0 24 24" className="h-6 w-6" stroke="currentColor" strokeWidth="1.2" fill="none" aria-hidden>
                  <path d="M15 4l-8 8 8 8" />
                </svg>
              </button>
              <span className="eyebrow text-[0.65rem] tabular-nums">
                {open + 1} / {photos.length}
              </span>
              <button type="button" onClick={() => step(1)} className="flex h-12 w-12 items-center justify-center" aria-label="Next photograph">
                <svg viewBox="0 0 24 24" className="h-6 w-6" stroke="currentColor" strokeWidth="1.2" fill="none" aria-hidden>
                  <path d="M9 4l8 8-8 8" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
