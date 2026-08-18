"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMotion } from "@/lib/motion";
import Photo from "@/components/Photo";
import { SecretHotspot } from "@/components/Secrets";
import { timeline } from "@/data/relationship";
import type { TimelineEvent } from "@/types/relationship";
import styles from "./Timeline.module.css";

/**
 * Кинематографичный timeline: каждое событие — полноэкранная сцена
 * со своей механикой (wipe / blur / curtain / slide / iris / rise).
 */
export default function Timeline() {
  const rootRef = useRef<HTMLElement>(null);
  const { reducedMotion, isMobile } = useMotion();

  useGSAP(
    () => {
      const scenes = gsap.utils.toArray<HTMLElement>("[data-scene]");

      scenes.forEach((sceneEl) => {
        const kind = sceneEl.dataset.scene as TimelineEvent["scene"];
        const date = sceneEl.querySelector("[data-t-date]");
        const photo = sceneEl.querySelector("[data-t-photo]");
        const img = sceneEl.querySelector("[data-t-photo] img, [data-t-photo] [data-ph]") ?? sceneEl.querySelector("[data-t-photo]");
        const text = sceneEl.querySelector("[data-t-text]");

        if (reducedMotion) {
          gsap.set([date, photo, text], { opacity: 1, clearProps: "filter,clipPath,transform" });
          return;
        }

        const st = (from: gsap.TweenVars, to: gsap.TweenVars) =>
          gsap.fromTo(photo, from, {
            ...to,
            ease: "none",
            scrollTrigger: {
              trigger: sceneEl,
              start: "top 85%",
              end: "top 15%",
              scrub: 0.6,
            },
          });

        // Механика раскрытия фотографии — у каждой сцены своя
        switch (kind) {
          case "wipe":
            st({ clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)" });
            break;
          case "blur":
            st(
              { filter: "blur(22px)", scale: 1.16, opacity: 0.35 },
              { filter: "blur(0px)", scale: 1, opacity: 1 },
            );
            break;
          case "curtain":
            st({ clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)" });
            break;
          case "slide":
            st({ xPercent: isMobile ? 12 : 26, opacity: 0.25 }, { xPercent: 0, opacity: 1 });
            break;
          case "iris":
            st({ clipPath: "circle(6% at 50% 50%)" }, { clipPath: "circle(75% at 50% 50%)" });
            break;
          case "rise":
            st({ yPercent: 22, opacity: 0.2, rotate: 1.5 }, { yPercent: 0, opacity: 1, rotate: 0 });
            break;
        }

        // Параллакс внутри кадра
        if (img) {
          gsap.fromTo(
            img,
            { yPercent: -6, scale: 1.12 },
            {
              yPercent: 6,
              scale: 1.12,
              ease: "none",
              scrollTrigger: {
                trigger: photo as Element,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        }

        // Дата — крупная типографика, появляется своим движением
        gsap.fromTo(
          date,
          { opacity: 0, y: 60, filter: "blur(6px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: { trigger: sceneEl, start: "top 70%", once: true },
          },
        );

        gsap.fromTo(
          text,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: 0.15,
            scrollTrigger: { trigger: sceneEl, start: "top 62%", once: true },
          },
        );
      });
    },
    { scope: rootRef, dependencies: [reducedMotion, isMobile] },
  );

  return (
    <section ref={rootRef} id="timeline" className={styles.root} aria-label="Как всё началось">
      <header className={styles.header}>
        <p className="eyebrow">как всё началось</p>
      </header>

      {timeline.map((event, i) => (
        <article key={event.id} data-scene={event.scene} className={styles.scene}>
          <div className={styles.inner}>
            <h3 data-t-date className={`${styles.date} display`}>
              {event.id === "meeting" ? (
                /* Секрет 2 — эта дата кликабельна */
                <SecretHotspot id="secret-2" kind="text" ariaLabel="Дата, за которой что-то спрятано">
                  {event.date}
                </SecretHotspot>
              ) : (
                event.date
              )}
            </h3>

            <div data-t-photo className={styles.photo} data-cursor="view">
              <Photo src={event.photo} alt={event.title} index={i + 1} sizes="(max-width: 768px) 92vw, 56vw" />
            </div>

            <div data-t-text className={styles.text}>
              <h4 className={`${styles.title} display`}>{event.title}</h4>
              <p className={styles.description}>{event.description}</p>
              {event.location && (
                <p className={styles.location}>{event.location}</p>
              )}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
