"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import styles from "./Preloader.module.css";

/** Первые фотографии, которые стоит подгрузить заранее. */
const PRELOAD = [
  "/images/couple/01.jpg",
  "/images/couple/02.jpg",
  "/images/couple/03.jpg",
];

const MIN_DURATION = 1800;

export default function Preloader({ onDone }: { onDone: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let loaded = 0;
    let finished = false;
    const started = performance.now();

    const tick = () => {
      loaded += 1;
      setProgress(Math.round((loaded / PRELOAD.length) * 100));
    };

    const loaders = PRELOAD.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new window.Image();
          img.onload = img.onerror = () => {
            tick();
            resolve();
          };
          img.src = src;
        }),
    );

    void Promise.all(loaders).then(() => {
      const wait = Math.max(0, MIN_DURATION - (performance.now() - started));
      window.setTimeout(() => {
        if (finished) return;
        finished = true;
        const ctx = gsap.context(() => {
          gsap.to(rootRef.current, {
            opacity: 0,
            duration: 0.9,
            ease: "power2.inOut",
            onComplete: onDone,
          });
        }, rootRef);
        // ctx умирает вместе с unmount через cleanup ниже
        return () => ctx.revert();
      }, wait);
    });
  }, [onDone]);

  // Число и линия следуют за прогрессом
  useEffect(() => {
    if (numRef.current) {
      numRef.current.textContent = String(progress).padStart(2, "0");
    }
    gsap.to(lineRef.current, {
      scaleX: progress / 100,
      duration: 0.5,
      ease: "power2.out",
      overwrite: true,
    });
  }, [progress]);

  return (
    <div ref={rootRef} className={styles.root} role="status" aria-label="Загрузка">
      <span ref={numRef} className={`${styles.num} mono-num`}>
        00
      </span>
      <span className={styles.track}>
        <span ref={lineRef} className={styles.line} />
      </span>
    </div>
  );
}
