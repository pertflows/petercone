"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionStyle } from "motion/react";
import { useRef } from "react";
import { useIntroDone } from "@/lib/intro";

const EASE = [0.22, 0.61, 0.36, 1] as const;

/** Fade/rise into view once, like ink settling on paper. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  as = "div",
  style,
  gate = false,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "li" | "figure" | "section" | "p";
  style?: React.CSSProperties;
  /** Wait for the envelope to open before playing (hero only). */
  gate?: boolean;
}) {
  const reduce = useReducedMotion();
  const introDone = useIntroDone();
  const Cmp = motion[as];
  const shown = { opacity: 1, y: 0 };
  const hidden = reduce ? { opacity: 0 } : { opacity: 0, y };
  return (
    <Cmp
      className={className}
      style={style as MotionStyle}
      initial={hidden}
      {...(gate ? { animate: introDone ? shown : hidden } : { whileInView: shown, viewport: { once: true, margin: "0px 0px -12% 0px" } })}
      transition={{ duration: reduce ? 0.2 : 1.1, ease: EASE, delay: reduce ? 0 : delay }}
    >
      {children}
    </Cmp>
  );
}

/** Photograph that unveils with a slow wipe and gentle settle. */
export function PhotoReveal({ children, className, delay = 0, from = "bottom" }: { children: React.ReactNode; className?: string; delay?: number; from?: "bottom" | "left" | "right" }) {
  const reduce = useReducedMotion();
  const hidden = { bottom: "inset(100% 0 0 0)", left: "inset(0 100% 0 0)", right: "inset(0 0 0 100%)" }[from];
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { clipPath: hidden, scale: 1.06 }}
      whileInView={reduce ? { opacity: 1 } : { clipPath: "inset(0% 0 0 0)", scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: reduce ? 0.2 : 1.5, ease: [0.65, 0, 0.35, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

/** Vertical parallax drift relative to the viewport. */
export function Parallax({ children, className, speed = 0.15, rotate = 0, style }: { children: React.ReactNode; className?: string; speed?: number; rotate?: number; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * 100}%`, `${-speed * 100}%`]);
  const r = useTransform(scrollYProgress, [0, 1], [-rotate, rotate]);
  return (
    <motion.div ref={ref} className={className} style={{ ...(style as MotionStyle), ...(reduce ? {} : { y, rotate: r }) }}>
      {children}
    </motion.div>
  );
}

/** Script text revealed left-to-right, as if written with a pen. */
export function Handwritten({ children, className, delay = 0, duration = 2.2 }: { children: React.ReactNode; className?: string; delay?: number; duration?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      className={`inline-block ${className ?? ""}`}
      style={{ paddingInline: "0.15em", marginInline: "-0.15em", paddingBlock: "0.12em" }}
      initial={reduce ? { opacity: 0 } : { clipPath: "inset(-20% 100% -20% 0)" }}
      whileInView={reduce ? { opacity: 1 } : { clipPath: "inset(-20% -5% -20% 0)" }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: reduce ? 0.2 : duration, ease: [0.45, 0.05, 0.4, 1], delay }}
    >
      {children}
    </motion.span>
  );
}
