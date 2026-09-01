"use client";

import { useMemo } from "react";
import styles from "./Bouquet.module.css";

/**
 * Букет, нарисованный целиком в SVG — ни одной картинки.
 *
 * Раскладка детерминированная (seeded-псевдослучайность вместо Math.random):
 * иначе сервер и клиент нарисовали бы разные букеты и гидратация упала бы.
 */

const VIEW = 1000;
const CENTER = VIEW / 2;
/** Радиус, по которому раскидываем бутоны */
const FIELD = 344;

/** Детерминированный «шум» из целого — вместо Math.random */
function noise(i: number, salt = 0): number {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const PALETTE = {
  roseOuter: ["#f3c5bd", "#efb9b0", "#f6d2ca"],
  roseInner: ["#fadcd6", "#f8d0c8", "#fce6e1"],
  carnation: ["#f7e4d2", "#f4dcc6", "#faece0"],
  chrysanth: ["#fdfbf6", "#f6f1e7", "#fffdf9"],
  dahlia: ["#d9a3d0", "#cb8cc4", "#e2b4d9"],
  green: ["#7e9b78", "#8fa987", "#6f8c6b"],
  euca: ["#9db3a5", "#8aa294", "#aec2b4"],
};

const pick = (arr: string[], i: number, salt = 0) =>
  arr[Math.floor(noise(i, salt) * arr.length) % arr.length];

/** Лепесток-капля: ширина w, высота h, растёт вверх от точки крепления */
function petalPath(w: number, h: number, curl = 0.62): string {
  return `M0,0 C${-w},${-h * curl} ${-w * 0.86},${-h} 0,${-h} C${w * 0.86},${-h} ${w},${-h * curl} 0,0 Z`;
}

/** Узкий лепесток хризантемы со скруглённым кончиком */
function stripPath(w: number, h: number): string {
  return `M0,0 C${-w},${-h * 0.45} ${-w * 0.7},${-h} 0,${-h} C${w * 0.7},${-h} ${w},${-h * 0.45} 0,0 Z`;
}

/** Волнистый лепесток гвоздики — край «порезан» зубцами */
function ruffledPath(w: number, h: number): string {
  return [
    `M0,0`,
    `C${-w},${-h * 0.4} ${-w * 0.95},${-h * 0.78} ${-w * 0.55},${-h * 0.88}`,
    `l${w * 0.13},${-h * 0.1} l${w * 0.14},${h * 0.08} l${w * 0.15},${-h * 0.11}`,
    `l${w * 0.16},${h * 0.09} l${w * 0.17},${-h * 0.1} l${w * 0.16},${h * 0.09}`,
    `l${w * 0.15},${-h * 0.11} l${w * 0.14},${h * 0.08} l${w * 0.13},${-h * 0.1}`,
    `C${w * 0.95},${-h * 0.78} ${w},${-h * 0.4} 0,0 Z`,
  ].join(" ");
}

interface FlowerProps {
  i: number;
  size: number;
}

/**
 * Пионовидная роза: широкие внешние лепестки, плотная закрученная
 * сердцевина. Каждый ярус темнее к краю — иначе читается как ромашка.
 */
function Rose({ i, size }: FlowerProps) {
  const outer = pick(PALETTE.roseOuter, i);
  const mid = pick(PALETTE.roseInner, i, 3);
  const rings = [
    { n: 7, r: 1.0, w: 0.54, o: 0, fill: outer, op: 1 },
    { n: 7, r: 0.82, w: 0.48, o: 26, fill: outer, op: 0.96 },
    { n: 6, r: 0.64, w: 0.42, o: 12, fill: mid, op: 1 },
    { n: 5, r: 0.48, w: 0.36, o: 40, fill: mid, op: 1 },
    { n: 5, r: 0.34, w: 0.3, o: 62, fill: "#fce8e3", op: 1 },
  ];
  return (
    <g>
      {rings.map((ring, ri) => (
        <g key={ri}>
          {Array.from({ length: ring.n }, (_, p) => (
            <path
              key={p}
              d={petalPath(size * ring.w, size * ring.r, 0.72)}
              fill={ring.fill}
              opacity={ring.op}
              stroke="#e3a99e"
              strokeWidth={0.5}
              strokeOpacity={0.35}
              transform={`rotate(${(360 / ring.n) * p + ring.o + noise(i, ri) * 7})`}
            />
          ))}
        </g>
      ))}
      {/* закрученное сердце бутона */}
      <circle r={size * 0.2} fill="#fbe0d9" />
      <path
        d={`M${-size * 0.16},0 a${size * 0.16},${size * 0.16} 0 1,1 ${size * 0.1},${size * 0.13}
            a${size * 0.09},${size * 0.09} 0 1,0 ${-size * 0.02},${-size * 0.11}`}
        fill="none"
        stroke="#e5a89c"
        strokeWidth={size * 0.055}
        strokeLinecap="round"
        opacity={0.85}
      />
    </g>
  );
}

/** Хризантема: много узких лепестков в три яруса */
function Chrysanthemum({ i, size }: FlowerProps) {
  const c = pick(PALETTE.chrysanth, i);
  const rings = [
    { n: 18, r: 1.0, w: 0.15, o: 0, op: 1 },
    { n: 15, r: 0.72, w: 0.14, o: 12, op: 0.95 },
    { n: 11, r: 0.46, w: 0.13, o: 24, op: 0.9 },
  ];
  return (
    <g>
      {rings.map((ring, ri) => (
        <g key={ri}>
          {Array.from({ length: ring.n }, (_, p) => (
            <path
              key={p}
              d={stripPath(size * ring.w, size * ring.r)}
              fill={c}
              opacity={ring.op}
              stroke="#e6e0d2"
              strokeWidth={0.6}
              transform={`rotate(${(360 / ring.n) * p + ring.o + noise(i, ri + 7) * 6})`}
            />
          ))}
        </g>
      ))}
      <circle r={size * 0.13} fill="#f4f0d8" />
      <circle r={size * 0.07} fill="#e9e2bd" />
    </g>
  );
}

/** Гвоздика: плотные волнистые лепестки */
function Carnation({ i, size }: FlowerProps) {
  const c = pick(PALETTE.carnation, i);
  const rings = [
    { n: 7, r: 1.0, w: 0.5, o: 0 },
    { n: 6, r: 0.76, w: 0.44, o: 26 },
    { n: 5, r: 0.52, w: 0.38, o: 52 },
    { n: 4, r: 0.3, w: 0.3, o: 70 },
  ];
  return (
    <g>
      {rings.map((ring, ri) => (
        <g key={ri}>
          {Array.from({ length: ring.n }, (_, p) => (
            <path
              key={p}
              d={ruffledPath(size * ring.w, size * ring.r)}
              fill={c}
              opacity={1 - ri * 0.04}
              stroke="#e2c49f"
              strokeWidth={0.5}
              transform={`rotate(${(360 / ring.n) * p + ring.o + noise(i, ri + 11) * 10})`}
            />
          ))}
        </g>
      ))}
    </g>
  );
}

/** Георгин: округлые сиреневые лепестки */
function Dahlia({ i, size }: FlowerProps) {
  const c = pick(PALETTE.dahlia, i);
  const rings = [
    { n: 12, r: 1.0, w: 0.26, o: 0, op: 1 },
    { n: 10, r: 0.74, w: 0.24, o: 16, op: 0.95 },
    { n: 8, r: 0.5, w: 0.22, o: 32, op: 0.92 },
    { n: 6, r: 0.28, w: 0.2, o: 48, op: 0.9 },
  ];
  return (
    <g>
      {rings.map((ring, ri) => (
        <g key={ri}>
          {Array.from({ length: ring.n }, (_, p) => (
            <path
              key={p}
              d={petalPath(size * ring.w, size * ring.r, 0.8)}
              fill={c}
              opacity={ring.op}
              transform={`rotate(${(360 / ring.n) * p + ring.o})`}
            />
          ))}
        </g>
      ))}
      <circle r={size * 0.1} fill="#b978b3" opacity={0.8} />
    </g>
  );
}

/** Нераскрывшийся бутон в зелёной чашечке */
function Bud({ i, size }: FlowerProps) {
  const c = pick(PALETTE.roseOuter, i, 5);
  const g = pick(PALETTE.green, i, 2);
  return (
    <g>
      {Array.from({ length: 5 }, (_, p) => (
        <path
          key={p}
          d={petalPath(size * 0.4, size * 0.85)}
          fill={g}
          transform={`rotate(${72 * p + 18})`}
        />
      ))}
      <ellipse rx={size * 0.42} ry={size * 0.5} cy={-size * 0.12} fill={c} />
      <ellipse
        rx={size * 0.2}
        ry={size * 0.28}
        cy={-size * 0.16}
        fill="#fadcd6"
        opacity={0.8}
      />
    </g>
  );
}

/** Веточка эвкалипта — круглые сизые листья по дуге */
function EucalyptusSprig({ i, len }: { i: number; len: number }) {
  const c = pick(PALETTE.euca, i);
  const leaves = 7;
  return (
    <g>
      <path
        d={`M0,0 Q${len * 0.35},${-len * 0.22} ${len},${-len * 0.3}`}
        fill="none"
        stroke={c}
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.9}
      />
      {Array.from({ length: leaves }, (_, p) => {
        const t = (p + 1) / (leaves + 1);
        const x = len * t;
        const y = -len * 0.3 * t - len * 0.06;
        const r = len * (0.16 - t * 0.05);
        return (
          <ellipse
            key={p}
            cx={x}
            cy={y + (p % 2 ? r * 0.7 : -r * 0.7)}
            rx={r}
            ry={r * 0.86}
            fill={c}
            opacity={0.92}
          />
        );
      })}
    </g>
  );
}

/** Лист зелени под цветами */
function Leaf({ i, size }: FlowerProps) {
  const g = pick(PALETTE.green, i, 4);
  return (
    <path
      d={petalPath(size * 0.34, size, 0.5)}
      fill={g}
      opacity={0.85}
    />
  );
}

type Kind = "rose" | "chrysanth" | "carnation" | "dahlia" | "bud";

interface Slot {
  x: number;
  y: number;
  size: number;
  kind: Kind;
  rot: number;
  delay: number;
}

/**
 * Раскладка по спирали филлотаксиса — так цветы ложатся плотно и
 * без видимой сетки, как в настоящем букете.
 */
function buildSlots(count: number): Slot[] {
  const GOLDEN = 137.508;
  const slots: Slot[] = [];

  /*
   * Состав как в настоящем букете: основа — розы, хризантемы и гвоздики,
   * а сиреневые георгины только акцент. Раздаём типы по квотам, а не
   * случайно: при случайном выборе георгины расползались по всему букету
   * и он становился фиолетовым.
   */
  const dahliaAt = new Set([6, 19, 33]);
  const budAt = new Set([2, 27, 41, 50]);

  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const radius = FIELD * Math.sqrt(t);
    const angle = ((i * GOLDEN + noise(i, 1) * 9) * Math.PI) / 180;

    // Крупнее к центру — там сердце букета
    const size = 104 - 22 * t + noise(i, 2) * 16;

    const r = noise(i, 3);
    let kind: Kind;
    if (dahliaAt.has(i)) kind = "dahlia";
    else if (budAt.has(i)) kind = "bud";
    else if (r < 0.31) kind = "rose";
    else if (r < 0.76) kind = "chrysanth";
    else kind = "carnation";

    slots.push({
      x: CENTER + Math.cos(angle) * radius,
      y: CENTER + Math.sin(angle) * radius * 0.94,
      size,
      kind,
      rot: noise(i, 4) * 360,
      delay: 0.25 + t * 1.5 + noise(i, 5) * 0.25,
    });
  }
  return slots;
}

export default function Bouquet({ count = 82 }: { count?: number }) {
  const slots = useMemo(() => buildSlots(count), [count]);

  return (
    <svg
      className={styles.svg}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      role="img"
      aria-label="Букет из роз, хризантем, гвоздик и георгинов"
    >
      <defs>
        <radialGradient id="wrapGrad" cx="50%" cy="46%" r="60%">
          <stop offset="0%" stopColor="#fbeeec" />
          <stop offset="62%" stopColor="#f3ddda" />
          <stop offset="100%" stopColor="#e6c7c4" />
        </radialGradient>
        <radialGradient id="coreShade" cx="50%" cy="48%" r="52%">
          <stop offset="0%" stopColor="#000" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      {/* ── Упаковка: слои мятой бумаги ── */}
      <g className={styles.wrap}>
        <ellipse cx={CENTER} cy={CENTER + 18} rx={430} ry={414} fill="url(#wrapGrad)" />
        {Array.from({ length: 22 }, (_, p) => {
          const a = (p / 22) * Math.PI * 2;
          const rr = 414 + noise(p, 6) * 24;
          return (
            <path
              key={p}
              d={`M${CENTER},${CENTER + 18}
                  L${CENTER + Math.cos(a) * rr},${CENTER + 18 + Math.sin(a) * rr * 0.96}
                  L${CENTER + Math.cos(a + 0.28) * rr * 0.97},${CENTER + 18 + Math.sin(a + 0.28) * rr * 0.93} Z`}
              fill={p % 2 ? "#f7e5e3" : "#eed6d4"}
              opacity={0.55}
            />
          );
        })}
        <ellipse cx={CENTER} cy={CENTER + 12} rx={344} ry={332} fill="#f9eae8" opacity={0.9} />
        <ellipse cx={CENTER} cy={CENTER + 8} rx={312} ry={300} fill="url(#coreShade)" />
      </g>

      {/* ── Эвкалипт по краю ── */}
      <g>
        {Array.from({ length: 9 }, (_, p) => {
          const a = (p / 9) * Math.PI * 2 + 0.4;
          const rr = 372;
          return (
            <g
              key={p}
              className={styles.grow}
              style={{ animationDelay: `${0.1 + p * 0.05}s` }}
              transform={`translate(${CENTER + Math.cos(a) * rr} ${CENTER + Math.sin(a) * rr * 0.94})
                          rotate(${(a * 180) / Math.PI})`}
            >
              <EucalyptusSprig i={p} len={110 + noise(p, 8) * 40} />
            </g>
          );
        })}
      </g>

      {/* ── Зелень под цветами ── */}
      <g>
        {Array.from({ length: 16 }, (_, p) => {
          const a = (p / 16) * Math.PI * 2;
          const rr = 330 + noise(p, 9) * 34;
          return (
            <g
              key={p}
              className={styles.grow}
              style={{ animationDelay: `${0.15 + p * 0.03}s` }}
              transform={`translate(${CENTER + Math.cos(a) * rr} ${CENTER + Math.sin(a) * rr * 0.94})
                          rotate(${(a * 180) / Math.PI + 90})`}
            >
              <Leaf i={p} size={60 + noise(p, 10) * 26} />
            </g>
          );
        })}
      </g>

      {/* ── Цветы ── */}
      <g>
        {slots.map((s, i) => (
          <g
            key={i}
            className={styles.bloom}
            style={{ animationDelay: `${s.delay}s` }}
            transform={`translate(${s.x} ${s.y}) rotate(${s.rot})`}
          >
            {/* мягкая тень под каждым бутоном — букет становится объёмным */}
            <ellipse
              rx={s.size * 0.62}
              ry={s.size * 0.58}
              cy={s.size * 0.1}
              fill="#000"
              opacity={0.13}
              filter="url(#soft)"
            />
            {s.kind === "rose" && <Rose i={i} size={s.size} />}
            {s.kind === "chrysanth" && <Chrysanthemum i={i} size={s.size} />}
            {s.kind === "carnation" && <Carnation i={i} size={s.size} />}
            {s.kind === "dahlia" && <Dahlia i={i} size={s.size} />}
            {s.kind === "bud" && <Bud i={i} size={s.size * 0.72} />}
          </g>
        ))}
      </g>
    </svg>
  );
}
