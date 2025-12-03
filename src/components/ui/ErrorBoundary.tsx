"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showHomeLink?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component for graceful error handling.
 * Wraps components to catch JavaScript errors and display a fallback UI.
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <MapVisualization />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to console in development
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-[var(--background-secondary)] rounded-xl border border-[var(--border)]">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-[var(--foreground-secondary)] text-center mb-4 max-w-md">
            {this.state.error?.message || "An unexpected error occurred. Please try again."}
          </p>
          <div className="flex gap-3">
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              Try Again
            </button>
            {this.props.showHomeLink && (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Smaller inline error boundary for chart/widget components
 */
export class ChartErrorBoundary extends Component<
  { children: ReactNode; chartName?: string },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; chartName?: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error(`Chart error in ${this.props.chartName || "unknown"}:`, error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[150px] p-4 bg-[var(--background-secondary)] rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-500 mb-2" />
          <p className="text-xs text-[var(--foreground-secondary)] text-center mb-2">
            {this.props.chartName ? `${this.props.chartName} failed to load` : "Chart failed to load"}
          </p>
          <button
            onClick={this.handleRetry}
            className="text-xs text-[var(--accent)] hover:underline"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Map-specific error boundary with relevant messaging
 */
export class MapErrorBoundary extends Component<
  { children: ReactNode; onRetry?: () => void },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; onRetry?: () => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Map error:", error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[300px] p-6 bg-gradient-to-b from-[var(--background)] to-[var(--background-secondary)] rounded-xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            Map failed to load
          </h3>
          <p className="text-sm text-[var(--foreground-secondary)] text-center mb-4 max-w-sm">
            There was a problem loading the map visualization. This might be due to network issues or browser compatibility.
          </p>
          <button
            onClick={this.handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Reload Map
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
