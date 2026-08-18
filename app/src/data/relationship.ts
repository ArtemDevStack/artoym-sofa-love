/**
 * ─────────────────────────────────────────────────────────────
 *  ВСЁ СОДЕРЖИМОЕ САЙТА МЕНЯЕТСЯ ЗДЕСЬ.
 *  UI-компоненты не содержат личного контента.
 *
 *  · Имена и дата отношений  → relationship
 *  · PIN-код                 → access
 *  · Хронология              → timeline
 *  · Фотографии воспоминаний → stackPhotos / filmFrames / collagePhotos
 *  · Цифры                   → stats
 *  · Места                   → places
 *  · «Только мы поймём»      → artifacts
 *  · Причины любви           → reasons
 *  · Письма                  → letters
 *  · Песня                   → song
 *  · Секреты                 → secrets / secretFinal
 *  · Планы на будущее        → futurePlans
 *  · Финальное письмо        → loveLetter
 *
 *  Фотографии кладите в  public/images/couple/01.jpg … 20.jpg
 *  Музыку — в              public/audio/our-song.mp3
 * ─────────────────────────────────────────────────────────────
 */

import type {
  AccessConfig,
  Artifact,
  FuturePlan,
  Letter,
  LoveReason,
  Memory,
  Place,
  Relationship,
  RelationshipStat,
  Secret,
  SecretFinalContent,
  Song,
  TimelineEvent,
} from "@/types/relationship";

/* ── Доступ ─────────────────────────────────────────────── */

export const access: AccessConfig = {
  // Памятная дата как PIN: день и месяц начала отношений (ДДММ).
  pin: "2203",
  hint: "день, когда всё началось · ДДММ",
};

/* ── Пара ───────────────────────────────────────────────── */

export const relationship: Relationship = {
  partnerA: "Артем",
  partnerB: "Софа",
  startDate: "2026-03-22T19:30:00",
  tagline: "два человека, одна история",
};

/* ── Как всё началось ───────────────────────────────────── */

export const timeline: TimelineEvent[] = [
  {
    id: "meeting",
    date: "22.03.2026",
    title: "Знакомство",
    description:
      "Случайная встреча 22 марта, которая случайной не бывает. Мы говорили так, будто знали друг друга давно.",
    photo: "/images/couple/01.jpg",
    location: "Москва",
    scene: "wipe",
  },
  {
    id: "first-date",
    date: "29.03.2026",
    title: "Первое свидание",
    description:
      "Кофе, который остыл, потому что разговор был важнее. И долгая дорога домой — нарочно самая длинная.",
    photo: "/images/couple/02.jpg",
    location: "кафе",
    scene: "blur",
  },
  {
    id: "beginning",
    date: "22.03.2026",
    title: "Начало",
    description:
      "22 марта — день, который мы теперь называем «нашим». Дальше — всё, что было до, стало просто прологом.",
    photo: "/images/couple/03.jpg",
    scene: "curtain",
  },
  {
    id: "moment",
    date: "27.04.2026",
    title: "Важный момент",
    description:
      "Обычный вечер, который почему-то запомнился больше многих праздников. Мы просто были рядом.",
    photo: "/images/couple/04.jpg",
    scene: "slide",
  },
  {
    id: "first-trip",
    date: "15.06.2026",
    title: "Первая поездка",
    description:
      "Поезд, чужой город и ощущение, что с этим человеком можно куда угодно.",
    photo: "/images/couple/05.jpg",
    location: "Санкт-Петербург",
    scene: "iris",
  },
  {
    id: "today",
    date: "сегодня",
    title: "И вот мы здесь",
    description:
      "История продолжается. Каждый день добавляет в неё что-то своё.",
    photo: "/images/couple/06.jpg",
    scene: "rise",
  },
];

/* ── Стопка распечатанных фотографий ────────────────────── */

export const stackPhotos: Memory[] = [
  { id: "s1", photo: "/images/couple/07.jpg", caption: "то самое утро", tilt: -4 },
  { id: "s2", photo: "/images/couple/08.jpg", caption: "смеёмся, не помню над чем", tilt: 3 },
  { id: "s3", photo: "/images/couple/09.jpg", caption: "просто так", tilt: -2 },
  { id: "s4", photo: "/images/couple/10.jpg", caption: "ты сказала — не удаляй", tilt: 5 },
  { id: "s5", photo: "/images/couple/11.jpg", caption: "лучший кадр года", tilt: -3 },
];

/* ── Киноплёнка ─────────────────────────────────────────── */

export const filmFrames: Memory[] = [
  { id: "f1", photo: "/images/couple/12.jpg", tilt: 0, date: "22.03", place: "Москва", phrase: "привет" },
  { id: "f2", photo: "/images/couple/13.jpg", tilt: 0, date: "29.03", place: "кафе", phrase: "ещё пять минут" },
  { id: "f3", photo: "/images/couple/14.jpg", tilt: 0, date: "22.03", phrase: "теперь официально" },
  { id: "f4", photo: "/images/couple/15.jpg", tilt: 0, date: "15.06", place: "Питер", phrase: "пойдём не туда" },
  { id: "f5", photo: "/images/couple/16.jpg", tilt: 0, date: "02.09", place: "море", phrase: "ещё один рассвет" },
  { id: "f6", photo: "/images/couple/17.jpg", tilt: 0, date: "31.12", phrase: "наш первый новый год" },
];

/* ── Коллаж воспоминаний ────────────────────────────────── */

export const collagePhotos: Memory[] = [
  { id: "c1", photo: "/images/couple/18.jpg", tilt: -6, caption: "весна" },
  { id: "c2", photo: "/images/couple/19.jpg", tilt: 4, caption: "город" },
  { id: "c3", photo: "/images/couple/20.jpg", tilt: -3, caption: "мы" },
  { id: "c4", photo: "/images/couple/01.jpg", tilt: 7, caption: "начало" },
  { id: "c5", photo: "/images/couple/03.jpg", tilt: -5, caption: "22.03" },
  { id: "c6", photo: "/images/couple/05.jpg", tilt: 2, caption: "дорога" },
];

/* ── Цифры ──────────────────────────────────────────────── */

export const stats: RelationshipStat[] = [
  { id: "days", value: "auto-days", label: "дней вместе" },
  { id: "cities", value: 8, label: "городов" },
  { id: "photos", value: 12840, label: "фотографий" },
  { id: "jokes", value: "∞", label: "глупых шуток" },
  { id: "love", value: "999+", label: "«я тебя люблю»" },
];

/* ── Места (абстрактная карта; x/y — проценты 0..100) ───── */

export const places: Place[] = [
  {
    id: "p-met",
    name: "Где мы познакомились",
    date: "22.03.2026",
    memory: "22 марта — день, когда всё началось.",
    photo: "/images/couple/01.jpg",
    x: 24,
    y: 34,
  },
  {
    id: "p-date",
    name: "Первое свидание",
    date: "29.03.2026",
    memory: "Кафе, в котором нас не хотели отпускать даже после закрытия.",
    photo: "/images/couple/02.jpg",
    x: 44,
    y: 22,
  },
  {
    id: "p-trip",
    name: "Первая поездка",
    date: "15.06.2026",
    memory: "Нева, белые ночи и мы, не желающие спать.",
    photo: "/images/couple/05.jpg",
    x: 68,
    y: 18,
  },
  {
    id: "p-fav",
    name: "Наше любимое место",
    date: "всегда",
    memory: "Набережная, где время идёт медленнее, чем везде.",
    photo: "/images/couple/16.jpg",
    x: 58,
    y: 56,
  },
  {
    id: "p-home",
    name: "Дом",
    date: "каждый день",
    memory: "Место, куда хочется возвращаться. Потому что там ты.",
    photo: "/images/couple/20.jpg",
    x: 34,
    y: 72,
  },
];

/* ── Только мы поймём ───────────────────────────────────── */

export const artifacts: Artifact[] = [
  { id: "a-song", label: "наша песня", value: "тот самый трек", note: "2:47 — момент", tilt: -3 },
  { id: "a-film", label: "наш фильм", value: "тот, что мы не досмотрели", note: "заснули на 40-й минуте", tilt: 2 },
  { id: "a-food", label: "наша еда", value: "паста в три часа ночи", tilt: -2 },
  { id: "a-phrase", label: "наша фраза", value: "«ну ты поняла»", tilt: 4 },
  { id: "a-place", label: "наше место", value: "третья скамейка слева", tilt: -4 },
  { id: "a-story", label: "самая смешная история", value: "зонт, дождь и не тот автобус", tilt: 3 },
];

/* ── Почему я тебя люблю ────────────────────────────────── */

export const reasons: LoveReason[] = [
  { id: "r1", text: "За то, как ты смеёшься." },
  { id: "r2", text: "За наши разговоры до ночи." },
  { id: "r3", text: "За то, что рядом с тобой обычные дни становятся важными." },
  { id: "r4", text: "За то, как ты хмуришься, когда что-то решаешь." },
  { id: "r5", text: "За твоё «поехали» в ответ на любую авантюру." },
  { id: "r6", text: "За то, что ты веришь в меня больше, чем я сам." },
  { id: "r7", text: "За тишину, которая с тобой не бывает неловкой." },
  { id: "r8", text: "За то, что дом — это теперь там, где ты." },
];

/* ── Письма «Открой, когда…» ────────────────────────────── */

export const letters: Letter[] = [
  {
    id: "l-sad",
    trigger: "Открой, когда тебе грустно",
    body: "Если ты читаешь это — обними себя за меня. Помнишь наш первый смех до слёз? Таких моментов у нас ещё очень много впереди. Грусть пройдёт, а я никуда не денусь.",
    signature: "твой Артем",
  },
  {
    id: "l-miss",
    trigger: "Открой, когда скучаешь по мне",
    body: "Я тоже скучаю. Даже если виделись утром. Посмотри в окно — где-то там я сейчас думаю о тебе. Проверено: расстояние против нас бессильно.",
    signature: "твой Артем",
  },
  {
    id: "l-angry",
    trigger: "Открой, когда злишься на меня",
    body: "Я был неправ. Или прав, но сказал не так. В любом случае — я на твоей стороне, даже когда мы спорим. Прости. Пойдём мириться за пастой.",
    signature: "твой Артем",
  },
  {
    id: "l-sleep",
    trigger: "Открой, когда не можешь уснуть",
    body: "Закрой глаза. Представь нашу набережную, вечер и то, как город медленно гаснет. Я рядом — просто пока в другой комнате твоих мыслей. Спи спокойно.",
    signature: "твой Артем",
  },
  {
    id: "l-just",
    trigger: "Открой просто так",
    body: "Без повода: я люблю тебя. Вот и вся новость. Возвращайся к своим делам — и знай, что кто-то в этом мире считает тебя лучшим своим решением.",
    signature: "твой Артем",
  },
];

/* ── Песня ──────────────────────────────────────────────── */

export const song: Song = {
  title: "Наша песня",
  artist: "положите файл в public/audio/our-song.mp3",
  src: "/audio/our-song.mp3",
};

/* ── Секреты (7 штук, спрятаны по секциям) ──────────────── */

export const secrets: Secret[] = [
  { id: "secret-1", section: "intro", hint: "маленькая звезда в темноте первого экрана" },
  { id: "secret-2", section: "timeline", hint: "одна из дат кликабельна" },
  { id: "secret-3", section: "photo-stack", hint: "карандашная пометка на обороте фотографии" },
  { id: "secret-4", section: "film-strip", hint: "кадр, которого не должно было быть" },
  { id: "secret-5", section: "collage", hint: "пустое место между воспоминаниями" },
  { id: "secret-6", section: "letters", hint: "марка на одном из конвертов" },
  { id: "secret-7", section: "final", hint: "точка в самом конце фразы" },
];

export const secretFinal: SecretFinalContent = {
  title: "Раз ты нашла всё — вот ещё кое-что.",
  text: "Этот сайт я делал по вечерам, пряча экран, когда ты входила в комнату. Каждая строчка здесь — про нас. Спасибо, что ты — моя история.",
  photo: "/images/couple/20.jpg",
};

/* ── Финальное письмо ───────────────────────────────────── */

export const loveLetter: string[] = [
  "Я долго думал, как сказать это без пафоса.",
  "Наверное, никак. Поэтому скажу как есть.",
  "До тебя я не знал, что обычный вторник может быть событием.",
  "Что молчание может быть разговором.",
  "Что дорога домой может быть лучшей частью вечера.",
  "Ты появилась — и всё расставила по местам.",
  "Я не знаю, что будет дальше. Но я знаю, с кем хочу это встретить.",
  "С тобой.",
];

/* ── Будущее ────────────────────────────────────────────── */

export const futurePlans: FuturePlan[] = [
  { id: "fp1", text: "Увидеть северное сияние — вдвоём, в тёплых носках.", kind: "trip" },
  { id: "fp2", text: "Поехать в город, где мы никогда не были, без плана.", kind: "trip" },
  { id: "fp3", text: "Научиться готовить то блюдо из ресторана на набережной.", kind: "todo" },
  { id: "fp4", text: "Завести полку с нашими фотографиями — настоящими, бумажными.", kind: "dream" },
  { id: "fp5", text: "Каждый год праздновать 22 марта — день нашего знакомства.", kind: "promise" },
  { id: "fp6", text: "Стареть смешно и не по правилам.", kind: "promise" },
];
