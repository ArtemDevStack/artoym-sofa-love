"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMotion } from "@/lib/motion";
import { artifacts } from "@/data/relationship";
import styles from "./OnlyWeUnderstand.module.css";

/**
 * «Только мы поймём» — коллекция маленьких артефактов отношений.
 * Не grid-карточки: свободная россыпь музейных этикеток.
 */
export default function OnlyWeUnderstand() {
  const rootRef = useRef<HTMLElement>(null);
  const { reducedMotion } = useMotion();

  useGSAP(
    () => {
      if (reducedMotion) {
        gsap.set("[data-artifact]", { opacity: 1 });
        return;
      }
      gsap.fromTo(
        "[data-artifact]",
        { opacity: 0, y: 36, rotate: 0 },
        {
          opacity: 1,
          y: 0,
          rotate: (i) => artifacts[i]?.tilt ?? 0,
          duration: 0.9,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 70%", once: true },
        },
      );
    },
    { scope: rootRef, dependencies: [reducedMotion] },
  );

  return (
    <section ref={rootRef} className={styles.root} aria-label="Только мы поймём">
      <h2 className={`${styles.heading} display`}>Только мы поймём</h2>

      <ul className={styles.scatter}>
        {artifacts.map((artifact, i) => (
          <li
            key={artifact.id}
            data-artifact
            className={styles.artifact}
            style={{
              rotate: `${artifact.tilt}deg`,
              marginTop: `${(i % 3) * 28}px`,
            }}
          >
            <span className={styles.label}>{artifact.label}</span>
            <span className={`${styles.value} display`}>{artifact.value}</span>
            {artifact.note && <span className={styles.note}>{artifact.note}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}
