import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30; // Maximum allowed serverless execution time

import {
  relationship,
  timeline,
  places,
  artifacts,
  reasons,
  futurePlans,
  song,
} from "@/data/relationship";

const BASE_URL =
  process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

// Модели упорядочены по скорости отклика
const FAST_MODELS = [
  "google/gemini-2.0-flash-lite-preview-02-05:free",
  "google/gemini-2.0-flash-exp:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "meta-llama/llama-3.1-8b-instruct:free",
  "qwen/qwen-2.5-72b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
  "deepseek/deepseek-r1:free",
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
- Про Софу: Софа — прекрасный и удивительный человек, бесконечно любящая, невероятно нежная девушка и просто идеальный повар (всё, что она готовит — самое вкусное на свете). Она самая красивая, милая и дорогая сердцу Артема! ✨
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
    const rawApiKey = process.env.OPENROUTER_API_KEY || "";
    const apiKey = rawApiKey.replace(/^["']|["']$/g, "").trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Переменная OPENROUTER_API_KEY не найдена в Vercel Environment Variables.",
          details: "Перейдите в Vercel Dashboard -> Settings -> Environment Variables и добавьте OPENROUTER_API_KEY.",
        },
        { status: 500 }
      );
    }

    const { question } = await req.json();

    if (!question || typeof question !== "string" || !question.trim()) {
      return NextResponse.json(
        { error: "Пожалуйста, задайте вопрос." },
        { status: 400 }
      );
    }

    const systemPrompt = buildSystemPrompt();
    let lastError = "Не удалось получить ответ ни от одной модели OpenRouter.";

    for (const model of FAST_MODELS) {
      try {
        const response = await fetch(`${BASE_URL}/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
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
          console.warn(`Model ${model} returned HTTP ${response.status}:`, errData);
          lastError = `[${model} HTTP ${response.status}]: ${errData}`;
        }
      } catch (err: any) {
        console.warn(`Fetch error for model ${model}:`, err?.message);
        lastError = err?.message || String(err);
      }
    }

    return NextResponse.json(
      {
        error: "ИИ временно недоступен. Проверьте правильность API ключа в Vercel.",
        details: lastError,
      },
      { status: 503 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Произошла ошибка при обработке запроса.", details: err?.message },
      { status: 500 }
    );
  }
}
