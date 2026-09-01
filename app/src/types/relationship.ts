/**
 * Типизированная модель контента отношений.
 * Весь личный контент живёт в src/data/relationship.ts —
 * здесь только форма данных.
 */

export interface Relationship {
  partnerA: string;
  partnerB: string;
  /** ISO-дата начала отношений, напр. "2024-02-14" */
  startDate: string;
  /** Короткая фраза-подпись пары */
  tagline: string;
}

export interface TimelineEvent {
  id: string;
  /** Отображаемая дата, напр. "14.02.2024" */
  date: string;
  title: string;
  description: string;
  /** Путь к фото, напр. "/images/couple/01.jpg" */
  photo: string;
  /** Опциональный путь к видео, напр. "/video/video1.mp4" */
  video?: string;
  location?: string;
  /** Вариант механики сцены — каждая крупная сцена имеет свою */
  scene: "wipe" | "blur" | "curtain" | "slide" | "iris" | "rise";
}

export interface Memory {
  id: string;
  photo: string;
  video?: string;
  caption?: string;
  /** Небольшой наклон распечатки, градусы */
  tilt: number;
  date?: string;
  place?: string;
  phrase?: string;
}

export interface Place {
  id: string;
  name: string;
  date: string;
  memory: string;
  photo: string;
  /** Координаты на абстрактной карте, 0..100 (проценты) */
  x: number;
  y: number;
}

export interface RelationshipStat {
  id: string;
  /** Число для count-up либо строка-символ ("∞", "999+") */
  value: number | string;
  label: string;
}

export interface LoveReason {
  id: string;
  text: string;
}

export interface Letter {
  id: string;
  /** "Открой, когда тебе грустно" */
  trigger: string;
  body: string;
  signature?: string;
}

export interface Secret {
  id: string;
  /** В какой секции спрятан (для документации) */
  section: string;
  /** Подсказка, видна только в data-файле */
  hint: string;
}

export interface FuturePlan {
  id: string;
  text: string;
  kind: "trip" | "dream" | "promise" | "todo";
}

export interface Song {
  title: string;
  artist: string;
  /** Путь к mp3, напр. "/audio/our-song.mp3" */
  src: string;
}

export interface Artifact {
  id: string;
  label: string;
  value: string;
  note?: string;
  tilt: number;
}

export interface AccessConfig {
  /** Mock-PIN. Заменяется на server-side проверку — см. src/lib/auth.ts */
  pin: string;
  hint: string;
}

export interface SecretFinalContent {
  title: string;
  text: string;
  photo: string;
}

export interface FirstMonthDay {
  /** День месяца, 1..31 */
  day: number;
  /** Короткая подпись дня. Пустой день — просто тихая точка в календаре. */
  note: string;
  /** Необязательная её или моя фраза из переписки — дословно */
  quote?: string;
  /** Кому принадлежит цитата */
  quoteBy?: "me" | "her";
  /** Фото этого дня, напр. "/images/couple/07.jpg" */
  photo?: string;
}

export interface MonthLetterContent {
  eyebrow: string;
  /** Подпись на конверте */
  envelopeTo: string;
  /** Текст на сургучной печати — 1–2 символа */
  seal: string;
  title: string;
  /** Абзацы письма */
  lines: string[];
  signature: string;
  /** Приписка после подписи */
  ps?: string;
}

export interface NextMeetingContent {
  /** ISO-дата и время следующей встречи. null — дата ещё не назначена. */
  date: string | null;
  eyebrow: string;
  title: string;
  place?: string;
  /** Что показать, когда даты ещё нет */
  waitingText: string;
  /** Подпись под счётчиком */
  note: string;
}

export interface HugsContent {
  title: string;
  hint: string;
  /** Подписи по мере роста счётчика: [порог, текст] */
  milestones: { at: number; text: string }[];
}

export interface FirstMonthContent {
  /** ISO-дата первого дня месяца отношений, напр. "2026-08-01" */
  startDate: string;
  /** Сколько клеток в календаре — длина месяца */
  length: number;
  eyebrow: string;
  title: string;
  /** Подпись под календарём — без пафоса, одна-две строки */
  outro: string[];
  days: FirstMonthDay[];
}
