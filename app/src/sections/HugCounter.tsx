"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMotion } from "@/lib/motion";
import { hugs } from "@/data/relationship";
import { formatThousands } from "@/lib/time";
import styles from "./HugCounter.module.css";

const STORAGE_KEY = "hug-count";

interface Heart {
  id: number;
  /** Горизонтальный разлёт, px */
  dx: number;
  /** Наклон, градусы */
  rot: number;
  /** Размер, px */
  size: number;
}

/** Кнопка «обнять»: счётчик живёт в localStorage, сердечки разлетаются. */
export default function HugCounter() {
  const [count, setCount] = useState(0);
  const [hearts, setHearts] = useState<Heart[]>([]);
  const seq = useRef(0);
  const { reducedMotion } = useMotion();

  // Счётчик читаем после монтирования — иначе разъедется гидратация
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) setCount(parseInt(saved, 10) || 0);
  }, []);

  const hug = useCallback(() => {
    setCount((prev) => {
      const next = prev + 1;
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // приватный режим — просто не сохраняем
      }
      return next;
    });

    if (reducedMotion) return;

    const id = seq.current++;
    const heart: Heart = {
      id,
      dx: Math.round((id % 7) * 22 - 66),
      rot: ((id * 37) % 40) - 20,
      size: 12 + ((id * 13) % 10),
    };
    setHearts((prev) => [...prev, heart]);
    window.setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== id));
    }, 1500);
  }, [reducedMotion]);

  const milestone = hugs.milestones
    .filter((m) => count >= m.at)
    .slice(-1)[0];

  return (
    <section className={styles.root} aria-label={hugs.title}>
      <div className={styles.stage}>
        <button type="button" className={styles.button} onClick={hug}>
          <span className={styles.heartIcon} aria-hidden="true">
            ♥
          </span>
          <span className={styles.buttonLabel}>{hugs.title}</span>

          <span className={styles.burst} aria-hidden="true">
            {hearts.map((h) => (
              <span
                key={h.id}
                className={styles.flyHeart}
                style={{
                  "--dx": `${h.dx}px`,
                  "--rot": `${h.rot}deg`,
                  fontSize: `${h.size}px`,
                } as React.CSSProperties}
              >
                ♥
              </span>
            ))}
          </span>
        </button>

        <p className={styles.hint}>{hugs.hint}</p>

        <div className={styles.readout} aria-live="polite">
          {count > 0 ? (
            <>
              <span className={`${styles.count} display mono-num`}>
                {formatThousands(count)}
              </span>
              {milestone && <span className={styles.milestone}>{milestone.text}</span>}
            </>
          ) : (
            <span className={styles.empty}>ни одного. пока.</span>
          )}
        </div>
      </div>
    </section>
  );
}
