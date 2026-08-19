"use client";

import { useMedia } from "@/context/MediaContext";
import styles from "./EditModeToggle.module.css";

export default function EditModeToggle() {
  const { isEditMode, toggleEditMode } = useMedia();

  return (
    <button
      type="button"
      className={`${styles.toggleBtn} ${isEditMode ? styles.toggleBtnActive : ""}`}
      onClick={toggleEditMode}
      title={
        isEditMode
          ? "Нажмите, чтобы выключить плашки редактирования фото"
          : "Нажмите, чтобы включить режим замены фото и видео"
      }
    >
      <span
        className={`${styles.dot} ${isEditMode ? styles.dotActive : ""}`}
        aria-hidden="true"
      />
      <span>
        {isEditMode ? "✏️ Редактирование фото: Вкл" : "✏️ Изменить фото"}
      </span>
    </button>
  );
}
