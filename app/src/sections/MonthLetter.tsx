"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMotion } from "@/lib/motion";
import { monthLetter } from "@/data/relationship";
import styles from "./MonthLetter.module.css";

/**
 * Конверт, который открывается по клику: клапан отходит,
 * письмо выезжает наружу. Закрывается обратно сколько угодно раз.
 */
export default function MonthLetter() {
  const rootRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const { reducedMotion } = useMotion();

  useGSAP(
    () => {
      if (reducedMotion) return;
      gsap.fromTo(
        "[data-ml-stage]",
        { opacity: 0, y: 44 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          scrollTrigger: { trigger: rootRef.current, start: "top 68%", once: true },
        },
      );
    },
    { scope: rootRef, dependencies: [reducedMotion] },
  );

  return (
    <section ref={rootRef} className={styles.root} aria-label={monthLetter.title}>
      <div data-ml-stage className={styles.stage}>
        {!open ? (
          <button
            type="button"
            className={styles.envelope}
            onClick={() => setOpen(true)}
            aria-label={`${monthLetter.title} — открыть`}
          >
            <span className={styles.flap} aria-hidden="true" />
            <span className={styles.seal} aria-hidden="true">
              {monthLetter.seal}
            </span>
            <span className={styles.to}>{monthLetter.envelopeTo}</span>
            <span className={`${styles.cta} eyebrow`}>{monthLetter.eyebrow}</span>
          </button>
        ) : (
          <article className={styles.sheet}>
            <h2 className={`${styles.title} display`}>{monthLetter.title}</h2>

            <div className={styles.body}>
              {monthLetter.lines.map((line, i) => (
                <p key={i} className={styles.line}>
                  {line}
                </p>
              ))}
            </div>

            <p className={styles.signature}>{monthLetter.signature}</p>
            {monthLetter.ps && <p className={styles.ps}>{monthLetter.ps}</p>}

            <button
              type="button"
              className={styles.close}
              onClick={() => setOpen(false)}
            >
              сложить обратно
            </button>
          </article>
        )}
      </div>
    </section>
  );
}
