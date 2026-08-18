"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

interface MotionState {
  /** Пользователь просил уменьшить движение — скруб-сцены выключаются */
  reducedMotion: boolean;
  /** Грубый признак мобильного/тач-устройства — упрощаем сцены */
  isMobile: boolean;
  lenis: React.RefObject<Lenis | null>;
}

const MotionContext = createContext<MotionState>({
  reducedMotion: false,
  isMobile: false,
  lenis: { current: null },
});

export const useMotion = () => useContext(MotionContext);

export function MotionProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqMobile = window.matchMedia("(max-width: 768px), (pointer: coarse)");

    const sync = () => {
      setReducedMotion(mqReduce.matches);
      setIsMobile(mqMobile.matches);
    };
    sync();
    mqReduce.addEventListener("change", sync);
    mqMobile.addEventListener("change", sync);
    return () => {
      mqReduce.removeEventListener("change", sync);
      mqMobile.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) return; // без Lenis — нативный скролл

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  return (
    <MotionContext.Provider
      value={{ reducedMotion, isMobile, lenis: lenisRef }}
    >
      {children}
    </MotionContext.Provider>
  );
}

/** Плавный скролл к цели — работает и с Lenis, и без него. */
export function scrollToTarget(
  lenis: React.RefObject<Lenis | null>,
  target: number | string | HTMLElement,
) {
  if (lenis.current) {
    lenis.current.scrollTo(target, { duration: 2.2 });
  } else if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: "smooth" });
  } else {
    const el =
      typeof target === "string"
        ? document.querySelector<HTMLElement>(target)
        : target;
    el?.scrollIntoView({ behavior: "smooth" });
  }
}
