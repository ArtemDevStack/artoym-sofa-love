"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./Photo.module.css";

interface PhotoProps {
  src: string;
  alt: string;
  /** Номер кадра для эстетичного placeholder (берётся из пути, если не передан) */
  index?: number;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/**
 * Фотография пары. Пока реальный файл не загружен в public/images/couple/,
 * показывает эстетичный плейсхолдер с номером кадра — без стоковых фото.
 */
export default function Photo({
  src,
  alt,
  index,
  fill = true,
  width,
  height,
  sizes = "(max-width: 768px) 100vw, 60vw",
  priority = false,
  className,
}: PhotoProps) {
  const [failed, setFailed] = useState(false);
  const num = index ?? extractNumber(src);

  if (failed) {
    return (
      <div
        data-ph=""
        className={`${styles.placeholder} ${className ?? ""}`}
        role="img"
        aria-label={`${alt} (фотография ${num} будет здесь)`}
      >
        <span className={styles.frameNo}>
          {String(num).padStart(2, "0")}
        </span>
        <span className={styles.hint}>место для фотографии</span>
      </div>
    );
  }

  const common = {
    src,
    alt,
    sizes,
    priority,
    className: `${styles.img} ${className ?? ""}`,
    onError: () => setFailed(true),
  } as const;

  return fill ? (
    <Image {...common} fill style={{ objectFit: "cover" }} />
  ) : (
    <Image {...common} width={width ?? 1200} height={height ?? 800} />
  );
}

function extractNumber(src: string): number {
  const m = src.match(/(\d+)(?=\.[a-z]+$)/i);
  return m ? parseInt(m[1], 10) : 0;
}
