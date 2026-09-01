"use client";

import { useEffect, useRef, useState } from "react";
import { useMotion } from "@/lib/motion";
import { whispers } from "@/data/relationship";
import styles from "./SectionWhispers.module.css";

/** Сколько держим одну фразу на экране */
const SHOW_MS = 2600;
/** Пауза между фразами, если секции пролистали пачкой */
const GAP_MS = 400;

/**
 * Короткая фраза всплывает каждый раз, когда очередная секция
 * уходит вверх за край экрана. Каждая секция срабатывает один раз,
 * фразы берутся по порядку и не наслаиваются друг на друга.
 */
export default function SectionWhispers() {
  const [text, setText] = useState<string | null>(null);
  const { reducedMotion } = useMotion();

  const queue = useRef<string[]>([]);
  const busy = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (!whispers.length) return;

    const clearTimers = () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };

    const next = () => {
      const phrase = queue.current.shift();
      if (!phrase) {
        busy.current = false;
        return;
      }

      busy.current = true;
      setText(phrase);

      timers.current.push(
        window.setTimeout(() => {
          setText(null);
          timers.current.push(window.setTimeout(next, GAP_MS));
        }, SHOW_MS),
      );
    };

    const push = (phrase: string) => {
      queue.current.push(phrase);
      if (!busy.current) next();
    };

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("main > *"),
    );
    if (!sections.length) return;

    const index = new Map(sections.map((el, i) => [el, i]));
    const fired = new WeakSet<HTMLElement>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          // Секция целиком ушла вверх — значит, её дочитали
          if (entry.isIntersecting || entry.boundingClientRect.top > 0) continue;
          if (fired.has(el)) continue;

          fired.add(el);
          observer.unobserve(el);
          push(whispers[(index.get(el) ?? 0) % whispers.length]);
        }
      },
      { threshold: 0 },
    );

    sections.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      clearTimers();
      queue.current = [];
      busy.current = false;
    };
  }, []);

  if (!text) return null;

  return (
    <div className={styles.layer} aria-hidden="true">
      <p
        className={`${styles.card} ${reducedMotion ? styles.static : ""}`}
        onClick={() => setText(null)}
      >
        {text}
      </p>
    </div>
  );
}
