"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMotion } from "@/lib/motion";
import { futurePlans } from "@/data/relationship";
import styles from "./Future.module.css";

const KIND_LABEL: Record<string, string> = {
  trip: "поездка",
  dream: "мечта",
  promise: "обещание",
  todo: "сделать вместе",
};

/**
 * Будущее: секция символически светлеет — past → present → future.
 */
export default function Future() {
  const rootRef = useRef<HTMLElement>(null);
  const { reducedMotion } = useMotion();

  useGSAP(
    () => {
      if (!reducedMotion) {
        // Фон секции мягко светлеет при приближении
        gsap.fromTo(
          rootRef.current,
          { backgroundColor: "#0f0e0c" },
          {
            backgroundColor: "#221d17",
            ease: "none",
            scrollTrigger: {
              trigger: rootRef.current,
              start: "top 90%",
              end: "top 20%",
              scrub: 0.6,
            },
          },
        );

        gsap.fromTo(
          "[data-plan]",
          { opacity: 0, y: 34 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: { trigger: "[data-plans]", start: "top 75%", once: true },
          },
        );
      } else {
        gsap.set(rootRef.current, { backgroundColor: "#221d17" });
        gsap.set("[data-plan]", { opacity: 1 });
      }
    },
    { scope: rootRef, dependencies: [reducedMotion] },
  );

  return (
    <section ref={rootRef} className={styles.root} aria-label="Наше будущее">
      <h2 className={`${styles.heading} display`}>
        Но больше всего мне нравится то, что наша история ещё не закончилась.
      </h2>

      <ul data-plans className={styles.plans}>
        {futurePlans.map((plan, i) => (
          <li key={plan.id} data-plan className={styles.plan}>
            <span className={`${styles.planNum} mono-num`}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className={styles.planKind}>{KIND_LABEL[plan.kind]}</span>
            <span className={`${styles.planText} display`}>{plan.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
