"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMotion } from "@/lib/motion";
import { useTogetherTime } from "@/hooks/useTogetherTime";
import { plural, formatThousands } from "@/lib/time";
import styles from "./Counter.module.css";

/** «Мы вместе уже» — живой счётчик от даты начала отношений. */
export default function Counter() {
  const rootRef = useRef<HTMLElement>(null);
  const time = useTogetherTime();
  const { reducedMotion } = useMotion();

  useGSAP(
    () => {
      if (reducedMotion) return;
      gsap.fromTo(
        "[data-counter-row]",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          stagger: 0.12,
          scrollTrigger: { trigger: rootRef.current, start: "top 65%", once: true },
        },
      );
    },
    { scope: rootRef, dependencies: [reducedMotion] },
  );

  return (
    <section ref={rootRef} className={styles.root} aria-label="Сколько мы вместе">
      <h2 className={`${styles.heading} display`}>Мы вместе уже</h2>

      <div className={styles.rows} aria-live="off">
        {Boolean(time && time.years > 0) && (
          <div data-counter-row className={styles.row}>
            <span className={`${styles.value} display mono-num`}>
              {time ? time.years : "—"}
            </span>
            <span className={styles.unit}>{time ? plural(time.years, "year") : "лет"}</span>
          </div>
        )}
        <div data-counter-row className={styles.row}>
          <span className={`${styles.value} display mono-num`}>
            {time ? time.months : "—"}
          </span>
          <span className={styles.unit}>{time ? plural(time.months, "month") : "месяцев"}</span>
        </div>
        <div data-counter-row className={styles.row}>
          <span className={`${styles.value} display mono-num`}>
            {time ? time.days : "—"}
          </span>
          <span className={styles.unit}>{time ? plural(time.days, "day") : "дней"}</span>
        </div>
      </div>

      <p data-counter-row className={styles.hours}>
        {time ? `${formatThousands(time.hours)} ${plural(time.hours, "hour")}` : ""}
      </p>
    </section>
  );
}
