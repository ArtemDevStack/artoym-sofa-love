"use client";

import Link from "next/link";
import { flowers } from "@/data/relationship";
import styles from "./FlowersLink.module.css";

/** Тихая карточка-приглашение: уводит на отдельную страницу с букетом. */
export default function FlowersLink() {
  return (
    <section className={styles.root} aria-label={flowers.teaser.title}>
      <Link href="/flowers" className={styles.card}>
        {/* мини-букет — тот же приём, что на самой странице, только в миниатюре */}
        <svg className={styles.icon} viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="62" r="46" fill="#f4dedb" />
          <circle cx="60" cy="62" r="36" fill="#faeceb" opacity="0.8" />
          {Array.from({ length: 9 }, (_, i) => {
            const a = (i / 9) * Math.PI * 2;
            const x = 60 + Math.cos(a) * 22;
            const y = 62 + Math.sin(a) * 22;
            const c = i % 3 === 0 ? "#f1bcb2" : i % 3 === 1 ? "#fdfaf3" : "#f6e0c9";
            return (
              <g key={i} transform={`translate(${x} ${y})`}>
                {Array.from({ length: 6 }, (_, p) => (
                  <ellipse
                    key={p}
                    rx="4.4"
                    ry="8.2"
                    cy="-6"
                    fill={c}
                    transform={`rotate(${60 * p})`}
                  />
                ))}
                <circle r="3" fill="#efe6c8" />
              </g>
            );
          })}
          <g transform="translate(60 62)">
            {Array.from({ length: 7 }, (_, p) => (
              <ellipse
                key={p}
                rx="5.6"
                ry="10"
                cy="-7"
                fill="#f1bcb2"
                transform={`rotate(${51 * p})`}
              />
            ))}
            <circle r="4" fill="#fbe0d9" />
          </g>
        </svg>

        <span className={styles.text}>
          <span className={`${styles.eyebrow} eyebrow`}>{flowers.teaser.eyebrow}</span>
          <span className={`${styles.title} display`}>{flowers.teaser.title}</span>
          <span className={styles.cta}>{flowers.teaser.cta}</span>
        </span>
      </Link>
    </section>
  );
}
