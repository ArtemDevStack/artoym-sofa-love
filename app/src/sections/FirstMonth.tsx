"use client";

import { useMemo, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMotion } from "@/lib/motion";
import { firstMonth } from "@/data/relationship";
import styles from "./FirstMonth.module.css";

const WEEKDAYS = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

/** "2026-08-01" → локальная дата без сдвига таймзоны. */
function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Понедельник = 0, воскресенье = 6. */
function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/**
 * «Наш первый месяц» — календарь из 31 клетки.
 * Отмеченные дни раскрываются подписью; пустые остаются тихими точками.
 */
export default function FirstMonth() {
  const rootRef = useRef<HTMLElement>(null);
  const { reducedMotion } = useMotion();

  const notesByDay = useMemo(
    () => new Map(firstMonth.days.map((d) => [d.day, d])),
    [],
  );

  const leadingBlanks = useMemo(
    () => mondayIndex(parseLocalDate(firstMonth.startDate)),
    [],
  );

  const lastMarkedDay = useMemo(
    () => firstMonth.days.reduce((max, d) => Math.max(max, d.day), 1),
    [],
  );

  const [selected, setSelected] = useState<number>(lastMarkedDay);
  const active = notesByDay.get(selected);

  useGSAP(
    () => {
      if (reducedMotion) return;

      gsap.fromTo(
        "[data-fm-head]",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.1,
          scrollTrigger: { trigger: rootRef.current, start: "top 70%", once: true },
        },
      );

      gsap.fromTo(
        "[data-fm-cell]",
        { opacity: 0, scale: 0.86 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "power2.out",
          stagger: { each: 0.018, from: "start" },
          scrollTrigger: { trigger: "[data-fm-grid]", start: "top 80%", once: true },
        },
      );
    },
    { scope: rootRef, dependencies: [reducedMotion] },
  );

  return (
    <section ref={rootRef} className={styles.root} aria-label={firstMonth.title}>
      <p data-fm-head className={`${styles.eyebrow} eyebrow`}>
        {firstMonth.eyebrow}
      </p>
      <h2 data-fm-head className={`${styles.title} display`}>
        {firstMonth.title}
      </h2>

      <div className={styles.calendar}>
        <div className={styles.weekdays} aria-hidden="true">
          {WEEKDAYS.map((w) => (
            <span key={w} className={styles.weekday}>
              {w}
            </span>
          ))}
        </div>

        <div data-fm-grid className={styles.grid}>
          {Array.from({ length: leadingBlanks }, (_, i) => (
            <span key={`blank-${i}`} className={styles.blank} aria-hidden="true" />
          ))}

          {Array.from({ length: firstMonth.length }, (_, i) => {
            const day = i + 1;
            const entry = notesByDay.get(day);

            if (!entry) {
              return (
                <span
                  key={day}
                  data-fm-cell
                  className={`${styles.cell} ${styles.quiet} mono-num`}
                  aria-hidden="true"
                >
                  {day}
                </span>
              );
            }

            const isActive = selected === day;

            return (
              <button
                key={day}
                type="button"
                data-fm-cell
                aria-pressed={isActive}
                aria-label={`${day} августа — ${entry.note}`}
                onClick={() => setSelected(day)}
                className={`${styles.cell} ${styles.marked} ${
                  isActive ? styles.active : ""
                } mono-num`}
              >
                {day}
                <span className={styles.dot} aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </div>

      <p className={styles.progress}>
        отмечено {firstMonth.days.length} из {firstMonth.length}
      </p>

      <div className={styles.panel} aria-live="polite">
        {active && (
          <article key={active.day} className={styles.card}>
            {active.photo && (
              <figure className={styles.polaroid}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={active.photo} alt="" className={styles.polaroidImg} />
              </figure>
            )}

            <div className={styles.cardText}>
              <p className={`${styles.cardDate} mono-num`}>
                {String(active.day).padStart(2, "0")} августа
              </p>
              <p className={styles.cardNote}>{active.note}</p>
              {active.quote && (
                <blockquote className={styles.quote}>
                  «{active.quote}»
                  <cite className={styles.cite}>
                    {active.quoteBy === "her" ? "— она" : "— я"}
                  </cite>
                </blockquote>
              )}
            </div>
          </article>
        )}
      </div>

      <div className={styles.outro}>
        {firstMonth.outro.map((line) => (
          <p key={line} className={styles.outroLine}>
            {line}
          </p>
        ))}
      </div>
    </section>
  );
}
