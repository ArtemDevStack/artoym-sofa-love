"use client";

import { useEffect, useRef, useState } from "react";
import { song } from "@/data/relationship";
import styles from "./MusicPlayer.module.css";

/**
 * Минималистичный плеер. Никогда не нарушает autoplay policy:
 * звук включается только по явному действию пользователя.
 * Если файл ещё не загружен в public/audio/ — плеер тихо скрывается.
 */
export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onError = () => setAvailable(false);
    const onEnded = () => setPlaying(false);
    audio.addEventListener("error", onError);
    audio.addEventListener("ended", onEnded);
    // Проверяем наличие файла заранее, чтобы не показывать битый контрол
    fetch(song.src, { method: "HEAD" }).then((r) => {
      if (!r.ok) setAvailable(false);
    }).catch(() => setAvailable(false));
    return () => {
      audio.removeEventListener("error", onError);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      try {
        audio.volume = 0.6;
        await audio.play();
        setPlaying(true);
      } catch {
        setAvailable(false);
      }
    }
  };

  if (!available) return null;

  return (
    <div className={styles.root} data-playing={playing}>
      <audio ref={audioRef} src={song.src} loop preload="none" />
      <button
        type="button"
        className={styles.toggle}
        onClick={toggle}
        aria-label={playing ? `Пауза: ${song.title}` : `Играть: ${song.title}`}
        aria-pressed={playing}
      >
        <span className={`${styles.bars} ${playing ? styles.playing : ""}`} aria-hidden="true">
          <i /><i /><i /><i />
        </span>
      </button>
      <span className={styles.meta}>
        <span className={styles.title}>{song.title}</span>
        <span className={styles.artist}>{song.artist}</span>
      </span>
    </div>
  );
}
