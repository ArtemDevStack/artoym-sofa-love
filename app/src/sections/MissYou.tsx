"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMotion } from "@/lib/motion";
import { missYou, soundCues } from "@/data/relationship";
import { useSoundtrack } from "@/context/SoundtrackContext";
import styles from "./MissYou.module.css";

/** Сколько держать до 100 % */
const FULL_MS = 3200;
/** Насколько быстрее шкала оседает обратно, когда отпустили */
const RELEASE_FACTOR = 2.5;

/**
 * «Скучаю» — кнопку нужно удерживать. Шкала наполняется,
 * подписи меняются, на 100% остаётся финальная строка.
 */
export default function MissYou() {
  const [progress, setProgress] = useState(0);
  const [held, setHeld] = useState(false);
  const [done, setDone] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { reducedMotion } = useMotion();
  const { playCue, stopCue } = useSoundtrack();

  const raf = useRef<number | null>(null);
  const heldRef = useRef(false);
  const progressRef = useRef(0);
  const lastTs = useRef<number | null>(null);

  const cancelLoop = useCallback(() => {
    if (raf.current !== null) {
      window.cancelAnimationFrame(raf.current);
      raf.current = null;
    }
    lastTs.current = null;
  }, []);

  /**
   * Считаем по фактически прошедшему времени, а не по числу тиков:
   * браузер душит таймеры в фоне и в режиме экономии, и шкала бы врала.
   */
  const loop = useCallback(
    (ts: number) => {
      const prevTs = lastTs.current ?? ts;
      const delta = Math.min(ts - prevTs, 100);
      lastTs.current = ts;

      const perMs = 100 / FULL_MS;
      const next = heldRef.current
        ? progressRef.current + delta * perMs
        : progressRef.current - delta * perMs * RELEASE_FACTOR;

      if (heldRef.current && next >= 100) {
        progressRef.current = 100;
        setProgress(100);
        setDone(true);
        cancelLoop();
        return;
      }

      if (!heldRef.current && next <= 0) {
        progressRef.current = 0;
        setProgress(0);
        cancelLoop();
        return;
      }

      progressRef.current = next;
      setProgress(next);
      raf.current = window.requestAnimationFrame(loop);
    },
    [cancelLoop],
  );

  const ensureLoop = useCallback(() => {
    if (raf.current === null) {
      raf.current = window.requestAnimationFrame(loop);
    }
  }, [loop]);

  const stop = useCallback(() => {
    if (!heldRef.current) return;
    heldRef.current = false;
    setHeld(false);
    ensureLoop();
  }, [ensureLoop]);

  const start = useCallback(() => {
    // Шкала уже полная — кнопка просто открывает признание заново
    if (done) {
      setModalOpen(true);
      return;
    }
    heldRef.current = true;
    setHeld(true);

    if (reducedMotion) {
      progressRef.current = 100;
      setProgress(100);
      setDone(true);
      return;
    }

    ensureLoop();
  }, [done, reducedMotion, ensureLoop]);

  // Ушли со вкладки с зажатой кнопкой — считаем, что отпустили
  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState === "hidden") stop();
    };
    document.addEventListener("visibilitychange", onHidden);
    return () => document.removeEventListener("visibilitychange", onHidden);
  }, [stop]);

  useEffect(() => cancelLoop, [cancelLoop]);

  // Шкала дошла до конца — показываем признание
  useEffect(() => {
    if (done) setModalOpen(true);
  }, [done]);

  // Пока признание на экране — играет своя песня, потом возвращается фон
  useEffect(() => {
    if (!modalOpen) return;
    playCue(soundCues.missYou);
    return () => stopCue();
  }, [modalOpen, playCue, stopCue]);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  const stage = done
    ? missYou.full
    : missYou.stages.filter((s) => progress >= s.at).slice(-1)[0]?.text ??
      missYou.idle;

  return (
    <section className={styles.root} aria-label={missYou.title}>
      <p className={`${styles.eyebrow} eyebrow`}>{missYou.eyebrow}</p>

      <button
        type="button"
        className={`${styles.button} ${held ? styles.holding : ""} ${
          done ? styles.done : ""
        }`}
        onPointerDown={start}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
        onContextMenu={(e) => e.preventDefault()}
        aria-label={done ? missYou.full : missYou.title}
      >
        <span
          className={styles.fill}
          style={{ transform: `scaleY(${progress / 100})` }}
          aria-hidden="true"
        />
        <span className={styles.buttonInner}>
          <span className={styles.buttonTitle}>{missYou.title}</span>
          <span className={`${styles.percent} mono-num`}>
            {Math.round(progress)}%
          </span>
        </span>
      </button>

      <p className={styles.stage} aria-live="polite">
        {stage}
      </p>

      {modalOpen && (
        <div
          className={styles.overlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-label={missYou.modal.title}
          >
            <p className={`${styles.modalEyebrow} eyebrow`}>
              {missYou.modal.eyebrow}
            </p>
            <h3 className={styles.modalTitle}>{missYou.modal.title}</h3>

            {missYou.modal.lines.map((line, i) => (
              <p key={i} className={styles.modalLine}>
                {line}
              </p>
            ))}

            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setModalOpen(false)}
            >
              {missYou.modal.close}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
