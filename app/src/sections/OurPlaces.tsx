"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMotion } from "@/lib/motion";
import Photo from "@/components/Photo";
import { places } from "@/data/relationship";
import styles from "./OurPlaces.module.css";

/**
 * Абстрактная карта важных мест — без внешних API.
 * Координаты (x/y, %) берутся из data-файла; позже сюда можно
 * подключить Mapbox/Yandex Maps, заменив только этот компонент.
 */
export default function OurPlaces() {
  const rootRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(places[0]?.id);
  const { reducedMotion } = useMotion();
  const active = places.find((p) => p.id === activeId) ?? places[0];

  useGSAP(
    () => {
      if (reducedMotion) return;
      gsap.fromTo(
        "[data-place-dot]",
        { opacity: 0, scale: 0 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: "back.out(2)",
          scrollTrigger: { trigger: rootRef.current, start: "top 65%", once: true },
        },
      );
    },
    { scope: rootRef, dependencies: [reducedMotion] },
  );

  const select = (id: string) => {
    if (id === activeId) return;
    setActiveId(id);
    if (panelRef.current && !reducedMotion) {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" },
      );
    }
  };

  if (!active) return null;

  return (
    <section ref={rootRef} id="places" className={styles.root} aria-label="Наши места">
      <p className={`${styles.heading} eyebrow`}>места, которые наши</p>

      <div className={styles.layout}>
        <div className={styles.map} role="group" aria-label="Карта воспоминаний">
          {/* Абстрактные «изолинии» вместо реальной карты */}
          <svg className={styles.contours} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path d="M-5,30 C20,18 45,40 70,26 S95,30 105,22" />
            <path d="M-5,55 C15,44 50,66 75,50 S95,58 105,48" />
            <path d="M-5,80 C25,70 40,90 65,74 S90,84 105,76" />
            <path d="M20,-5 C26,25 12,55 24,80 S22,95 26,105" />
            <path d="M60,-5 C54,30 70,50 58,78 S62,95 56,105" />
          </svg>

          {places.map((place) => (
            <button
              key={place.id}
              type="button"
              data-place-dot
              data-cursor="view"
              className={`${styles.dot} ${place.id === activeId ? styles.dotActive : ""}`}
              style={{ left: `${place.x}%`, top: `${place.y}%` }}
              onClick={() => select(place.id)}
              aria-label={`${place.name}, ${place.date}`}
              aria-pressed={place.id === activeId}
            >
              <span className={styles.dotCore} />
              <span className={styles.dotPulse} aria-hidden="true" />
            </button>
          ))}
        </div>

        <div ref={panelRef} key={active.id} className={styles.panel} aria-live="polite">
          <div className={styles.panelPhoto} data-cursor="view">
            <Photo src={active.photo} alt={active.name} sizes="(max-width: 900px) 90vw, 34vw" />
          </div>
          <div className={styles.panelText}>
            <p className={styles.panelDate}>{active.date}</p>
            <h3 className={`${styles.panelName} display`}>{active.name}</h3>
            <p className={styles.panelMemory}>{active.memory}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
