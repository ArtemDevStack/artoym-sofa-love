"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useSecrets } from "@/hooks/useSecrets";
import Photo from "@/components/Photo";
import { secretFinal } from "@/data/relationship";
import styles from "./SecretFinal.module.css";

/**
 * Скрытая сцена — открывается, когда найдены все 7 секретов.
 * Контент редактируется в data/relationship.ts → secretFinal.
 */
export default function SecretFinal() {
  const { allFound } = useSecrets();
  const rootRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (allFound) setVisible(true);
  }, [allFound]);

  useEffect(() => {
    if (!visible || !rootRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-secret-final]",
        { opacity: 0, y: 40, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.3,
          stagger: 0.3,
          ease: "power2.out",
        },
      );
    }, rootRef);
    rootRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    return () => ctx.revert();
  }, [visible]);

  if (!visible) return null;

  return (
    <section
      ref={rootRef}
      className={styles.root}
      aria-label="Скрытая сцена"
    >
      <h2 data-secret-final className={`${styles.title} display`}>
        {secretFinal.title}
      </h2>
      <div data-secret-final className={styles.photo} data-cursor="view">
        <Photo src={secretFinal.photo} alt="Скрытая фотография" sizes="(max-width: 768px) 90vw, 520px" />
      </div>
      <p data-secret-final className={`${styles.text} display`}>{secretFinal.text}</p>
    </section>
  );
}
