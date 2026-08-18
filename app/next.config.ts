import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  // Строгий режим React выключен намеренно: GSAP/ScrollTrigger с двойным
  // монтированием эффектов в dev даёт лишний шум. На production-сборку не влияет.
  reactStrictMode: false,
};

export default nextConfig;
