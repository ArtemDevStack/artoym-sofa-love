"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import styles from "./CustomCursor.module.css";

type CursorMode = "default" | "view" | "open" | "secret";

const LABELS: Record<CursorMode, string> = {
  default: "",
  view: "view",
  open: "open",
  secret: "?",
};

/** Деликатный custom cursor — только desktop с точным указателем. */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<CursorMode>("default");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (fine.matches && !reduce.matches) setEnabled(true);
  }, []);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!enabled || !dot || !ring) return;

    document.documentElement.classList.add("has-custom-cursor");
    // Курсор скрыт, пока мышь не двинулась — иначе виден в углу 0,0
    gsap.set([dot, ring], { opacity: 0 });

    const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power2" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power2" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3" });

    let shown = false;
    const move = (e: MouseEvent) => {
      if (!shown) {
        shown = true;
        gsap.set([dot, ring], { x: e.clientX, y: e.clientY, opacity: 1 });
      }
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    const over = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>(
        "[data-cursor]",
      );
      setMode((target?.dataset.cursor as CursorMode) ?? "default");
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !ringRef.current) return;
    gsap.to(ringRef.current, {
      scale: mode === "default" ? 1 : 2.4,
      duration: 0.4,
      ease: "power3.out",
    });
  }, [mode, enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={ringRef} className={styles.ring} aria-hidden="true">
        <span
          className={`${styles.label} ${
            mode !== "default" ? styles.labelVisible : ""
          }`}
        >
          {LABELS[mode]}
        </span>
      </div>
      <div ref={dotRef} className={styles.dot} aria-hidden="true" />
    </>
  );
}
