import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "About Impact Atlas - Our Mission & Vision";
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
          background: "linear-gradient(135deg, #0A0F1A 0%, #111827 50%, #0A0F1A 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "radial-gradient(circle at 30% 70%, rgba(20, 184, 166, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 20px",
              borderRadius: 100,
              background: "rgba(20, 184, 166, 0.15)",
              border: "1px solid rgba(20, 184, 166, 0.3)",
              marginBottom: 32,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#14B8A6",
              }}
            />
            <span style={{ color: "#14B8A6", fontSize: 16, fontWeight: 500 }}>
              About Us
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "white",
              marginBottom: 24,
              letterSpacing: "-0.02em",
              textAlign: "center",
            }}
          >
            Our Mission & Vision
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: 24,
              color: "rgba(255, 255, 255, 0.7)",
              textAlign: "center",
              maxWidth: 800,
              lineHeight: 1.6,
            }}
          >
            Combining satellite data, AI, and urban planning to help cities tackle climate challenges faster and smarter
          </div>

          {/* Fixathon badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 48,
              padding: "12px 24px",
              borderRadius: 16,
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: 16 }}>
              Built at Norrsken Fixathon Barcelona 2025
            </span>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "rgba(255, 255, 255, 0.5)",
            fontSize: 16,
          }}
        >
          <span>impact.staats.dev</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
