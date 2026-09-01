import type { Metadata } from "next";
import Bouquet from "@/components/Bouquet";
import { flowers } from "@/data/relationship";
import styles from "./flowers.module.css";

export const metadata: Metadata = {
  title: "Цветы для Софы",
  description: "Букет, который не завянет.",
};

/** Отдельная страница-подарок: букет, нарисованный в SVG. */
export default function FlowersPage() {
  return (
    <main className={styles.root}>
      <p className={`${styles.eyebrow} eyebrow`}>{flowers.eyebrow}</p>
      <h1 className={`${styles.title} display`}>{flowers.title}</h1>

      <div className={styles.stage}>
        <Bouquet />
      </div>

      <div className={styles.note}>
        {flowers.lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>

      <p className={styles.signature}>{flowers.signature}</p>
    </main>
  );
}
