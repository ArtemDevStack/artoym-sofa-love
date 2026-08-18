"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMotion } from "@/lib/motion";
import Photo from "@/components/Photo";
import { SecretHotspot } from "@/components/Secrets";
import { timeline } from "@/data/relationship";
import styles from "./Intro.module.css";

/**
 * Cinematic intro: две световые точки движутся навстречу,
 * соединяются → фраза → первая фотография раскрывается.
 * При скролле фото медленно увеличивается, текст уходит.
 */
export default function Intro() {
  const rootRef = useRef<HTMLElement>(null);
  const { reducedMotion } = useMotion();
  const firstPhoto = timeline[0]?.photo ?? "/images/couple/01.jpg";

  useGSAP(
    () => {
      if (reducedMotion) {
        gsap.set("[data-intro-phrase], [data-intro-photo]", { opacity: 1 });
        gsap.set("[data-intro-dot]", { opacity: 0 });
        gsap.set("[data-intro-photo]", { clipPath: "inset(0% 0% 0% 0%)" });
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "+=280%",
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
        },
      });

      tl.fromTo(
        "[data-intro-dot='a']",
        { x: "-38vw", opacity: 0 },
        { x: 0, opacity: 1, duration: 3 },
        0,
      )
        .fromTo(
          "[data-intro-dot='b']",
          { x: "38vw", opacity: 0 },
          { x: 0, opacity: 1, duration: 3 },
          0,
        )
        // Вспышка соединения
        .fromTo(
          "[data-intro-flash]",
          { opacity: 0, scale: 0.4 },
          { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" },
          3,
        )
        .to("[data-intro-dot]", { opacity: 0, scale: 0.3, duration: 0.8 }, 3.4)
        .to("[data-intro-flash]", { opacity: 0.35, scale: 6, duration: 2 }, 3.6)
        // Фраза
        .fromTo(
          "[data-intro-phrase]",
          { opacity: 0, y: 26, filter: "blur(10px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 2, ease: "power2.out" },
          4.2,
        )
        .to("[data-intro-flash]", { opacity: 0, duration: 1.4 }, 5.4)
        // Текст уходит, фото раскрывается и медленно растёт
        .to(
          "[data-intro-phrase]",
          { opacity: 0, y: -30, filter: "blur(8px)", duration: 1.6 },
          7,
        )
        .fromTo(
          "[data-intro-photo]",
          { clipPath: "inset(46% 32% 46% 32%)", opacity: 0.4 },
          { clipPath: "inset(0% 0% 0% 0%)", opacity: 1, duration: 3, ease: "power1.inOut" },
          7.4,
        )
        .fromTo(
          "[data-intro-photo] img, [data-intro-photo] [data-ph]",
          { scale: 1.18 },
          { scale: 1.04, duration: 3.2, ease: "none" },
          7.4,
        )
        .fromTo(
          "[data-intro-caption]",
          { opacity: 0 },
          { opacity: 1, duration: 1 },
          9.4,
        );
    },
    { scope: rootRef, dependencies: [reducedMotion] },
  );

  return (
    <section ref={rootRef} id="intro" className={styles.root} aria-label="Начало истории">
      <div className={styles.stage}>
        <div data-intro-flash className={styles.flash} aria-hidden="true" />
        <div data-intro-dot="a" className={styles.dot} aria-hidden="true" />
        <div data-intro-dot="b" className={styles.dot} aria-hidden="true" />

        <p data-intro-phrase className={`${styles.phrase} display`}>
          Из миллиардов людей каким-то образом
          встретились именно мы.
        </p>

        <div data-intro-photo className={styles.photo}>
          <Photo
            src={firstPhoto}
            alt="Наша первая совместная фотография"
            priority
            sizes="100vw"
          />
        </div>

        <p data-intro-caption className={styles.caption}>
          {timeline[0]?.date} · {timeline[0]?.location ?? ""}
        </p>

        {/* Секрет 1 — маленькая звезда в углу первого экрана */}
        <SecretHotspot
          id="secret-1"
          kind="star"
          className={styles.secretStar}
          ariaLabel="Звёздочка"
        />
      </div>
    </section>
  );
}
