"use client";

import { useEffect } from "react";

// Inline styles - global-error cannot use external CSS reliably
const styles = {
  html: {
    height: "100%",
  },
  body: {
    minHeight: "100vh",
    margin: 0,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    background: "#09090b",
    color: "#fafafa",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    padding: "24px",
    textAlign: "center" as const,
  },
  container: {
    maxWidth: "400px",
    width: "100%",
  },
  iconContainer: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "rgba(239, 68, 68, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px",
  },
  heading: {
    fontSize: "clamp(1.5rem, 4vw, 2rem)",
    fontWeight: 700,
    marginBottom: "12px",
    color: "#fafafa",
  },
  description: {
    fontSize: "1rem",
    color: "rgba(250, 250, 250, 0.6)",
    marginBottom: "32px",
    lineHeight: 1.6,
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
    alignItems: "center",
  },
  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: 500,
    borderRadius: "9999px",
    background: "#fafafa",
    color: "#09090b",
    border: "none",
    cursor: "pointer",
    transition: "transform 0.15s, opacity 0.15s",
  },
  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: 500,
    borderRadius: "9999px",
    background: "transparent",
    color: "#fafafa",
    border: "1px solid rgba(250, 250, 250, 0.2)",
    cursor: "pointer",
    transition: "border-color 0.15s",
    textDecoration: "none",
  },
  errorInfo: {
    marginTop: "32px",
    padding: "16px",
    borderRadius: "8px",
    background: "rgba(250, 250, 250, 0.05)",
    border: "1px solid rgba(250, 250, 250, 0.1)",
    textAlign: "left" as const,
  },
  errorLabel: {
    fontSize: "12px",
    color: "rgba(250, 250, 250, 0.4)",
    marginBottom: "4px",
    fontFamily: "monospace",
  },
  errorMessage: {
    fontSize: "12px",
    color: "#ef4444",
    fontFamily: "monospace",
    wordBreak: "break-all" as const,
  },
};

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console/monitoring service
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en" style={styles.html}>
      <head>
        <title>Error - Impact Atlas</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .animate-fade-in {
                animation: fadeIn 0.5s ease-out forwards;
              }
              .animate-fade-in-delayed {
                animation: fadeIn 0.5s ease-out 0.1s forwards;
                opacity: 0;
              }
              button:hover {
                transform: scale(1.02);
              }
              button:active {
                transform: scale(0.98);
              }
              a:hover {
                border-color: rgba(250, 250, 250, 0.4) !important;
              }
            `,
          }}
        />
      </head>
      <body style={styles.body}>
        <div style={styles.container} className="animate-fade-in">
          {/* Warning Icon */}
          <div style={styles.iconContainer}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>

          {/* Content */}
          <h1 style={styles.heading}>Critical Error</h1>
          <p style={styles.description}>
            Something went wrong at the application level. We&apos;re sorry for the inconvenience.
          </p>

          {/* Actions */}
          <div style={styles.buttonContainer} className="animate-fade-in-delayed">
            <button
              onClick={reset}
              style={styles.primaryButton}
            >
              Try Again
            </button>
            <a
              href="/"
              style={styles.secondaryButton}
            >
              Return Home
            </a>
          </div>

          {/* Error info (development) */}
          {error.digest && (
            <div style={styles.errorInfo} className="animate-fade-in-delayed">
              <p style={styles.errorLabel}>Error ID: {error.digest}</p>
              <p style={styles.errorMessage}>{error.message}</p>
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
