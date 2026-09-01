"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMotion } from "@/lib/motion";
import { nextMeeting } from "@/data/relationship";
import { plural } from "@/lib/time";
import styles from "./NextMeeting.module.css";

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  passed: boolean;
}

function compute(target: Date, now: Date): Countdown {
  const ms = target.getTime() - now.getTime();
  if (ms <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, passed: true };
  }
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor(ms / 3_600_000) % 24,
    minutes: Math.floor(ms / 60_000) % 60,
    seconds: Math.floor(ms / 1000) % 60,
    passed: false,
  };
}

/** Живой обратный отсчёт до следующей встречи — главный счётчик на расстоянии. */
export default function NextMeeting() {
  const rootRef = useRef<HTMLElement>(null);
  const { reducedMotion } = useMotion();
  const [left, setLeft] = useState<Countdown | null>(null);

  useEffect(() => {
    if (!nextMeeting.date) return;
    const target = new Date(nextMeeting.date);
    const tick = () => setLeft(compute(target, new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useGSAP(
    () => {
      if (reducedMotion) return;
      gsap.fromTo(
        "[data-nm]",
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.12,
          scrollTrigger: { trigger: rootRef.current, start: "top 70%", once: true },
        },
      );
    },
    { scope: rootRef, dependencies: [reducedMotion] },
  );

  const units = left
    ? [
        { value: left.days, label: plural(left.days, "day") },
        { value: left.hours, label: plural(left.hours, "hour") },
        { value: left.minutes, label: "мин" },
        { value: left.seconds, label: "сек" },
      ]
    : [];

  return (
    <section ref={rootRef} className={styles.root} aria-label={nextMeeting.title}>
      <p data-nm className={`${styles.eyebrow} eyebrow`}>
        {nextMeeting.eyebrow}
      </p>

      <h2 data-nm className={`${styles.title} display`}>
        {left?.passed ? "Мы вместе" : nextMeeting.title}
      </h2>

      {!nextMeeting.date && (
        <p data-nm className={styles.waiting}>
          {nextMeeting.waitingText}
        </p>
      )}

      {nextMeeting.date && !left?.passed && (
        <div data-nm className={styles.units} aria-live="off">
          {units.map((u) => (
            <div key={u.label} className={styles.unit}>
              <span className={`${styles.value} display mono-num`}>
                {left ? String(u.value).padStart(2, "0") : "—"}
              </span>
              <span className={styles.label}>{u.label}</span>
            </div>
          ))}
        </div>
      )}

      {nextMeeting.place && !left?.passed && (
        <p data-nm className={styles.place}>
          место встречи — {nextMeeting.place}
        </p>
      )}

      <p data-nm className={styles.note}>
        {nextMeeting.note}
      </p>
    </section>
  );
}
