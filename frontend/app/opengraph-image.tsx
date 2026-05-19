import { ImageResponse } from "next/og";

export const alt =
  "HoloMem — Holographic Reduced Representations explained. Store structured facts inside a single fixed-size vector with bind, superpose, unbind, and cleanup.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0805",
          padding: "72px 88px",
          fontFamily: "serif",
          color: "#f1ead8",
          backgroundImage:
            "radial-gradient(900px 600px at 80% 110%, rgba(214,162,76,0.22), transparent 60%), radial-gradient(700px 500px at 0% 0%, rgba(80,140,200,0.10), transparent 60%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "#d6a24c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0a0805",
              fontFamily: "sans-serif",
              fontWeight: 700,
              fontSize: 26,
            }}
          >
            H
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 600,
              letterSpacing: "-0.01em",
            }}
          >
            HoloMem
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              color: "#d6a24c",
              fontFamily: "monospace",
              fontSize: 22,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Explainer
          </div>
          <div
            style={{
              fontSize: 84,
              fontWeight: 600,
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              maxWidth: 980,
            }}
          >
            Holographic Reduced Representations
          </div>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.35,
              color: "rgba(241,234,216,0.75)",
              maxWidth: 940,
              fontFamily: "sans-serif",
            }}
          >
            Store structured facts inside a single fixed-size vector. Bind,
            superpose, unbind, cleanup — all running live in your browser.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "monospace",
            fontSize: 20,
            color: "rgba(241,234,216,0.55)",
          }}
        >
          <div>NumPy · FastAPI · Next.js · TypeScript HRR</div>
          <div style={{ color: "#d6a24c" }}>1024-d · bind · unbind</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
