export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background,#fafbfc)]">
      {/* Spinner container */}
      <div className="relative w-16 h-16 mb-6">
        {/* Outer ring */}
        <div
          className="absolute inset-0 rounded-full border-2 border-[var(--border,#e5e7eb)] opacity-30"
        />

        {/* Spinning ring */}
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--accent,#0d9488)] animate-spin"
          style={{ animationDuration: "1s" }}
        />

        {/* Center dot */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[var(--accent,#0d9488)] animate-pulse"
        />
      </div>

      {/* Loading text */}
      <div className="flex items-center gap-1 text-sm text-[var(--foreground-muted,#9ca3af)]">
        <span>Loading</span>
        <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
        <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
        <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
      </div>
    </div>
  );
}
