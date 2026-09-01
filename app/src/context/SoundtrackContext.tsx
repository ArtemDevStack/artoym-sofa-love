"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import type { SoundCue } from "@/types/relationship";

/** Громкость фоновой песни */
const BG_VOLUME = 0.6;
/** Громкость трека, который перебивает фон */
const CUE_VOLUME = 0.75;
/** Длительность перехода между треками */
const FADE_MS = 420;

interface SoundtrackValue {
  /** Фоновый плеер отдаёт сюда свой <audio>, чтобы им можно было управлять */
  registerBackground: (el: HTMLAudioElement | null) => void;
  /** Приглушить фон и включить трек с нужной секунды */
  playCue: (cue: SoundCue) => void;
  /** Вернуть фоновую песню */
  stopCue: () => void;
}

const SoundtrackContext = createContext<SoundtrackValue | null>(null);

/** Плавно ведём громкость к цели; по достижении нуля — колбэк */
function fade(
  audio: HTMLAudioElement,
  to: number,
  ms: number,
  done?: () => void,
) {
  const from = audio.volume;
  const steps = Math.max(1, Math.round(ms / 40));
  let i = 0;

  const id = window.setInterval(() => {
    i += 1;
    const v = from + (to - from) * (i / steps);
    audio.volume = Math.min(1, Math.max(0, v));
    if (i >= steps) {
      window.clearInterval(id);
      done?.();
    }
  }, 40);

  return () => window.clearInterval(id);
}

/**
 * Один саундтрек на весь сайт: фоном играет главная песня,
 * а отдельные моменты (модалка «Простишь меня?», «Скучаю»)
 * перебивают её своим треком — сразу с припева.
 */
export function SoundtrackProvider({ children }: { children: ReactNode }) {
  const bgRef = useRef<HTMLAudioElement | null>(null);
  const cueRef = useRef<HTMLAudioElement | null>(null);
  const cueSrc = useRef<string | null>(null);
  /** Играл ли фон до того, как его перебили */
  const bgWasPlaying = useRef(false);

  const registerBackground = useCallback((el: HTMLAudioElement | null) => {
    bgRef.current = el;
  }, []);

  const stopCue = useCallback(() => {
    const cue = cueRef.current;
    if (cue && !cue.paused) {
      fade(cue, 0, FADE_MS, () => cue.pause());
    }

    const bg = bgRef.current;
    if (bg && bgWasPlaying.current) {
      bg.volume = 0;
      bg.play()
        .then(() => fade(bg, BG_VOLUME, FADE_MS))
        .catch(() => {
          // вкладка потеряла право на автоплей — вернём звук по клику плеера
          bg.volume = BG_VOLUME;
        });
    }
    bgWasPlaying.current = false;
  }, []);

  const playCue = useCallback((cue: SoundCue) => {
    const bg = bgRef.current;
    if (bg) {
      bgWasPlaying.current = !bg.paused;
      if (!bg.paused) fade(bg, 0, FADE_MS, () => bg.pause());
    }

    // Меняем источник только когда трек другой — иначе теряется буфер
    if (!cueRef.current || cueSrc.current !== cue.src) {
      cueRef.current?.pause();
      const el = new Audio(cue.src);
      el.preload = "auto";
      // Зацикливаем не сначала, а с припева — ради этого ручной луп
      el.addEventListener("ended", () => {
        el.currentTime = cue.startAt ?? 0;
        el.volume = CUE_VOLUME;
        void el.play().catch(() => {});
      });
      cueRef.current = el;
      cueSrc.current = cue.src;
    }

    const el = cueRef.current;
    el.volume = 0;

    const start = () => {
      try {
        el.currentTime = cue.startAt ?? 0;
      } catch {
        // метаданные ещё не подъехали — начнём сначала, это не критично
      }
      el.play()
        .then(() => fade(el, CUE_VOLUME, FADE_MS))
        .catch((err) => console.warn("Cue play blocked:", err));
    };

    // seek возможен только когда известна длительность трека
    if (el.readyState >= 1) start();
    else el.addEventListener("loadedmetadata", start, { once: true });
  }, []);

  useEffect(
    () => () => {
      cueRef.current?.pause();
      cueRef.current = null;
    },
    [],
  );

  const value = useMemo(
    () => ({ registerBackground, playCue, stopCue }),
    [registerBackground, playCue, stopCue],
  );

  return (
    <SoundtrackContext.Provider value={value}>
      {children}
    </SoundtrackContext.Provider>
  );
}

export function useSoundtrack(): SoundtrackValue {
  const ctx = useContext(SoundtrackContext);
  if (!ctx) {
    throw new Error("useSoundtrack must be used inside SoundtrackProvider");
  }
  return ctx;
}
