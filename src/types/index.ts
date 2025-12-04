export interface BenchmarkResult<T = unknown> {
  data: T;
  timeMs: number;
}

export interface TestResult<T = unknown> {
  prisma: BenchmarkResult<T>;
  drizzle: BenchmarkResult<T>;
  testName: string;
  timestamp: number;
}

export interface TestConfig {
  id: string;
  name: string;
  description: string;
  category: "crud" | "joins" | "aggregations" | "subqueries" | "transactions" | "bulk";
}

export type TestStatus = "idle" | "running" | "completed" | "error";

export interface TestState {
  status: TestStatus;
  result: TestResult | null;
  error: string | null;
}

export interface ComparisonStats {
  prismaAvg: number;
  drizzleAvg: number;
  prismaTotal: number;
  drizzleTotal: number;
  winner: "prisma" | "drizzle" | "tie";
  percentageDiff: number;
}

