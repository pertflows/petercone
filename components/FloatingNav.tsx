"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Monogram } from "@/components/ornaments/Monogram";

/** Discreet stationery-style navigation that appears once past the invitation. */
export function FloatingNav() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.nav
          aria-label="Quick links"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
          className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between px-3 pt-[max(10px,env(safe-area-inset-top))] sm:px-5"
        >
          <a href="#invitation" aria-label="Back to the invitation" className="pointer-events-auto flex h-12 w-12 items-center justify-center bg-ivory/90 shadow-[0_6px_20px_-8px_rgb(43_29_21/0.5)] outline outline-1 outline-offset-[-4px] outline-gold/60 backdrop-blur-[2px]">
            <Monogram className="h-9 w-9 text-olive" ampColor="#bb2968" />
          </a>
          <div className="pointer-events-auto flex items-center gap-1 bg-ivory/90 px-1 shadow-[0_6px_20px_-8px_rgb(43_29_21/0.5)] outline outline-1 outline-offset-[-4px] outline-gold/60">
            <a href="#details" className="hidden min-h-12 items-center px-3 font-display text-[0.95rem] italic text-espresso sm:flex">Details</a>
            <a href="#program" className="hidden min-h-12 items-center px-3 font-display text-[0.95rem] italic text-espresso sm:flex">The Day</a>
            <a href="#faq" className="hidden min-h-12 items-center px-3 font-display text-[0.95rem] italic text-espresso md:flex">FAQ</a>
            <a href="#rsvp" className="flex min-h-10 items-center bg-olive px-4 font-display text-[0.95rem] italic text-parchment">Kindly reply</a>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
