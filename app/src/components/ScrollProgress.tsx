"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { scrollToTarget, useMotion } from "@/lib/motion";
import styles from "./ScrollProgress.module.css";

/** Пункты истории — привязываются к id секций. */
const CHECKPOINTS = [
  { id: "intro", label: "01" },
  { id: "timeline", label: "02" },
  { id: "stack", label: "03" },
  { id: "film", label: "04" },
  { id: "places", label: "05" },
  { id: "letters", label: "06" },
  { id: "letter", label: "07" },
  { id: "finale", label: "08" },
];

export default function ScrollProgress() {
  const rootRef = useRef<HTMLElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const { lenis } = useMotion();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        fillRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.4,
          },
        },
      );

      // Подсветка активного checkpoint
      CHECKPOINTS.forEach(({ id, label }) => {
        const section = document.getElementById(id);
        if (!section) return;
        ScrollTrigger.create({
          trigger: section,
          start: "top center",
          end: "bottom center",
          onToggle(self) {
            const el = rootRef.current?.querySelector(
              `[data-checkpoint="${label}"]`,
            );
            el?.classList.toggle(styles.active, self.isActive);
          },
        });
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <nav
      ref={rootRef}
      className={styles.root}
      aria-label="Прогресс истории"
    >
      <span className={styles.track} aria-hidden="true">
        <span ref={fillRef} className={styles.fill} />
      </span>
      <ul className={styles.list}>
        {CHECKPOINTS.map(({ id, label }) => (
          <li key={id}>
            <button
              type="button"
              data-checkpoint={label}
              className={styles.point}
              onClick={() => scrollToTarget(lenis, `#${id}`)}
              aria-label={`К разделу ${label}`}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
