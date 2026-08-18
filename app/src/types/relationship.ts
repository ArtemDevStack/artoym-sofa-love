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
  location?: string;
  /** Вариант механики сцены — каждая крупная сцена имеет свою */
  scene: "wipe" | "blur" | "curtain" | "slide" | "iris" | "rise";
}

export interface Memory {
  id: string;
  photo: string;
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
