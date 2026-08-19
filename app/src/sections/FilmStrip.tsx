"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMotion } from "@/lib/motion";
import Photo from "@/components/Photo";
import { SecretHotspot } from "@/components/Secrets";
import { filmFrames } from "@/data/relationship";
import styles from "./FilmStrip.module.css";

/**
 * Горизонтальная киноплёнка: вертикальный скролл прокручивает
 * кадры горизонтально (pinned ScrollTrigger).
 */
export default function FilmStrip() {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { reducedMotion, isMobile } = useMotion();

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;

      if (reducedMotion) {
        // Без движения: превращаем в нативную горизонтальную прокрутку
        track.parentElement?.classList.add(styles.nativeScroll);
        return;
      }

      const getDistance = () => track.scrollWidth - window.innerWidth;

      gsap.to(track, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: () => `+=${getDistance()}`,
          pin: true,
          scrub: isMobile ? true : 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Лёгкая глубина: кадры чуть «дышат» по вертикали
      gsap.utils.toArray<HTMLElement>("[data-frame]").forEach((frame, i) => {
        gsap.fromTo(
          frame,
          { y: i % 2 === 0 ? 14 : -14 },
          {
            y: i % 2 === 0 ? -14 : 14,
            ease: "none",
            scrollTrigger: {
              trigger: rootRef.current,
              start: "top top",
              end: () => `+=${getDistance()}`,
              scrub: true,
            },
          },
        );
      });
    },
    { scope: rootRef, dependencies: [reducedMotion, isMobile] },
  );

  return (
    <section ref={rootRef} id="film" className={styles.root} aria-label="Киноплёнка">
      <p className={`${styles.heading} eyebrow`}>плёнка · кадры, которые мы храним</p>
      <div className={styles.viewport}>
        <div ref={trackRef} className={styles.track}>
          {filmFrames.map((frame, i) => (
            <figure key={frame.id} data-frame className={styles.frame} data-cursor="view">
              <span className={styles.holes} aria-hidden="true" />
              <div className={styles.photoWrap}>
                <Photo
                  src={frame.photo}
                  alt={frame.phrase ?? `Кадр ${i + 1}`}
                  sizes="(max-width: 768px) 80vw, 46vw"
                />
              </div>
              <figcaption className={styles.meta}>
                <span className="mono-num">{String(i + 1).padStart(2, "0")}</span>
                {frame.date && <span>{frame.date}</span>}
                {frame.place && <span>{frame.place}</span>}
                {frame.phrase && <em>«{frame.phrase}»</em>}
                {i === filmFrames.length - 2 && (
                  /* Секрет 4 — кадр, которого не должно было быть */
                  <SecretHotspot
                    id="secret-4"
                    kind="text"
                    className={styles.extraFrame}
                    ariaLabel="Странный номер кадра"
                  >
                    24½
                  </SecretHotspot>
                )}
              </figcaption>
              <span className={`${styles.holes} ${styles.holesBottom}`} aria-hidden="true" />
            </figure>
          ))}
          <div className={styles.endSpacer} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
