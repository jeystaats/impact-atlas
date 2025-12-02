/**
 * Export Utilities for Impact Atlas
 *
 * Provides functions for exporting data in various formats:
 * - CSV export for tabular data
 * - PDF generation via browser print
 * - Clipboard operations
 * - Shareable link generation
 */

import { Hotspot, Module, ModuleMetric } from "@/types";

// ============================================
// Types
// ============================================

export interface ExportOptions {
  filename?: string;
  includeTimestamp?: boolean;
}

export interface ShareLinkParams {
  moduleId: string;
  cityId?: string;
  filters?: Record<string, string | number | boolean>;
  view?: "map" | "list" | "chart";
}

export interface PDFReportData {
  module: Module;
  hotspots?: Hotspot[];
  cityName?: string;
  dateRange?: { start: Date; end: Date };
  generatedAt?: Date;
}

export interface ClipboardResult {
  success: boolean;
  message: string;
}

// ============================================
// CSV Export
// ============================================

/**
 * Convert an array of objects to CSV format and trigger download
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string = "export",
  options: ExportOptions = {}
): void {
  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  const { includeTimestamp = true } = options;

  // Get headers from the first object
  const headers = Object.keys(data[0]);

  // Build CSV content
  const csvContent = [
    // Header row
    headers.map(escapeCSVValue).join(","),
    // Data rows
    ...data.map((row) =>
      headers
        .map((header) => escapeCSVValue(formatCSVValue(row[header])))
        .join(",")
    ),
  ].join("\n");

  // Generate filename with optional timestamp
  const timestamp = includeTimestamp
    ? `_${new Date().toISOString().split("T")[0]}`
    : "";
  const fullFilename = `${filename}${timestamp}.csv`;

  // Trigger download
  downloadFile(csvContent, fullFilename, "text/csv;charset=utf-8;");
}

/**
 * Export hotspots data specifically formatted for Impact Atlas
 */
export function exportHotspotsToCSV(
  hotspots: Hotspot[],
  moduleName: string = "hotspots"
): void {
  const formattedData = hotspots.map((hotspot) => ({
    ID: hotspot.id,
    Title: hotspot.title,
    Description: hotspot.description,
    Severity: hotspot.severity,
    Location: hotspot.location.name,
    Latitude: hotspot.location.lat,
    Longitude: hotspot.location.lng,
    "AI Insights Count": hotspot.aiInsights?.length || 0,
    "Quick Wins Count": hotspot.actions?.length || 0,
  }));

  exportToCSV(formattedData, `impact-atlas-${moduleName}`);
}

/**
 * Escape special characters in CSV values
 */
function escapeCSVValue(value: string): string {
  // If value contains comma, newline, or quote, wrap in quotes
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Format various value types for CSV export
 */
function formatCSVValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "object") {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return JSON.stringify(value);
  }
  return String(value);
}

// ============================================
// PDF Report Generation
// ============================================

/**
 * Generate a printable PDF report using the browser's print functionality
 * Opens a new window with formatted content and triggers print dialog
 */
export function generatePDFReport(data: PDFReportData): void {
  const { module, hotspots = [], cityName, generatedAt = new Date() } = data;

  // Build the HTML content for the report
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Impact Atlas Report - ${module.title}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }

        .header {
          border-bottom: 2px solid #0D9488;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }

        .logo {
          font-size: 24px;
          font-weight: 700;
          color: #0D9488;
          margin-bottom: 8px;
        }

        .subtitle {
          color: #666;
          font-size: 14px;
        }

        h1 {
          font-size: 28px;
          margin: 20px 0 10px;
          color: #111;
        }

        .meta {
          display: flex;
          gap: 20px;
          font-size: 13px;
          color: #666;
          margin-bottom: 30px;
        }

        .section {
          margin-bottom: 30px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e5e5e5;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .metric-card {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 15px;
        }

        .metric-label {
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
        }

        .metric-value {
          font-size: 24px;
          font-weight: 700;
          color: #111;
        }

        .metric-unit {
          font-size: 14px;
          font-weight: 400;
          color: #666;
        }

        .metric-trend {
          font-size: 12px;
          margin-top: 4px;
        }

        .trend-up { color: #10B981; }
        .trend-down { color: #EF4444; }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        th, td {
          text-align: left;
          padding: 10px 12px;
          border-bottom: 1px solid #e5e5e5;
        }

        th {
          background: #f8f9fa;
          font-weight: 600;
          color: #333;
        }

        .severity-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .severity-low { background: #D1FAE5; color: #065F46; }
        .severity-medium { background: #FEF3C7; color: #92400E; }
        .severity-high { background: #FED7AA; color: #9A3412; }
        .severity-critical { background: #FEE2E2; color: #991B1B; }

        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e5e5;
          font-size: 12px;
          color: #666;
          text-align: center;
        }

        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Impact Atlas</div>
        <div class="subtitle">Environmental Intelligence Platform</div>
      </div>

      <h1>${module.title}</h1>
      <p style="color: #666; margin-bottom: 20px;">${module.description}</p>

      <div class="meta">
        ${cityName ? `<span>City: ${cityName}</span>` : ""}
        <span>Generated: ${generatedAt.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}</span>
      </div>

      <div class="section">
        <div class="section-title">Key Metrics</div>
        <div class="metrics-grid">
          ${module.metrics
            .map(
              (metric: ModuleMetric) => `
            <div class="metric-card">
              <div class="metric-label">${metric.label}</div>
              <div class="metric-value">
                ${metric.value}
                ${metric.unit ? `<span class="metric-unit">${metric.unit}</span>` : ""}
              </div>
              ${
                metric.trend && metric.trendValue
                  ? `<div class="metric-trend ${metric.trend === "up" ? "trend-up" : "trend-down"}">
                      ${metric.trend === "up" ? "+" : ""}${metric.trendValue}
                    </div>`
                  : ""
              }
            </div>
          `
            )
            .join("")}
        </div>
      </div>

      ${
        hotspots.length > 0
          ? `
        <div class="section">
          <div class="section-title">Identified Hotspots (${hotspots.length})</div>
          <table>
            <thead>
              <tr>
                <th>Location</th>
                <th>Severity</th>
                <th>Description</th>
                <th>Quick Wins</th>
              </tr>
            </thead>
            <tbody>
              ${hotspots
                .map(
                  (hotspot) => `
                <tr>
                  <td>${hotspot.location.name}</td>
                  <td>
                    <span class="severity-badge severity-${hotspot.severity}">
                      ${hotspot.severity}
                    </span>
                  </td>
                  <td>${hotspot.title}</td>
                  <td>${hotspot.actions?.length || 0}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `
          : ""
      }

      <div class="footer">
        <p>Impact Atlas - Transforming environmental data into actionable insights</p>
        <p style="margin-top: 4px;">This report was automatically generated. Data accuracy subject to source reliability.</p>
      </div>

      <script>
        // Auto-trigger print dialog
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  // Open new window with the report
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}

// ============================================
// Clipboard Operations
// ============================================

/**
 * Copy text to clipboard with modern API fallback
 */
export async function copyToClipboard(text: string): Promise<ClipboardResult> {
  try {
    // Try modern Clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return { success: true, message: "Copied to clipboard" };
    }

    // Fallback for older browsers or non-secure contexts
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);

    if (successful) {
      return { success: true, message: "Copied to clipboard" };
    } else {
      return { success: false, message: "Failed to copy to clipboard" };
    }
  } catch (error) {
    console.error("Clipboard operation failed:", error);
    return { success: false, message: "Failed to copy to clipboard" };
  }
}

/**
 * Copy hotspots data as formatted text
 */
export async function copyHotspotsData(
  hotspots: Hotspot[],
  format: "text" | "json" = "text"
): Promise<ClipboardResult> {
  if (format === "json") {
    return copyToClipboard(JSON.stringify(hotspots, null, 2));
  }

  // Format as readable text
  const textContent = hotspots
    .map(
      (h, i) =>
        `${i + 1}. ${h.title}\n   Location: ${h.location.name}\n   Severity: ${h.severity}\n   ${h.description}`
    )
    .join("\n\n");

  return copyToClipboard(textContent);
}

// ============================================
// Shareable Link Generation
// ============================================

/**
 * Create a shareable URL with encoded parameters
 */
export function createShareableLink(params: ShareLinkParams): string {
  const { moduleId, cityId, filters, view } = params;

  // Get base URL
  const baseUrl = typeof window !== "undefined"
    ? window.location.origin
    : "https://impactatlas.io";

  // Build URL with module path
  const url = new URL(`${baseUrl}/dashboard/modules/${moduleId}`);

  // Add query parameters
  if (cityId) {
    url.searchParams.set("city", cityId);
  }

  if (view) {
    url.searchParams.set("view", view);
  }

  if (filters && Object.keys(filters).length > 0) {
    // Encode filters as base64 JSON for cleaner URLs
    const filtersEncoded = btoa(JSON.stringify(filters));
    url.searchParams.set("f", filtersEncoded);
  }

  // Add share identifier for analytics
  url.searchParams.set("ref", "share");

  return url.toString();
}

/**
 * Parse a shareable link and extract parameters
 */
export function parseShareableLink(url: string): ShareLinkParams | null {
  try {
    const parsedUrl = new URL(url);
    const pathParts = parsedUrl.pathname.split("/");
    const moduleIndex = pathParts.indexOf("modules");

    if (moduleIndex === -1 || !pathParts[moduleIndex + 1]) {
      return null;
    }

    const moduleId = pathParts[moduleIndex + 1];
    const cityId = parsedUrl.searchParams.get("city") || undefined;
    const view = parsedUrl.searchParams.get("view") as "map" | "list" | "chart" | undefined;

    let filters: Record<string, string | number | boolean> | undefined;
    const filtersParam = parsedUrl.searchParams.get("f");
    if (filtersParam) {
      try {
        filters = JSON.parse(atob(filtersParam));
      } catch {
        // Invalid filters, ignore
      }
    }

    return { moduleId, cityId, filters, view };
  } catch {
    return null;
  }
}

/**
 * Generate email share content
 */
export function generateEmailShareLink(params: ShareLinkParams & {
  subject?: string;
  body?: string;
}): string {
  const shareUrl = createShareableLink(params);
  const subject = params.subject || "Check out this Impact Atlas insight";
  const body = params.body ||
    `I found some interesting environmental data on Impact Atlas:\n\n${shareUrl}\n\nTake a look!`;

  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// ============================================
// Chart Export (PNG)
// ============================================

/**
 * Export a chart element as PNG using canvas
 */
export async function exportChartAsPNG(
  chartElement: HTMLElement,
  filename: string = "chart"
): Promise<boolean> {
  try {
    // Dynamic import to avoid SSR issues
    const html2canvas = (await import("html2canvas")).default;

    const canvas = await html2canvas(chartElement, {
      backgroundColor: "#ffffff",
      scale: 2, // Higher resolution
      logging: false,
    });

    // Convert to PNG and download
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${filename}_${new Date().toISOString().split("T")[0]}.png`;
    link.href = dataUrl;
    link.click();

    return true;
  } catch (error) {
    console.error("Failed to export chart as PNG:", error);
    return false;
  }
}

/**
 * Simplified chart export that captures SVG elements
 */
export function exportSVGAsPNG(
  svgElement: SVGElement,
  filename: string = "chart"
): void {
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = svgElement.clientWidth * 2;
    canvas.height = svgElement.clientHeight * 2;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(2, 2);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const pngUrl = canvas.toDataURL("image/png");
      downloadFile(pngUrl, `${filename}.png`, "image/png", true);
    }

    URL.revokeObjectURL(svgUrl);
  };

  img.src = svgUrl;
}

// ============================================
// Utility Functions
// ============================================

/**
 * Trigger file download in browser
 */
function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
  isDataUrl: boolean = false
): void {
  const link = document.createElement("a");

  if (isDataUrl) {
    link.href = content;
  } else {
    const blob = new Blob([content], { type: mimeType });
    link.href = URL.createObjectURL(blob);
  }

  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Cleanup blob URL
  if (!isDataUrl) {
    URL.revokeObjectURL(link.href);
  }
}

/**
 * Format data for export based on module type
 */
export function formatModuleDataForExport(
  moduleId: string,
  data: Record<string, unknown>[]
): Record<string, unknown>[] {
  // Module-specific formatting can be added here
  switch (moduleId) {
    case "urban-heat":
      return data.map((item) => ({
        ...item,
        temperature: item.temperature ? `${item.temperature}°C` : undefined,
      }));
    case "coastal-plastic":
    case "ocean-plastic":
      return data.map((item) => ({
        ...item,
        weight: item.weight ? `${item.weight} kg` : undefined,
      }));
    default:
      return data;
  }
}
