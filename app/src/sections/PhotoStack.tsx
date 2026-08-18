"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMotion } from "@/lib/motion";
import Photo from "@/components/Photo";
import { SecretHotspot } from "@/components/Secrets";
import { stackPhotos } from "@/data/relationship";
import styles from "./PhotoStack.module.css";

/**
 * Стопка распечатанных фотографий: верхняя при скролле
 * поворачивается, сдвигается и улетает, открывая следующую.
 */
export default function PhotoStack() {
  const rootRef = useRef<HTMLElement>(null);
  const { reducedMotion, isMobile } = useMotion();

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-stack-card]");
      if (reducedMotion || cards.length === 0) {
        // Статично: просто слегка разведённая стопка
        cards.forEach((c, i) =>
          gsap.set(c, { rotate: stackPhotos[i]?.tilt ?? 0, y: i * 10, opacity: 1 }),
        );
        return;
      }

      // Исходное положение — аккуратная стопка с разными наклонами
      cards.forEach((c, i) => {
        gsap.set(c, {
          rotate: stackPhotos[i]?.tilt ?? 0,
          y: i * 6,
          zIndex: cards.length - i,
        });
      });

      const tl = gsap.timeline({
        defaults: { ease: "power1.in" },
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: `+=${(cards.length - 1) * 90}%`,
          pin: true,
          scrub: 0.7,
          anticipatePin: 1,
        },
      });

      // Каждая верхняя карточка улетает по-своему
      cards.slice(0, -1).forEach((card, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        tl.to(
          card,
          {
            xPercent: dir * (isMobile ? 90 : 130),
            yPercent: -14 - i * 4,
            rotate: dir * (16 + i * 3),
            opacity: 0,
            duration: 1,
          },
          i,
        );
        // Следующая карточка выравнивается на место верхней
        const next = cards[i + 1];
        tl.to(
          next,
          { rotate: (stackPhotos[i + 1]?.tilt ?? 0) * 0.4, y: 0, duration: 1 },
          i + 0.15,
        );
      });
    },
    { scope: rootRef, dependencies: [reducedMotion, isMobile] },
  );

  return (
    <section ref={rootRef} id="stack" className={styles.root} aria-label="Стопка воспоминаний">
      <p className={`${styles.heading} eyebrow`}>воспоминания · перелистай</p>
      <div className={styles.stack}>
        {stackPhotos.map((memory, i) => (
          <figure
            key={memory.id}
            data-stack-card
            className={styles.card}
            data-cursor="view"
          >
            <div className={styles.photoWrap}>
              <Photo
                src={memory.photo}
                alt={memory.caption ?? `Воспоминание ${i + 1}`}
                sizes="(max-width: 768px) 78vw, 420px"
              />
              {i === 0 && (
                /* Секрет 3 — карандашная пометка на первой распечатке */
                <SecretHotspot
                  id="secret-3"
                  kind="text"
                  className={styles.pencilMark}
                  ariaLabel="Карандашная пометка"
                >
                  ✎
                </SecretHotspot>
              )}
            </div>
            {memory.caption && (
              <figcaption className={styles.caption}>{memory.caption}</figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}
