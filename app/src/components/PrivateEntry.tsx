"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { verifyPin } from "@/lib/auth";
import { access } from "@/data/relationship";
import styles from "./PrivateEntry.module.css";

const PIN_LENGTH = 4;

export default function PrivateEntry({ onUnlock }: { onUnlock: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cellsRef = useRef<Array<HTMLSpanElement | null>>([]);
  const [digits, setDigits] = useState<string>("");
  const [state, setState] = useState<"idle" | "checking" | "error">("idle");

  // Мягкое появление экрана
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-entry-fade]", {
        opacity: 0,
        y: 18,
        filter: "blur(8px)",
        duration: 1.4,
        stagger: 0.18,
        ease: "power2.out",
      });
    }, rootRef);
    inputRef.current?.focus({ preventScroll: true });
    return () => ctx.revert();
  }, []);

  const shake = useCallback(() => {
    gsap.fromTo(
      "[data-pin-row]",
      { x: 0 },
      {
        x: 10,
        duration: 0.5,
        ease: "elastic.out(1, 0.25)",
        onStart() {
          gsap.set("[data-pin-row]", { x: -8 });
        },
      },
    );
  }, []);

  const submit = useCallback(
    async (value: string) => {
      setState("checking");
      const ok = await verifyPin(value);
      if (!ok) {
        setState("error");
        shake();
        window.setTimeout(() => {
          setDigits("");
          setState("idle");
          inputRef.current?.focus({ preventScroll: true });
        }, 550);
        return;
      }
      // Экран раскрывается: половины уходят, история проявляется
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({ onComplete: onUnlock });
        tl.to("[data-entry-content]", {
          opacity: 0,
          filter: "blur(10px)",
          scale: 0.97,
          duration: 0.7,
          ease: "power2.in",
        })
          .to(
            "[data-entry-top]",
            { yPercent: -100, duration: 1.2, ease: "power4.inOut" },
            "-=0.15",
          )
          .to(
            "[data-entry-bottom]",
            { yPercent: 100, duration: 1.2, ease: "power4.inOut" },
            "<",
          );
      }, rootRef);
      void ctx;
    },
    [onUnlock, shake],
  );

  const handleChange = (raw: string) => {
    if (state === "checking") return;
    const next = raw.replace(/\D/g, "").slice(0, PIN_LENGTH);
    setDigits(next);
    setState("idle");
    if (next.length === PIN_LENGTH) void submit(next);
  };

  return (
    <div ref={rootRef} className={styles.root}>
      <div data-entry-top className={`${styles.half} ${styles.top}`} />
      <div data-entry-bottom className={`${styles.half} ${styles.bottom}`} />

      <div data-entry-content className={styles.content}>
        <p data-entry-fade className={`${styles.phrase} display`}>
          Это место существует
          <br />
          только для нас.
        </p>

        <div data-entry-fade className={styles.pinBlock}>
          <div className={styles.pinField}>
            <span data-pin-row className={styles.row}>
              {Array.from({ length: PIN_LENGTH }, (_, i) => (
                <span
                  key={i}
                  ref={(el) => {
                    cellsRef.current[i] = el;
                  }}
                  className={`${styles.cell} ${
                    digits[i] ? styles.cellFilled : ""
                  } ${state === "error" ? styles.cellError : ""}`}
                  aria-hidden="true"
                >
                  {digits[i] ? "•" : ""}
                </span>
              ))}
            </span>
            <input
              ref={inputRef}
              className={styles.pinInput}
              inputMode="numeric"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              maxLength={PIN_LENGTH}
              value={digits}
              onChange={(e) => handleChange(e.target.value)}
              aria-label={`PIN-код из ${PIN_LENGTH} цифр. Подсказка: ${access.hint}`}
              aria-invalid={state === "error"}
            />
          </div>
          <span className={styles.hint}>{access.hint}</span>
          {state === "error" && (
            <span className={styles.error} role="alert">
              не эта дата
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
