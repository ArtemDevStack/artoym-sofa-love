import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const alt = "Артем × Софа — Два человека, одна история";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0f0e0c",
          backgroundImage:
            "radial-gradient(circle at 50% 40%, #2b1f1d 0%, #0f0e0c 70%)",
          color: "#efe8da",
          fontFamily: "sans-serif",
          position: "relative",
          padding: "60px 40px",
          textAlign: "center",
        }}
      >
        {/* Border outline */}
        <div
          style={{
            position: "absolute",
            inset: "24px",
            border: "1px solid rgba(224, 214, 194, 0.18)",
            borderRadius: "16px",
            display: "flex",
          }}
        />

        {/* Top badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "18px",
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "#cbb291",
            marginBottom: "24px",
          }}
        >
          <span>✨</span>
          <span>ИСТОРИЯ ЛЮБВИ</span>
          <span>✨</span>
        </div>

        {/* Main Title */}
        <div
          style={{
            fontSize: "76px",
            fontWeight: "normal",
            fontStyle: "italic",
            color: "#ffffff",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <span>Артем</span>
          <span style={{ color: "#e25555", fontStyle: "normal" }}>❤️</span>
          <span>Софа</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "28px",
            letterSpacing: "0.12em",
            color: "#b0a595",
            marginBottom: "36px",
          }}
        >
          Два человека, одна история
        </div>

        {/* Bottom date badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "10px 24px",
            borderRadius: "999px",
            backgroundColor: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(224, 214, 194, 0.2)",
            fontSize: "18px",
            color: "#efe8da",
          }}
        >
          <span>С 22 марта 2026 года</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
