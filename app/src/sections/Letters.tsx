"use client";

import { useCallback, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMotion } from "@/lib/motion";
import { SecretHotspot } from "@/components/Secrets";
import { letters } from "@/data/relationship";
import type { Letter } from "@/types/relationship";
import styles from "./Letters.module.css";

/**
 * «Открой, когда…» — коллекция писем. Конверт действительно
 * открывается: клапан → письмо выдвигается → сообщение раскрывается.
 */
export default function Letters() {
  const rootRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [openLetter, setOpenLetter] = useState<Letter | null>(null);
  const { reducedMotion } = useMotion();

  useGSAP(
    () => {
      if (reducedMotion) {
        gsap.set("[data-envelope]", { opacity: 1 });
        return;
      }
      gsap.fromTo(
        "[data-envelope]",
        { opacity: 0, y: 44 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.09,
          ease: "power3.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 70%", once: true },
        },
      );
    },
    { scope: rootRef, dependencies: [reducedMotion] },
  );

  /** Анимация открытия конкретного конверта, затем раскрытие письма. */
  const open = useCallback(
    (letter: Letter) => {
      const env = rootRef.current?.querySelector(`[data-envelope="${letter.id}"]`);
      const flap = env?.querySelector("[data-flap]");
      const paper = env?.querySelector("[data-paper]");

      if (reducedMotion || !flap || !paper) {
        setOpenLetter(letter);
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => setOpenLetter(letter),
      });
      tl.to(flap, { rotateX: -180, duration: 0.55, ease: "power2.inOut" })
        .set(flap, { zIndex: 1 })
        .to(paper, { yPercent: -52, duration: 0.6, ease: "power2.out" }, "-=0.1");
    },
    [reducedMotion],
  );

  const close = useCallback(() => {
    const overlay = overlayRef.current;
    const finish = () => {
      setOpenLetter(null);
      // Конверт закрывается обратно
      const env = rootRef.current?.querySelector(
        `[data-envelope="${openLetter?.id}"]`,
      );
      const flap = env?.querySelector("[data-flap]");
      const paper = env?.querySelector("[data-paper]");
      if (flap && paper && !reducedMotion) {
        const tl = gsap.timeline();
        tl.to(paper, { yPercent: 0, duration: 0.45, ease: "power2.in" })
          .set(flap, { zIndex: 4 })
          .to(flap, { rotateX: 0, duration: 0.5, ease: "power2.inOut" });
      }
    };

    if (overlay && !reducedMotion) {
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
        onComplete: finish,
      });
    } else {
      finish();
    }
  }, [openLetter, reducedMotion]);

  // Появление раскрытого письма
  useGSAP(
    () => {
      if (!openLetter || !overlayRef.current) return;
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.45, ease: "power2.out" },
      );
      gsap.fromTo(
        "[data-letter-sheet]",
        { y: 60, rotate: 1.5, opacity: 0 },
        { y: 0, rotate: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.1 },
      );
      overlayRef.current.querySelector<HTMLElement>("button")?.focus();
    },
    { dependencies: [openLetter] },
  );

  return (
    <section ref={rootRef} id="letters" className={styles.root} aria-label="Письма">
      <h2 className={`${styles.heading} display`}>Открой, когда…</h2>

      <ul className={styles.envelopes}>
        {letters.map((letter, i) => (
          <li key={letter.id} className={styles.envelopeWrap}>
            <button
              type="button"
              data-envelope={letter.id}
              data-cursor="open"
              className={styles.envelope}
              onClick={() => open(letter)}
              aria-label={`Открыть письмо: ${letter.trigger}`}
            >
              <span className={styles.envBack} aria-hidden="true" />
              <span data-paper className={styles.paper} aria-hidden="true" />
              <span className={styles.envPocket} aria-hidden="true" />
              <span data-flap className={styles.flap} aria-hidden="true" />
              <span className={styles.trigger}>{letter.trigger}</span>
            </button>
            {i === 0 && (
              /* Секрет 6 — марка на первом конверте */
              <SecretHotspot
                id="secret-6"
                kind="star"
                className={styles.stamp}
                ariaLabel="Почтовая марка"
              />
            )}
          </li>
        ))}
      </ul>

      {openLetter && (
        <div
          ref={overlayRef}
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label={openLetter.trigger}
          onClick={close}
        >
          <div
            data-letter-sheet
            className={styles.sheet}
            onClick={(e) => e.stopPropagation()}
          >
            <p className={styles.sheetTrigger}>{openLetter.trigger}</p>
            <p className={`${styles.sheetBody} display`}>{openLetter.body}</p>
            {openLetter.signature && (
              <p className={styles.sheetSignature}>— {openLetter.signature}</p>
            )}
            <button type="button" className={styles.close} onClick={close}>
              закрыть и спрятать обратно
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
