"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMotion } from "@/lib/motion";
import { loveLetter } from "@/data/relationship";
import styles from "./LoveLetter.module.css";

/**
 * Digital love letter: почти без визуального шума.
 * Строки проявляются из blur при скролле — читается медленно.
 */
export default function LoveLetter() {
  const rootRef = useRef<HTMLElement>(null);
  const { reducedMotion } = useMotion();

  useGSAP(
    () => {
      const lines = gsap.utils.toArray<HTMLElement>("[data-letter-line]");
      lines.forEach((line) => {
        if (reducedMotion) {
          gsap.set(line, { opacity: 1, filter: "blur(0px)" });
          return;
        }
        gsap.fromTo(
          line,
          { opacity: 0.08, filter: "blur(7px)", y: 24 },
          {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            ease: "power1.out",
            scrollTrigger: {
              trigger: line,
              start: "top 82%",
              end: "top 46%",
              scrub: 0.5,
            },
          },
        );
      });
    },
    { scope: rootRef, dependencies: [reducedMotion] },
  );

  return (
    <section ref={rootRef} id="letter" className={styles.root} aria-label="Письмо тебе">
      <h2 className={`${styles.heading} display`}>
        И ещё кое-что, что я хотел тебе сказать.
      </h2>

      <div className={styles.letter}>
        {loveLetter.map((line, i) => (
          <p key={i} data-letter-line className={`${styles.line} display`}>
            {line}
          </p>
        ))}
      </div>
    </section>
  );
}
