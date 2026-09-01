"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { forgive, soundCues } from "@/data/relationship";
import { useSoundtrack } from "@/context/SoundtrackContext";
import styles from "./ForgiveModal.module.css";

const SEEN_KEY = "forgive-answered";

/** Пауза после появления фразы — чтобы её успели прочитать */
const READ_DELAY_MS = 1400;

/**
 * Финальная модалка: появляется, когда страница долистана до конца.
 * «Нет» уворачивается от курсора и подписывается новой репликой,
 * «Да» открывает благодарность. Ответ запоминается — второй раз не всплывает.
 */
export default function ForgiveModal() {
  const [open, setOpen] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [dodges, setDodges] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);
  const { playCue, stopCue } = useSoundtrack();

  /**
   * Показываем один раз — когда долистали до фразы «наша история ещё
   * не закончилась» (якорь [data-forgive-anchor] в секции «Наше будущее»).
   *
   * Ждём, пока строка окажется в кадре целиком, и даём её прочитать,
   * прежде чем перекрыть модалкой.
   *
   * Если якоря вдруг нет — падаем на низ страницы. Именно «низ», а не
   * «секция видна на N %»: секции выше экрана телефона, и такая доля
   * там недостижима.
   */
  useEffect(() => {
    if (window.localStorage.getItem(SEEN_KEY)) return;

    let fired = false;
    let delay: number | undefined;

    const fire = () => {
      if (fired) return;
      fired = true;
      delay = window.setTimeout(() => setOpen(true), READ_DELAY_MS);
    };

    const anchor = document.querySelector("[data-forgive-anchor]");

    /** Фраза целиком в кадре — либо её уже пролистали выше */
    const anchorReached = () => {
      if (!anchor) return false;
      const r = anchor.getBoundingClientRect();
      const seenWhole = r.top >= 0 && r.bottom <= window.innerHeight;
      const scrolledPast = r.bottom < window.innerHeight * 0.5;
      return seenWhole || scrolledPast;
    };

    const check = () => {
      if (fired) return;
      const reached = anchor
        ? anchorReached()
        : window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 150;
      if (reached) {
        fire();
        cleanup();
      }
    };

    // Два независимых пути: Observer не присылает событий, пока вкладка
    // скрыта, а обработчик scroll не сработает, если страницу открыли
    // уже на нужном месте. Вместе они закрывают оба случая.
    let observer: IntersectionObserver | undefined;
    if (anchor) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            fire();
            cleanup();
          }
        },
        { threshold: 0.9 },
      );
      observer.observe(anchor);
    }

    function cleanup() {
      observer?.disconnect();
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    }

    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);

    return () => {
      cleanup();
      window.clearTimeout(delay);
    };
  }, []);

  // Пока модалка на экране — играет своя песня, потом возвращается фон
  useEffect(() => {
    if (!open) return;
    playCue(soundCues.forgive);
    return () => stopCue();
  }, [open, playCue, stopCue]);

  // Пока открыта — фон не скроллится
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const dodge = useCallback(() => {
    setDodges((d) => d + 1);
    const box = dialogRef.current?.getBoundingClientRect();
    // На телефоне разлёт меньше: кнопки стоят колонкой и экран узкий,
    // иначе «Нет» уезжает за край или наползает на «Да»
    const narrow = window.innerWidth <= 480;
    const reachX = Math.max(
      40,
      Math.min((box?.width ?? 320) / 2 - 70, narrow ? 68 : 130),
    );
    const reachY = narrow ? 26 : 46;
    const step = dodges + 1;
    // Детерминированный разлёт — без Math.random, чтобы прыжки читались
    setOffset({
      x: Math.round(Math.sin(step * 2.4) * reachX),
      y: Math.round(Math.cos(step * 1.7) * reachY),
    });
  }, [dodges]);

  const accept = useCallback(() => {
    setAnswered(true);
    try {
      window.localStorage.setItem(SEEN_KEY, "yes");
    } catch {
      // приватный режим — просто не запоминаем
    }
  }, []);

  const close = useCallback(() => setOpen(false), []);

  if (!open) return null;

  const noLabel =
    forgive.noLabels[Math.min(dodges, forgive.noLabels.length - 1)];

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div ref={dialogRef} className={styles.dialog}>
        {!answered ? (
          <>
            <p className={`${styles.eyebrow} eyebrow`}>{forgive.eyebrow}</p>
            <h2 className={`${styles.question} display`}>{forgive.question}</h2>
            <p className={styles.sub}>{forgive.sub}</p>

            <div className={styles.actions}>
              <button type="button" className={styles.yes} onClick={accept}>
                {forgive.yesLabel}
              </button>

              <button
                type="button"
                className={styles.no}
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px)`,
                }}
                onMouseEnter={dodge}
                onFocus={dodge}
                onPointerDown={(e) => {
                  e.preventDefault();
                  dodge();
                }}
                onClick={(e) => e.preventDefault()}
              >
                {noLabel}
              </button>
            </div>

            {forgive.escapeAfter !== undefined &&
              forgive.escapeLabel &&
              dodges >= forgive.escapeAfter && (
                <button type="button" className={styles.escape} onClick={close}>
                  {forgive.escapeLabel}
                </button>
              )}
          </>
        ) : (
          <>
            <h2 className={`${styles.question} display`}>
              {forgive.thanksTitle}
            </h2>
            <div className={styles.thanks}>
              {forgive.thanksLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <button type="button" className={styles.yes} onClick={close}>
              {forgive.closeLabel}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
