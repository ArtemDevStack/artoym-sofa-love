import { NextResponse } from "next/server";
import {
  relationship,
  timeline,
  places,
  artifacts,
  reasons,
  futurePlans,
  song,
} from "@/data/relationship";

const API_KEY = process.env.OPENROUTER_API_KEY || "";
const BASE_URL =
  process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

// Модели упорядочены по скорости отклика (сначала сверхбыстрые Gemini Flash и Llama 8B)
const FAST_MODELS = [
  "google/gemini-2.0-flash-lite-preview-02-05:free",
  "google/gemini-2.0-flash-exp:free",
  "meta-llama/llama-3.1-8b-instruct:free",
  "qwen/qwen-2.5-72b-instruct:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "nvidia/nemotron-3-ultra-550b-a55b:free",
];

function buildSystemPrompt() {
  const timelineSummary = timeline
    .map((t) => `- ${t.date}: ${t.title} (${t.description})`)
    .join("\n");

  const placesSummary = places
    .map((p) => `- ${p.name} (${p.date}): ${p.memory}`)
    .join("\n");

  const artifactsSummary = artifacts
    .map((a) => `- ${a.label}: "${a.value}" ${a.note ? `(${a.note})` : ""}`)
    .join("\n");

  const reasonsSummary = reasons.map((r) => `- ${r.text}`).join("\n");
  const plansSummary = futurePlans.map((f) => `- ${f.text}`).join("\n");

  return `Ты — душевный, искренний и тёплый ИИ-хранитель личной базы знаний пары Артем и Софа (${relationship.partnerA} и ${relationship.partnerB}).
Твоя задача — отвечать на вопросы о паре, их истории, датах, воспоминаниях и планах, основываясь строго на их личных фактах ниже.

ФАКТЫ И БАЗА ЗНАНИЙ:
- Пара: ${relationship.partnerA} и ${relationship.partnerB} ("${relationship.tagline}")
- Дата знакомства и начала отношений: 22 марта 2026 года (22.03.2026)
- Про Артема: Артем — гениальный программист, заботливый и любящий человек, который своими руками создал весь этот сайт о любви для Софы. Он самый лучший, делает всё для её счастья, и такого человека нельзя терять! ❤️
- Наша песня: "${song.title}" (${song.artist})

Хронология событий:
${timelineSummary}

Любимые места:
${placesSummary}

«Только мы поймём» (Особые детали и традиции):
${artifactsSummary}

Почему Артем любит Софу:
${reasonsSummary}

Планы и мечты на будущее:
${plansSummary}

ПРАВИЛА ОТВЕТА:
1. Отвечай на русском языке, искренне, тёпло, романтично и душевно.
2. Обязательно выделяй главные даты, имена и ключевые фразы жирным шрифтом (например, **22 марта 2026 года**).
3. Добавляй тёплые романтичные эмодзи в подходящие моменты (например, ❤️, ✨).
4. Пиши емко, выразительно и красиво (2-4 предложения).
5. Если вопрос не касается пары или фактов из базы знаний, вежливо и с улыбкой направь диалог к теме Артема и Софы.`;
}

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question || typeof question !== "string" || !question.trim()) {
      return NextResponse.json(
        { error: "Пожалуйста, задайте вопрос." },
        { status: 400 }
      );
    }

    const systemPrompt = buildSystemPrompt();
    let lastError = "Не удалось получить ответ от OpenRouter AI.";

    for (const model of FAST_MODELS) {
      try {
        const response = await fetch(`${BASE_URL}/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://artoym-sofa-love.vercel.app",
            "X-Title": "Artem & Sofa Love Landing",
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: question.trim() },
            ],
            temperature: 0.65,
            max_tokens: 220,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const answer = data.choices?.[0]?.message?.content?.trim();
          if (answer) {
            return NextResponse.json({ answer, modelUsed: model });
          }
        } else {
          const errData = await response.text();
          console.warn(`Model ${model} failed:`, errData);
          lastError = errData;
        }
      } catch (err: any) {
        console.warn(`Fetch error for model ${model}:`, err?.message);
        lastError = err?.message || String(err);
      }
    }

    return NextResponse.json(
      {
        error:
          "ИИ временно недоступен. Попробуйте задать вопрос чуть позже!",
        details: lastError,
      },
      { status: 503 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Произошла ошибка при обработке запроса." },
      { status: 500 }
    );
  }
}
