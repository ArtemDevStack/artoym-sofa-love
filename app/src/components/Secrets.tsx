"use client";

import { useEffect } from "react";
import { gsap } from "@/lib/gsap";
import { useSecrets, TOTAL_SECRETS } from "@/hooks/useSecrets";
import styles from "./Secrets.module.css";

/**
 * Спрятанный секрет. Выглядит как едва заметная деталь интерфейса —
 * не как кнопка. kind задаёт форму: звезда, точка, символ, текст.
 */
export function SecretHotspot({
  id,
  kind = "dot",
  children,
  className,
  ariaLabel = "Что-то здесь спрятано",
}: {
  id: string;
  kind?: "dot" | "star" | "text";
  children?: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  const { found, discover } = useSecrets();
  const isFound = found.has(id);

  return (
    <button
      type="button"
      data-cursor="secret"
      data-secret={id}
      aria-label={ariaLabel}
      aria-pressed={isFound}
      className={`${styles.hotspot} ${styles[kind]} ${
        isFound ? styles.found : ""
      } ${className ?? ""}`}
      onClick={(e) => {
        // Секрет может лежать поверх другого интерактива — не всплываем
        e.stopPropagation();
        discover(id);
      }}
    >
      {children ?? (kind === "star" ? "✶" : kind === "dot" ? "·" : null)}
    </button>
  );
}

/** Индикатор «3 / 7» + тост «Секрет N из 7 найден». */
export function SecretIndicator() {
  const { count, lastFoundIndex, clearToast, allFound } = useSecrets();

  useEffect(() => {
    if (lastFoundIndex === null) return;
    const toast = document.querySelector(`.${styles.toast}`);
    if (toast) {
      gsap.fromTo(
        toast,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
      );
    }
    const id = window.setTimeout(clearToast, 3200);
    return () => window.clearTimeout(id);
  }, [lastFoundIndex, clearToast]);

  return (
    <>
      <div
        className={styles.counter}
        aria-label={`Найдено секретов: ${count} из ${TOTAL_SECRETS}`}
      >
        <span className="mono-num">
          {count} / {TOTAL_SECRETS}
        </span>
        {allFound && <span className={styles.unlocked}>всё найдено</span>}
      </div>
      {lastFoundIndex !== null && (
        <div className={styles.toast} role="status">
          Секрет {lastFoundIndex} из {TOTAL_SECRETS} найден.
        </div>
      )}
    </>
  );
}
