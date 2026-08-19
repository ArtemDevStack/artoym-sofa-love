"use client";

import { useState, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMotion } from "@/lib/motion";
import styles from "./AiKnowledge.module.css";

const SUGGESTIONS = [
  "Расскажи про Софу",
  "Кто близкие и друзья Софы?",
  "Что любит Софа смотреть и делать?",
  "Расскажи про Артема",
  "Когда и как мы познакомились?",
];

export default function AiKnowledge() {
  const rootRef = useRef<HTMLElement>(null);
  const { reducedMotion } = useMotion();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useGSAP(
    () => {
      if (reducedMotion) return;
      gsap.fromTo(
        "[data-ai-card]",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 75%", once: true },
        }
      );
    },
    { scope: rootRef, dependencies: [reducedMotion] }
  );

  async function handleAsk(queryToAsk?: string) {
    const q = queryToAsk || question;
    if (!q.trim() || loading) return;

    setLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("Сервер ИИ превысил время ожидания ответа. Попробуйте повторить вопрос!");
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.details || data.error || "Не удалось получить ответ.");
      }

      setAnswer(data.answer);
    } catch (err: any) {
      setError(err.message || "Ошибка подключения.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section ref={rootRef} id="ai-knowledge" className={styles.root} aria-label="Нейросеть про нас">
      <div data-ai-card className={styles.card}>
        <div className={styles.badge}>
          <span className={styles.sparkle}>✨</span>
          <span>ИИ-хранитель базы знаний</span>
        </div>

        <h2 className={`${styles.heading} display`}>Спроси у нейросети о нас</h2>
        <p className={styles.subheading}>
          Виртуальный ассистент знает всё о дате нашего знакомства, любимых местах, секретах и воспоминаниях.
        </p>

        <div className={styles.suggestions}>
          {SUGGESTIONS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              className={styles.suggestionChip}
              onClick={() => {
                setQuestion(item);
                handleAsk(item);
              }}
            >
              {item}
            </button>
          ))}
        </div>

        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
        >
          <input
            type="text"
            className={styles.input}
            placeholder="Задай любой вопрос про Артема и Софу..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button type="submit" className={styles.submitBtn} disabled={loading || !question.trim()}>
            {loading ? (
              <span className={styles.spinner} />
            ) : (
              <>
                <span>✨</span>
                <span>Спросить</span>
              </>
            )}
          </button>
        </form>

        {loading && (
          <div className={styles.answerBox}>
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <span>ИИ думает и вспоминает детали...</span>
            </div>
          </div>
        )}

        {error && (
          <div className={styles.answerBox} style={{ borderColor: "rgba(244, 91, 105, 0.4)" }}>
            <div className={styles.answerHeader} style={{ color: "#f45b69" }}>
              Ошибка
            </div>
            <p>{error}</p>
          </div>
        )}

        {answer && !loading && (
          <div className={styles.answerBox}>
            <div className={styles.answerHeader}>✨ Ответ нейросети:</div>
            <FormattedText text={answer} />
          </div>
        )}
      </div>
    </section>
  );
}

function FormattedText({ text }: { text: string }) {
  const paragraphs = text.split(/\n\s*\n/);

  return (
    <>
      {paragraphs.map((para, pIdx) => {
        const lines = para.split(/\n/);
        return (
          <p key={pIdx} style={{ marginBottom: pIdx < paragraphs.length - 1 ? "10px" : "0", lineHeight: 1.6 }}>
            {lines.map((line, lIdx) => (
              <span key={lIdx}>
                {lIdx > 0 && <br />}
                {parseInlineMarkdown(line)}
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
}

function parseInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={index} style={{ color: "#fff", fontWeight: 600 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}
