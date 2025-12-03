/**
 * Shared Chart Utilities
 *
 * This file contains common utilities used across all chart components.
 * Centralizing these reduces code duplication and ensures consistency.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface NiceScale {
  min: number;
  max: number;
  ticks: number[];
}

export interface Point {
  x: number;
  y: number;
}

// =============================================================================
// SCALE CALCULATIONS
// =============================================================================

/**
 * Calculates a "nice" scale with round numbers for axis ticks
 * Used by BarChart and AreaChart
 */
export function calculateNiceScale(
  min: number,
  max: number,
  tickCount: number = 5
): NiceScale {
  // Handle edge case where min === max
  if (min === max) {
    if (min === 0) {
      return { min: 0, max: 10, ticks: [0, 2, 4, 6, 8, 10] };
    }
    // Add 10% padding
    const padding = Math.abs(min) * 0.1 || 1;
    min = min - padding;
    max = max + padding;
  }

  const range = max - min;
  const roughStep = range / (tickCount - 1);

  // Find nice step size
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const residual = roughStep / magnitude;

  let niceStep: number;
  if (residual <= 1.5) niceStep = 1 * magnitude;
  else if (residual <= 3) niceStep = 2 * magnitude;
  else if (residual <= 7) niceStep = 5 * magnitude;
  else niceStep = 10 * magnitude;

  const niceMin = Math.floor(min / niceStep) * niceStep;
  const niceMax = Math.ceil(max / niceStep) * niceStep;

  const ticks: number[] = [];
  for (let val = niceMin; val <= niceMax + niceStep * 0.1; val += niceStep) {
    ticks.push(Math.round(val * 1000) / 1000);
  }

  return { min: niceMin, max: niceMax, ticks };
}

/**
 * Simplified version that only calculates max (for positive-only scales)
 * Used by BarChart
 */
export function calculateNiceMax(max: number, tickCount: number = 5): NiceScale {
  return calculateNiceScale(0, max, tickCount);
}

// =============================================================================
// PATH GENERATION
// =============================================================================

/**
 * Generates a smooth curved path using cardinal spline interpolation
 * Used by TrendChart and AreaChart
 */
export function generateSmoothPath(
  points: Point[],
  tension: number = 0.3
): string {
  if (points.length < 2) return "";

  let pathD = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    // Control points using tension factor
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return pathD;
}

/**
 * Generates a closed area path (line + fill below)
 * Used by AreaChart
 */
export function generateAreaPath(
  points: Point[],
  baseY: number,
  tension: number = 0.3
): string {
  if (points.length < 2) return "";

  const linePath = generateSmoothPath(points, tension);
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];

  return `${linePath} L ${lastPoint.x} ${baseY} L ${firstPoint.x} ${baseY} Z`;
}

/**
 * Generates a closed fill path for trend charts
 * Used by TrendChart
 */
export function generateClosedPath(
  points: Point[],
  height: number,
  tension: number = 0.3
): string {
  if (points.length < 2) return "";

  const linePath = generateSmoothPath(points, tension);
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];

  return `${linePath} L ${lastPoint.x} ${height} L ${firstPoint.x} ${height} Z`;
}

// =============================================================================
// POLAR COORDINATES (for Donut/Pie charts)
// =============================================================================

/**
 * Converts polar coordinates to Cartesian
 * Used by DonutChart
 */
export function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): Point {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

/**
 * Describes an arc path for donut/pie segments
 * Used by DonutChart
 */
export function describeArc(
  x: number,
  y: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(x, y, outerRadius, endAngle);
  const end = polarToCartesian(x, y, outerRadius, startAngle);
  const innerStart = polarToCartesian(x, y, innerRadius, endAngle);
  const innerEnd = polarToCartesian(x, y, innerRadius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    "M", start.x, start.y,
    "A", outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
    "L", innerEnd.x, innerEnd.y,
    "A", innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
    "Z",
  ].join(" ");
}

// =============================================================================
// VALUE FORMATTING
// =============================================================================

/**
 * Default number formatter
 */
export function formatNumber(value: number): string {
  return value.toLocaleString();
}

/**
 * Compact number formatter (1K, 1M, etc.)
 */
export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toLocaleString();
}

/**
 * Percentage formatter
 */
export function formatPercentage(value: number, total: number): string {
  return `${((value / total) * 100).toFixed(1)}%`;
}

// =============================================================================
// DATA UTILITIES
// =============================================================================

/**
 * Clamps a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Maps a value from one range to another
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}
