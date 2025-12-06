"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TestCard } from "@/components/test-card";
import { ComparisonChart } from "@/components/comparison-chart";
import { ResultsTable } from "@/components/results-table";
import { Navbar } from "@/components/navbar";
import { TEST_CONFIGS } from "@/config/tests";
import {
  runCrudTest,
  runJoinsTest,
  runAggregationsTest,
  runSubqueriesTest,
  runTransactionsTest,
  runBulkTest,
} from "@/app/actions/tests";
import type { AggregateStats, DeepTestStats, TestResult } from "@/types";
import {
  Database,
  Zap,
  BarChart3,
  Play,
  Loader2,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

const testRunners: Record<string, () => Promise<TestResult>> = {
  crud: runCrudTest,
  joins: runJoinsTest,
  aggregations: runAggregationsTest,
  subqueries: runSubqueriesTest,
  transactions: runTransactionsTest,
  bulk: runBulkTest,
};

const calculatePercentile = (values: number[], percentile: number): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(percentile * sorted.length) - 1)
  );
  return sorted[index];
};

const summarizeRuns = (values: number[]): AggregateStats => {
  if (values.length === 0) {
    return { p95: 0, p90: 0, avg: 0, min: 0, max: 0 };
  }
  const total = values.reduce((sum, value) => sum + value, 0);
  const avg = Math.round((total / values.length) * 100) / 100;

  return {
    p95: calculatePercentile(values, 0.95),
    p90: calculatePercentile(values, 0.9),
    avg,
    min: Math.min(...values),
    max: Math.max(...values),
  };
};

export default function Home() {
  const [results, setResults] = useState<Map<string, TestResult>>(new Map());
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [runningTestId, setRunningTestId] = useState<string | null>(null);
  const [isRunningDeepTest, setIsRunningDeepTest] = useState(false);
  const [deepRunningTestId, setDeepRunningTestId] = useState<string | null>(null);
  const [deepResults, setDeepResults] = useState<Map<string, DeepTestStats>>(new Map());

  const handleTestComplete = useCallback((testId: string, result: TestResult) => {
    setResults((prev) => new Map(prev).set(testId, result));
    setRunningTestId(null);
  }, []);

  const runTest = useCallback(
    async (testId: string): Promise<TestResult> => {
      const runner = testRunners[testId];
      if (!runner) throw new Error(`Unknown test: ${testId}`);
      setRunningTestId(testId);
      const result = await runner();
      handleTestComplete(testId, result);
      return result;
    },
    [handleTestComplete]
  );

  const runAllTests = async () => {
    setIsRunningAll(true);
    setResults(new Map());

    for (const config of TEST_CONFIGS) {
      try {
        await runTest(config.id);
      } catch (error) {
        console.error(`Failed to run ${config.name}:`, error);
        setRunningTestId(null);
      }
    }

    setIsRunningAll(false);
    setRunningTestId(null);
  };

  const runDeepTest = useCallback(async () => {
    if (isRunningDeepTest) return;
    setIsRunningDeepTest(true);
    setDeepResults(new Map());

    for (const config of TEST_CONFIGS) {
      const prismaTimes: number[] = [];
      const drizzleTimes: number[] = [];
      setDeepRunningTestId(config.id);

      for (let i = 0; i < 10; i += 1) {
        try {
          const result = await runTest(config.id);
          prismaTimes.push(result.prisma.timeMs);
          drizzleTimes.push(result.drizzle.timeMs);
        } catch (error) {
          console.error(`Failed to run deep test for ${config.name}:`, error);
        }
      }

      setDeepResults((prev) =>
        new Map(prev).set(config.id, {
          prisma: summarizeRuns(prismaTimes),
          drizzle: summarizeRuns(drizzleTimes),
          runs: prismaTimes.length,
          testName: config.name,
        })
      );
    }

    setDeepRunningTestId(null);
    setIsRunningDeepTest(false);
  }, [isRunningDeepTest, runTest]);

  const runDeepTestSingle = useCallback(
    async (testId: string) => {
      if (isRunningDeepTest) return;
      setIsRunningDeepTest(true);
      setDeepRunningTestId(testId);

      const prismaTimes: number[] = [];
      const drizzleTimes: number[] = [];

      for (let i = 0; i < 10; i += 1) {
        try {
          const result = await runTest(testId);
          prismaTimes.push(result.prisma.timeMs);
          drizzleTimes.push(result.drizzle.timeMs);
        } catch (error) {
          console.error(`Failed to run deep test for ${testId}:`, error);
        }
      }

      setDeepResults((prev) =>
        new Map(prev).set(testId, {
          prisma: summarizeRuns(prismaTimes),
          drizzle: summarizeRuns(drizzleTimes),
          runs: prismaTimes.length,
          testName: TEST_CONFIGS.find((t) => t.id === testId)?.name ?? testId,
        })
      );

      setDeepRunningTestId(null);
      setIsRunningDeepTest(false);
    },
    [isRunningDeepTest, runTest]
  );

  const allResults = Array.from(results.values());

  const calculateOverallWinner = () => {
    if (allResults.length === 0) return null;
    const prismaTotal = allResults.reduce((sum, r) => sum + r.prisma.timeMs, 0);
    const drizzleTotal = allResults.reduce((sum, r) => sum + r.drizzle.timeMs, 0);
    if (prismaTotal < drizzleTotal) return "prisma";
    if (drizzleTotal < prismaTotal) return "drizzle";
    return "tie";
  };

  const overallWinner = calculateOverallWinner();

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-black to-zinc-950 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-sky-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/3 via-transparent to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <Navbar />

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-sm text-zinc-400">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Real-time Performance Testing
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              <span className="text-zinc-100">Compare </span>
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text text-transparent">
                Prisma 7.1.0
              </span>
              <span className="text-zinc-100"> vs </span>
              <span className="bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 bg-clip-text text-transparent">
                Drizzle 0.45.0
              </span>
            </h1>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              A comprehensive performance benchmark comparing Prisma 7.1.0 and Drizzle ORM 0.45.0
              with real database queries on Neon PostgreSQL.
            </p>
            <div className="max-w-2xl mx-auto pt-2 space-y-3">
              <p className="text-sm text-zinc-500 leading-relaxed">
                This is a fun project I created to test and compare the performance differences between{" "}
                <span className="text-emerald-400">Prisma</span> and{" "}
                <span className="text-sky-400">Drizzle</span> ORMs. Each test measures real-world database
                operations to help understand which ORM performs better for different use cases.
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Database: Neon (Singapore)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                  Hosted on Railway (Singapore)
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4 pt-6">
              <Link href="/about">
                <Button
                  variant="outline"
                  className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 hover:text-zinc-100"
                >
                  Know More About Tests
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Button
                  onClick={runAllTests}
                  disabled={isRunningAll || isRunningDeepTest}
                  className="bg-zinc-100 hover:bg-white text-zinc-900 font-medium"
                >
                  {isRunningAll ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Run All Tests
                </Button>
                <Button
                  variant="outline"
                  onClick={runDeepTest}
                  disabled={isRunningAll || isRunningDeepTest}
                  className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 hover:text-zinc-100"
                >
                  {isRunningDeepTest && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  DeepTest (10 runs)
                  <Zap className="h-4 w-4 ml-2 text-amber-500" />
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Prisma 7.1.0
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  Drizzle 0.45.0
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        {allResults.length > 0 && (
          <section className="container mx-auto px-6 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {/* Tests Completed */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <p className="text-xs text-zinc-500 mb-3">Tests Completed</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-semibold text-zinc-100 tabular-nums">
                    {allResults.length}
                  </span>
                  <span className="text-zinc-600 text-sm">/{TEST_CONFIGS.length}</span>
                </div>
              </div>

              {/* Total Time */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <p className="text-xs text-zinc-500 mb-3">Total Time</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-lg font-semibold text-zinc-100 tabular-nums">
                      {allResults.reduce((s, r) => s + r.prisma.timeMs, 0).toFixed(0)}
                      <span className="text-xs text-zinc-500 font-normal ml-1">ms</span>
                    </span>
                  </div>
                  <span className="text-zinc-600 text-xs">vs</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    <span className="text-lg font-semibold text-zinc-100 tabular-nums">
                      {allResults.reduce((s, r) => s + r.drizzle.timeMs, 0).toFixed(0)}
                      <span className="text-xs text-zinc-500 font-normal ml-1">ms</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Overall Winner */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <p className="text-xs text-zinc-500 mb-3">Overall Winner</p>
                <div className="flex items-center justify-between">
                  {overallWinner === "prisma" ? (
                    <span className="text-lg font-semibold text-emerald-400">Prisma</span>
                  ) : overallWinner === "drizzle" ? (
                    <span className="text-lg font-semibold text-sky-400">Drizzle</span>
                  ) : (
                    <span className="text-lg font-semibold text-zinc-400">Tie</span>
                  )}
                  {overallWinner && overallWinner !== "tie" && (
                    <span className={`text-xs ${overallWinner === "prisma" ? "text-emerald-500/70" : "text-sky-500/70"}`}>
                      {(() => {
                        const prismaTotal = allResults.reduce((s, r) => s + r.prisma.timeMs, 0);
                        const drizzleTotal = allResults.reduce((s, r) => s + r.drizzle.timeMs, 0);
                        const diff = Math.abs(prismaTotal - drizzleTotal);
                        const min = Math.min(prismaTotal, drizzleTotal);
                        return `${Math.round((diff / min) * 100)}% faster`;
                      })()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Main Content */}
        <section className="container mx-auto px-6 pb-16">
          <Tabs defaultValue="tests" className="space-y-8">
            <div className="flex justify-center">
              <TabsList className="bg-zinc-900 border border-zinc-800">
                <TabsTrigger value="tests" className="data-[state=active]:bg-zinc-800">
                  <Zap className="h-4 w-4 mr-2" />
                  Tests
                </TabsTrigger>
                <TabsTrigger value="chart" className="data-[state=active]:bg-zinc-800">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Chart
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="tests" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {TEST_CONFIGS.map((config) => (
                  <TestCard
                    key={config.id}
                    config={config}
                    onRun={() => runTest(config.id)}
                    result={results.get(config.id) ?? null}
                    isRunning={runningTestId === config.id}
                    onRunDeep={() => runDeepTestSingle(config.id)}
                    deepStats={deepResults.get(config.id) ?? null}
                    isDeepRunning={deepRunningTestId === config.id && isRunningDeepTest}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="chart" className="space-y-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <p className="text-xs text-zinc-500 mb-4">Performance Comparison</p>
                <ComparisonChart results={allResults} />
              </div>
              <ResultsTable results={allResults} />
            </TabsContent>
          </Tabs>
        </section>

        {/* Suggest Tests CTA */}
        <section className="container mx-auto px-6 pb-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-5 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-zinc-100">Suggest new tests</h3>
                <p className="text-sm text-zinc-500">
                  Think we missed a scenario? Open a GitHub issue and propose a Prisma vs Drizzle workload.
                </p>
              </div>
              <a
                href="https://github.com/CyberBoyAyush/orm-test/issues/new/choose"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800"
                >
                  Propose a test
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-800/50 py-8">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span>Powered by Neon PostgreSQL</span>
                </div>
                <span className="hidden md:inline text-zinc-700">•</span>
                <span>
                  Created by{" "}
                  <a
                    href="https://aysh.me"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-300 hover:text-zinc-100 transition-colors"
                  >
                    Ayush Sharma
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-6">
                <a
                  href="https://x.com/cyberboyayush"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="https://www.prisma.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
                >
                  Prisma <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="https://orm.drizzle.team"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
                >
                  Drizzle <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="https://neon.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
                >
                  Neon <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
