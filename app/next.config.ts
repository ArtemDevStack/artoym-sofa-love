import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Полностью статический экспорт — сайт можно развернуть где угодно.
  output: "export",
  // Для статического экспорта next/image работает без серверной оптимизации.
  // При деплое на Vercel уберите `unoptimized`, чтобы включить AVIF/WebP-пайплайн.
  images: { unoptimized: true },
  // Строгий режим React выключен намеренно: GSAP/ScrollTrigger с двойным
  // монтированием эффектов в dev даёт лишний шум. На production-сборку не влияет.
  reactStrictMode: false,
};

export default nextConfig;
