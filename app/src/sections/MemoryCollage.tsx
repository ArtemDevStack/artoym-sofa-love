"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMotion } from "@/lib/motion";
import Photo from "@/components/Photo";
import { SecretHotspot } from "@/components/Secrets";
import { collagePhotos } from "@/data/relationship";
import styles from "./MemoryCollage.module.css";

/** Свободная раскладка: позиция, размер и наклон каждого кадра. */
const LAYOUT = [
  { left: "6%", top: "6%", width: "30%", ratio: "3/4" },
  { left: "44%", top: "2%", width: "24%", ratio: "1/1" },
  { left: "74%", top: "12%", width: "20%", ratio: "3/4" },
  { left: "12%", top: "52%", width: "22%", ratio: "1/1" },
  { left: "40%", top: "46%", width: "28%", ratio: "4/3" },
  { left: "72%", top: "58%", width: "22%", ratio: "3/4" },
];

/** Направления, из которых кадры влетают в сцену. */
const DIRECTIONS = [
  { x: -90, y: -30 },
  { x: 0, y: -110 },
  { x: 90, y: -40 },
  { x: -80, y: 70 },
  { x: 0, y: 120 },
  { x: 90, y: 60 },
];

export default function MemoryCollage() {
  const rootRef = useRef<HTMLElement>(null);
  const { reducedMotion, isMobile } = useMotion();

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>("[data-collage-item]");

      if (reducedMotion) {
        gsap.set(items, { opacity: 1 });
        return;
      }

      items.forEach((item, i) => {
        const dir = DIRECTIONS[i % DIRECTIONS.length];
        const k = isMobile ? 0.45 : 1;
        gsap.fromTo(
          item,
          {
            opacity: 0,
            x: dir.x * k,
            y: dir.y * k,
            scale: 0.85,
            rotate: (collagePhotos[i]?.tilt ?? 0) * 2.2,
          },
          {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotate: collagePhotos[i]?.tilt ?? 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: rootRef.current,
              start: `top ${78 - i * 6}%`,
              end: `top ${30 - i * 3}%`,
              scrub: 0.7,
            },
          },
        );
      });
    },
    { scope: rootRef, dependencies: [reducedMotion, isMobile] },
  );

  // Деликатный tilt за курсором — только desktop
  const handleMove = (e: React.MouseEvent<HTMLElement>) => {
    if (isMobile || reducedMotion) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(card, {
      rotateX: py * -5,
      rotateY: px * 5,
      scale: 1.03,
      duration: 0.5,
      ease: "power2.out",
      transformPerspective: 800,
    });
  };

  const handleLeave = (e: React.MouseEvent<HTMLElement>) => {
    gsap.to(e.currentTarget, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.7,
      ease: "power3.out",
    });
  };

  return (
    <section ref={rootRef} className={styles.root} aria-label="Коллекция воспоминаний">
      <p className={`${styles.heading} eyebrow`}>разбросанные моменты</p>

      <div className={styles.field}>
        {collagePhotos.map((memory, i) => {
          const pos = LAYOUT[i % LAYOUT.length];
          return (
            <figure
              key={memory.id}
              data-collage-item
              data-cursor="view"
              className={styles.item}
              style={{
                left: pos.left,
                top: pos.top,
                width: pos.width,
                aspectRatio: pos.ratio,
                zIndex: i + 1,
              }}
              onMouseMove={handleMove}
              onMouseLeave={handleLeave}
            >
              {memory.video ? (
                <video
                  src={memory.video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "2px" }}
                />
              ) : (
                <Photo
                  src={memory.photo}
                  alt={memory.caption ?? `Воспоминание ${i + 1}`}
                  sizes="(max-width: 768px) 44vw, 28vw"
                />
              )}
              {memory.caption && (
                <figcaption className={styles.caption}>{memory.caption}</figcaption>
              )}
            </figure>
          );
        })}

        {/* Секрет 5 — пустое место между воспоминаниями */}
        <SecretHotspot
          id="secret-5"
          kind="dot"
          className={styles.hiddenSpot}
          ariaLabel="Пустое место между фотографиями"
        />
      </div>
    </section>
  );
}
