"use client";

import { useCallback, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMotion } from "@/lib/motion";
import { reasons } from "@/data/relationship";
import styles from "./Reasons.module.css";

/** «Почему я тебя люблю» — причины появляются одна за другой при скролле. */
export default function Reasons() {
  const rootRef = useRef<HTMLElement>(null);
  const extraRef = useRef<HTMLParagraphElement>(null);
  const [extra, setExtra] = useState<string | null>(null);
  const { reducedMotion } = useMotion();

  useGSAP(
    () => {
      const rows = gsap.utils.toArray<HTMLElement>("[data-reason]");
      rows.forEach((row) => {
        if (reducedMotion) {
          gsap.set(row, { opacity: 1 });
          return;
        }
        gsap.fromTo(
          row,
          { opacity: 0, x: -28, filter: "blur(4px)" },
          {
            opacity: 1,
            x: 0,
            filter: "blur(0px)",
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: { trigger: row, start: "top 82%", once: true },
          },
        );
      });
    },
    { scope: rootRef, dependencies: [reducedMotion] },
  );

  const showRandom = useCallback(() => {
    const pool = reasons.filter((r) => r.text !== extra);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setExtra(pick.text);
    if (extraRef.current && !reducedMotion) {
      gsap.fromTo(
        extraRef.current,
        { opacity: 0, y: 18, filter: "blur(6px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: "power3.out" },
      );
    }
  }, [extra, reducedMotion]);

  return (
    <section ref={rootRef} className={styles.root} aria-label="Почему я тебя люблю">
      <h2 className={`${styles.heading} display`}>
        Иногда мне сложно объяснить почему.
        <br />
        Но я попробую.
      </h2>

      <ol className={styles.list}>
        {reasons.slice(0, 5).map((reason, i) => (
          <li key={reason.id} data-reason className={styles.reason}>
            <span className={`${styles.num} mono-num`}>{String(i + 1).padStart(2, "0")}</span>
            <span className={styles.dash} aria-hidden="true">—</span>
            <span className={`${styles.text} display`}>{reason.text}</span>
          </li>
        ))}
      </ol>

      <div className={styles.more}>
        <button type="button" className={styles.moreButton} onClick={showRandom}>
          <span className={styles.icon}>✨</span>
          <span>Нажми, чтобы узнать ещё одну причину</span>
          <span className={styles.arrow}>→</span>
        </button>
        {extra && (
          <p ref={extraRef} className={`${styles.extra} display`} aria-live="polite">
            {extra}
          </p>
        )}
      </div>
    </section>
  );
}
