"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { scrollToTarget, useMotion } from "@/lib/motion";
import Photo from "@/components/Photo";
import { SecretHotspot } from "@/components/Secrets";
import { relationship } from "@/data/relationship";
import styles from "./FinalScene.module.css";

/** Финал: одна фотография, одна фраза — и «продолжение следует…». */
export default function FinalScene() {
  const rootRef = useRef<HTMLElement>(null);
  const { reducedMotion, lenis } = useMotion();
  const year = new Date().getFullYear();

  useGSAP(
    () => {
      if (reducedMotion) {
        gsap.set("[data-final-photo], [data-final-line], [data-final-more]", {
          opacity: 1,
        });
        return;
      }

      gsap.fromTo(
        "[data-final-photo] img, [data-final-photo] [data-ph]",
        { scale: 1.14 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        },
      );

      gsap.fromTo(
        "[data-final-line]",
        { opacity: 0, y: 30, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          stagger: 0.25,
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 45%", once: true },
        },
      );

      gsap.fromTo(
        "[data-final-more]",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: { trigger: "[data-final-more]", start: "top 92%", once: true },
        },
      );
    },
    { scope: rootRef, dependencies: [reducedMotion] },
  );

  return (
    <section ref={rootRef} id="finale" className={styles.root} aria-label="Финал">
      <div className={styles.stage}>
        <div data-final-photo className={styles.photo}>
          <Photo
            src="/images/couple/06.jpg"
            alt="Мы вдвоём"
            index={6}
            sizes="100vw"
          />
        </div>

        <div className={styles.text}>
          <h2 data-final-line className={`${styles.phrase} display`}>
            И это только начало
            {/* Секрет 7 — точка в конце фразы */}
            <SecretHotspot
              id="secret-7"
              kind="dot"
              className={styles.finalDot}
              ariaLabel="Точка"
            />
          </h2>
          <p data-final-line className={styles.names}>
            {relationship.partnerA} × {relationship.partnerB}
          </p>
          <p data-final-line className={`${styles.year} mono-num`}>{year}</p>
        </div>
      </div>

      <div data-final-more className={styles.more}>
        <p className={`${styles.continue} display`}>Продолжение следует…</p>
        <button
          type="button"
          className={styles.replay}
          onClick={() => scrollToTarget(lenis, 0)}
        >
          Пережить всё ещё раз
        </button>
      </div>
    </section>
  );
}
