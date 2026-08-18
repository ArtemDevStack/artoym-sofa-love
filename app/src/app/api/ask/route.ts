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

// Проверенные стабильные инстракт-модели, которые выключают лишнее мышление вслух
const FAST_MODELS = [
  "google/gemini-2.0-flash-lite-preview-02-05:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen-2.5-72b-instruct:free",
  "google/gemma-4-26b-a4b-it:free",
  "z-ai/glm-5.2:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
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
1. Отвечай СТРОГО на русском языке. Категорически запрещено выводить черновики, списки размышлений или англоязычный текст!
2. Выводи сразу готовый финальный ответ для пользователя.
3. Обязательно выделяй главные даты, имена и ключевые фразы жирным шрифтом (например, **22 марта 2026 года**).
4. Добавляй тёплые романтичные эмодзи в подходящие моменты (например, ❤️, ✨).
5. Пиши емко, выразительно и красиво (2-4 предложения).
6. Обязательно дописывай свой ответ полностью до конца и всегда завершай мысли точкой или эмодзи!`;
}

function cleanResponseText(rawText: string): string {
  if (!rawText) return "";
  let cleaned = rawText;

  // Удаляем секции размышлений на английском
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, "");
  cleaned = cleaned.replace(/<thought>[\s\S]*?<\/thought>/gi, "");
  cleaned = cleaned.replace(/^Here's a thinking process:[\s\S]*?\n\n/gi, "");
  cleaned = cleaned.replace(/^Thinking Process:[\s\S]*?\n\n/gi, "");

  // Если весь ответ начался с размышлений "1. Analyze...", находим первый русский абзац с кириллицей
  if (cleaned.includes("1. Analyze") || cleaned.includes("User asks") || cleaned.includes("Check Constraints")) {
    const paragraphs = cleaned.split("\n\n");
    const russianParagraph = paragraphs.find((p) => /[а-яеё]+/i.test(p) && !p.includes("Analyze") && !p.includes("User asks"));
    if (russianParagraph) {
      cleaned = russianParagraph;
    }
  }

  return cleaned.trim();
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
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

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
            max_tokens: 500,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const rawAnswer = data.choices?.[0]?.message?.content?.trim();
          const answer = cleanResponseText(rawAnswer);
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
        lastError = err?.name === "AbortError" ? `Модель ${model} превысила таймаут (6с)` : (err?.message || String(err));
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
