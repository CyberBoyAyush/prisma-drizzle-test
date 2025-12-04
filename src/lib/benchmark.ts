import type { BenchmarkResult } from "@/types";

export async function benchmark<T>(
  fn: () => Promise<T>
): Promise<BenchmarkResult<T>> {
  const start = performance.now();
  const data = await fn();
  const end = performance.now();

  return {
    data,
    timeMs: Math.round((end - start) * 100) / 100,
  };
}

export function formatTime(ms: number): string {
  if (ms < 1) {
    return `${(ms * 1000).toFixed(2)}µs`;
  }
  if (ms < 1000) {
    return `${ms.toFixed(2)}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

export function calculatePercentageDiff(a: number, b: number): number {
  if (a === 0 && b === 0) return 0;
  const avg = (a + b) / 2;
  return Math.round((Math.abs(a - b) / avg) * 100);
}

