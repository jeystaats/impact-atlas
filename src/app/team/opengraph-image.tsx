import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Impact Atlas Team";
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
              "radial-gradient(circle at 20% 80%, rgba(20, 184, 166, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)",
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
              Meet The Team
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
            }}
          >
            Impact Makers
          </div>

          {/* Team member avatars placeholder */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: -20,
              marginBottom: 32,
            }}
          >
            {["#14B8A6", "#06B6D4", "#8B5CF6"].map((color, i) => (
              <div
                key={i}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: color,
                  border: "4px solid #0A0F1A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M20 21a8 8 0 1 0-16 0" />
                </svg>
              </div>
            ))}
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: 22,
              color: "rgba(255, 255, 255, 0.7)",
              textAlign: "center",
              maxWidth: 700,
              lineHeight: 1.5,
            }}
          >
            Sustainability experts, product leaders, and engineers building AI-powered climate intelligence
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
