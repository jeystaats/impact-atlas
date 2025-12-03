import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Impact Atlas - AI-Powered Climate Intelligence for Cities";
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

        {/* Decorative rings */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            height: 500,
            borderRadius: "50%",
            border: "1px solid rgba(20, 184, 166, 0.2)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 600,
            borderRadius: "50%",
            border: "1px solid rgba(20, 184, 166, 0.1)",
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
          {/* Logo/Icon */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%)",
              marginBottom: 24,
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "white",
              marginBottom: 16,
              letterSpacing: "-0.02em",
            }}
          >
            Impact Atlas
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 28,
              color: "#14B8A6",
              fontWeight: 500,
              marginBottom: 24,
            }}
          >
            Climate Intelligence for Cities
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: 20,
              color: "rgba(255, 255, 255, 0.7)",
              textAlign: "center",
              maxWidth: 700,
              lineHeight: 1.5,
            }}
          >
            AI-powered insights from satellite data to help cities take climate action faster
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
