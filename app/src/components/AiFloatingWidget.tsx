"use client";

import { scrollToTarget, useMotion } from "@/lib/motion";
import styles from "./AiFloatingWidget.module.css";

export default function AiFloatingWidget() {
  const { lenis } = useMotion();

  function handleClick() {
    const section = document.getElementById("ai-knowledge");
    if (section) {
      scrollToTarget(lenis, section);
    }
  }

  return (
    <button
      type="button"
      className={styles.floatingBtn}
      onClick={handleClick}
      title="Спросить нейросеть о нас"
    >
      <span className={styles.sparkle}>✨</span>
      <span>Спросить ИИ</span>
    </button>
  );
}
