"use client";

import { useEffect, useState } from "react";
import { useMedia } from "@/context/MediaContext";
import styles from "./MediaModal.module.css";

export default function MediaModal() {
  const { editingTarget, closeEditor, getMedia, replaceMedia, resetMedia } =
    useMedia();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [previewSrc, setPreviewSrc] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!editingTarget) {
      setSelectedFile(null);
      setUrlInput("");
      setPreviewSrc("");
      return;
    }

    const current = getMedia(
      editingTarget.originalSrc,
      editingTarget.defaultType
    );
    setPreviewSrc(current.src);
    setMediaType(current.type);
  }, [editingTarget, getMedia]);

  if (!editingTarget) return null;

  const currentMedia = getMedia(
    editingTarget.originalSrc,
    editingTarget.defaultType
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUrlInput("");
    const isVideo = file.type.startsWith("video/");
    setMediaType(isVideo ? "video" : "image");
    setPreviewSrc(URL.createObjectURL(file));
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrlInput(val);
    setSelectedFile(null);
    setPreviewSrc(val);
    const isVid =
      /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(val) || val.includes("video");
    setMediaType(isVid ? "video" : "image");
  };

  const handleSave = async () => {
    if (!selectedFile && !urlInput.trim()) {
      closeEditor();
      return;
    }

    setLoading(true);
    try {
      if (selectedFile) {
        await replaceMedia(editingTarget.originalSrc, selectedFile, mediaType);
      } else if (urlInput.trim()) {
        await replaceMedia(
          editingTarget.originalSrc,
          urlInput.trim(),
          mediaType
        );
      }
    } catch (err) {
      console.warn("Failed to replace media:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await resetMedia(editingTarget.originalSrc);
    } catch (err) {
      console.warn("Failed to reset media:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeEditor();
      }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <h3 className={styles.title}>Заменить фото или видео</h3>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={closeEditor}
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        <div className={styles.previewBox}>
          {previewSrc ? (
            mediaType === "video" ? (
              <video
                src={previewSrc}
                autoPlay
                muted
                loop
                playsInline
                className={styles.previewMedia}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewSrc}
                alt="Превью"
                className={styles.previewMedia}
              />
            )
          ) : (
            <span style={{ color: "var(--muted)", fontSize: 13 }}>
              Выбери новое фото или видео
            </span>
          )}
        </div>

        <div className={styles.uploadSection}>
          <label className={styles.fileInputLabel}>
            <span>📁 Загрузить с устройства (фото или видео)</span>
            <input
              type="file"
              accept="image/*,video/*"
              className={styles.hiddenInput}
              onChange={handleFileChange}
            />
          </label>

          <div className={styles.divider}>или</div>

          <input
            type="url"
            placeholder="Вставьте ссылку на фото или видео (https://...)"
            value={urlInput}
            onChange={handleUrlChange}
            className={styles.urlInput}
          />
        </div>

        <div className={styles.actions}>
          {currentMedia.isOverridden && (
            <button
              type="button"
              className={styles.resetBtn}
              onClick={handleReset}
              disabled={loading}
            >
              🔄 Сбросить к оригиналу
            </button>
          )}

          <div className={styles.rightActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={closeEditor}
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="button"
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={loading || (!selectedFile && !urlInput.trim())}
            >
              {loading ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
