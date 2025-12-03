import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useHydration } from "./useHydration";

describe("useHydration", () => {
  it("returns true on client (after hydration)", () => {
    const { result } = renderHook(() => useHydration());
    expect(result.current).toBe(true);
  });

  it("returns consistent value across re-renders", () => {
    const { result, rerender } = renderHook(() => useHydration());
    const firstValue = result.current;
    rerender();
    expect(result.current).toBe(firstValue);
  });
});
