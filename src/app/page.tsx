"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { TestCard } from "@/components/test-card";
import { ComparisonChart } from "@/components/comparison-chart";
import { ResultsTable } from "@/components/results-table";
import { TEST_CONFIGS } from "@/config/tests";
import {
  runCrudTest,
  runJoinsTest,
  runAggregationsTest,
  runSubqueriesTest,
  runTransactionsTest,
  runBulkTest,
} from "@/app/actions/tests";
import type { TestResult } from "@/types";
import {
  Database,
  Zap,
  BarChart3,
  Play,
  Loader2,
  Github,
  ExternalLink,
} from "lucide-react";

const testRunners: Record<string, () => Promise<TestResult>> = {
  crud: runCrudTest,
  joins: runJoinsTest,
  aggregations: runAggregationsTest,
  subqueries: runSubqueriesTest,
  transactions: runTransactionsTest,
  bulk: runBulkTest,
};

export default function Home() {
  const [results, setResults] = useState<Map<string, TestResult>>(new Map());
  const [isRunningAll, setIsRunningAll] = useState(false);

  const handleTestComplete = useCallback((testId: string, result: TestResult) => {
    setResults((prev) => new Map(prev).set(testId, result));
  }, []);

  const runTest = useCallback(
    async (testId: string): Promise<TestResult> => {
      const runner = testRunners[testId];
      if (!runner) throw new Error(`Unknown test: ${testId}`);
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
      }
    }

    setIsRunningAll(false);
  };

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
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-sky-900/10 via-transparent to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-zinc-800/50 backdrop-blur-sm bg-zinc-950/50 sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-sky-500/20 border border-zinc-800">
                <Database className="h-5 w-5 text-zinc-100" />
              </div>
              <div>
                <h1 className="font-semibold text-zinc-100">ORM Benchmark</h1>
                <p className="text-xs text-zinc-500">Prisma 7 vs Drizzle</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-zinc-900 border-zinc-700 text-zinc-400">
                Neon PostgreSQL
              </Badge>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <Github className="h-5 w-5 text-zinc-400" />
              </a>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-sm text-zinc-400">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Real-time Performance Testing
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              <span className="text-zinc-100">Compare </span>
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                Prisma
              </span>
              <span className="text-zinc-100"> vs </span>
              <span className="bg-gradient-to-r from-sky-400 to-sky-600 bg-clip-text text-transparent">
                Drizzle
              </span>
            </h1>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              A comprehensive performance benchmark comparing Prisma 7 and Drizzle ORM
              with real database queries on Neon PostgreSQL.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                size="lg"
                onClick={runAllTests}
                disabled={isRunningAll}
                className="bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-medium px-8"
              >
                {isRunningAll ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run All Tests
                  </>
                )}
              </Button>
              <div className="flex items-center gap-4 text-sm text-zinc-500">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Prisma 7
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  Drizzle
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        {allResults.length > 0 && (
          <section className="container mx-auto px-6 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-zinc-500 mb-1">Tests Completed</p>
                    <p className="text-3xl font-bold text-zinc-100">
                      {allResults.length}
                      <span className="text-zinc-500 text-lg font-normal">
                        /{TEST_CONFIGS.length}
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-zinc-500 mb-1">Total Time</p>
                    <p className="text-3xl font-bold">
                      <span className="text-emerald-400">
                        {allResults.reduce((s, r) => s + r.prisma.timeMs, 0).toFixed(0)}
                      </span>
                      <span className="text-zinc-500 text-lg font-normal mx-2">vs</span>
                      <span className="text-sky-400">
                        {allResults.reduce((s, r) => s + r.drizzle.timeMs, 0).toFixed(0)}
                      </span>
                      <span className="text-zinc-500 text-sm font-normal">ms</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-zinc-500 mb-1">Overall Winner</p>
                    {overallWinner === "prisma" ? (
                      <Badge className="bg-emerald-900/50 text-emerald-400 border-emerald-700 text-lg px-4 py-1">
                        Prisma
                      </Badge>
                    ) : overallWinner === "drizzle" ? (
                      <Badge className="bg-sky-900/50 text-sky-400 border-sky-700 text-lg px-4 py-1">
                        Drizzle
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-zinc-800 border-zinc-700 text-lg px-4 py-1">
                        Tie
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {TEST_CONFIGS.map((config) => (
                  <TestCard
                    key={config.id}
                    config={config}
                    onRun={() => runTest(config.id)}
                    result={results.get(config.id) ?? null}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="chart" className="space-y-8">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-zinc-100">Performance Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ComparisonChart results={allResults} />
                </CardContent>
              </Card>
              <ResultsTable results={allResults} />
            </TabsContent>
          </Tabs>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-800/50 py-8">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span>Powered by Neon PostgreSQL</span>
              </div>
              <div className="flex items-center gap-6">
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
