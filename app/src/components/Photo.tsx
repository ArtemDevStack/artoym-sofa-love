"use client";

import { useState } from "react";
import Image from "next/image";
import { useMedia } from "@/context/MediaContext";
import styles from "./Photo.module.css";

interface PhotoProps {
  src: string;
  alt: string;
  index?: number;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  editable?: boolean;
}

function isVideoPath(src: string): boolean {
  if (!src) return false;
  return (
    /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(src) ||
    src.startsWith("data:video/") ||
    src.startsWith("blob:")
  );
}

export default function Photo({
  src,
  alt,
  fill = true,
  width,
  height,
  sizes = "(max-width: 768px) 100vw, 60vw",
  priority = false,
  className,
  editable = true,
}: PhotoProps) {
  const { getMedia, openEditor } = useMedia();
  const defaultType = isVideoPath(src) ? "video" : "image";
  const media = getMedia(src, defaultType);
  const [failed, setFailed] = useState(false);
  const isVideo = media.type === "video" || isVideoPath(media.src);

  const handleClick = (e: React.MouseEvent) => {
    if (!editable) return;
    e.stopPropagation();
    openEditor(src, isVideo ? "video" : "image");
  };

  const renderContent = () => {
    if (isVideo) {
      return (
        <video
          src={media.src}
          autoPlay
          muted
          loop
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      );
    }

    if (failed || !media.src) {
      return (
        <div style={{ width: "100%", height: "100%", background: "#1a1713" }} />
      );
    }

    if (media.src.startsWith("data:") || media.src.startsWith("blob:")) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={media.src}
          alt={alt}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={() => setFailed(true)}
        />
      );
    }

    const common = {
      src: media.src,
      alt,
      sizes,
      priority,
      className: className ?? "",
      onError: () => setFailed(true),
    } as const;

    return fill ? (
      <Image {...common} fill style={{ objectFit: "cover" }} />
    ) : (
      <Image {...common} width={width ?? 1200} height={height ?? 800} />
    );
  };

  return (
    <div
      className={styles.photoWrapper}
      onClick={handleClick}
      title="Нажми, чтобы изменить фото или видео"
    >
      {renderContent()}
      {editable && (
        <span className={styles.editBadge}>
          📷 {media.isOverridden ? "Изменено" : "Заменить"}
        </span>
      )}
    </div>
  );
}
