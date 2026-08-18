"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { useMotion } from "@/lib/motion";
import { useTogetherTime } from "@/hooks/useTogetherTime";
import { stats } from "@/data/relationship";
import { formatThousands } from "@/lib/time";
import styles from "./OurNumbers.module.css";

/**
 * Cinematic statistics: крупная editorial-типографика,
 * числа анимируются при попадании в viewport.
 * Значение "auto-days" вычисляется от даты начала отношений.
 */
export default function OurNumbers() {
  const rootRef = useRef<HTMLElement>(null);
  const time = useTogetherTime();
  const { reducedMotion } = useMotion();

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>("[data-stat]");

      items.forEach((item) => {
        const valueEl = item.querySelector<HTMLElement>("[data-stat-value]");
        if (!valueEl) return;
        const raw = item.dataset.stat ?? "";

        const resolved =
          raw === "auto-days" ? String(time?.totalDays ?? 0) : raw;
        const numeric = /^\d+$/.test(resolved) ? parseInt(resolved, 10) : null;

        if (reducedMotion || numeric === null) {
          valueEl.textContent =
            numeric !== null ? formatThousands(numeric) : resolved;
          gsap.set(item, { opacity: 1 });
          return;
        }

        const counter = { v: 0 };
        ScrollTrigger.create({
          trigger: item,
          start: "top 78%",
          once: true,
          onEnter() {
            gsap.fromTo(item, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9 });
            gsap.to(counter, {
              v: numeric,
              duration: 2.2,
              ease: "power3.out",
              onUpdate() {
                valueEl.textContent = formatThousands(Math.round(counter.v));
              },
            });
          },
        });
      });
    },
    { scope: rootRef, dependencies: [reducedMotion, time?.totalDays] },
  );

  return (
    <section ref={rootRef} className={styles.root} aria-label="Наши цифры">
      <p className={`${styles.heading} eyebrow`}>наши цифры</p>
      <ul className={styles.list}>
        {stats.map((stat) => (
          <li key={stat.id} data-stat={String(stat.value)} className={styles.item}>
            <span data-stat-value className={`${styles.value} display mono-num`}>
              {typeof stat.value === "number" ? "0" : stat.value === "auto-days" ? "0" : stat.value}
            </span>
            <span className={styles.label}>{stat.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
