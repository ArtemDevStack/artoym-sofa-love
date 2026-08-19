"use client";

import { useState } from "react";
import { useMedia } from "@/context/MediaContext";
import styles from "./EditPinModal.module.css";

export default function EditPinModal() {
  const { isPinModalOpen, closePinModal, authorizeEdit } = useMedia();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  if (!isPinModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;

    const ok = authorizeEdit(pin.trim());
    if (!ok) {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    } else {
      setPin("");
      setError(false);
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) closePinModal();
      }}
    >
      <div
        className={`${styles.modal} ${shaking ? styles.shake : ""}`}
        role="dialog"
        aria-modal="true"
      >
        <div className={styles.lockIcon}>🔐</div>
        <h3 className={styles.title}>Доступ к редактированию</h3>
        <p className={styles.subtitle}>
          Введите секретный PIN-код для редактирования фотографий и видео
        </p>

        <form onSubmit={handleSubmit} className={styles.pinForm}>
          <input
            type="password"
            maxLength={4}
            placeholder="••••"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError(false);
            }}
            autoFocus
            className={styles.pinInput}
          />

          {error && (
            <span className={styles.errorText}>
              Неверный PIN-код. Попробуйте ещё раз!
            </span>
          )}

          <p className={styles.hintText}>
            💡 Подсказка: дата нашего праздника (2203)
          </p>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={closePinModal}
            >
              Отмена
            </button>
            <button type="submit" className={styles.submitBtn}>
              Войти
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
