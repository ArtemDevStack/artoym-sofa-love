"use client";

import { useEffect, useRef, useState } from "react";
import { song } from "@/data/relationship";
import styles from "./MusicPlayer.module.css";

/**
 * Минималистичный плеер.
 * Автоматически запускает воспроизведение песни сразу после разблокировки по ПИН-коду.
 */
export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.6;

    const onError = () => {
      console.warn("Audio load error:", song.src);
      setAvailable(false);
    };
    const onEnded = () => setPlaying(false);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    audio.addEventListener("error", onError);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    // Автоматический старт при входе (после ввода пин-кода)
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setPlaying(true);
        })
        .catch((err) => {
          console.warn("Autoplay blocked or awaiting interaction:", err);
        });
    }

    return () => {
      audio.removeEventListener("error", onError);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        audio.volume = 0.6;
        await audio.play();
        setPlaying(true);
      } catch (err) {
        console.warn("Audio play error on toggle:", err);
      }
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  if (!available) return null;

  return (
    <div className={styles.root} data-playing={playing}>
      <audio ref={audioRef} src={song.src} loop preload="auto" />
      <button
        type="button"
        className={styles.toggle}
        onClick={toggle}
        aria-label={playing ? `Пауза: ${song.title}` : `Играть: ${song.title}`}
        aria-pressed={playing}
      >
        <span
          className={`${styles.bars} ${playing ? styles.playing : ""}`}
          aria-hidden="true"
        >
          <i />
          <i />
          <i />
          <i />
        </span>
      </button>
      <span className={styles.meta} onClick={toggle} style={{ cursor: "pointer" }}>
        <span className={styles.title}>{song.title}</span>
        <span className={styles.artist}>{song.artist}</span>
      </span>
    </div>
  );
}
