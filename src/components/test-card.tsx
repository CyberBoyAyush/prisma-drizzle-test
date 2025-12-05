"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import type { AggregateStats, DeepTestStats, TestConfig, TestResult, TestStatus } from "@/types";
import { formatTime } from "@/lib/benchmark";

interface TestCardProps {
  config: TestConfig;
  onRun: () => Promise<TestResult>;
  result: TestResult | null;
  isRunning?: boolean;
  onRunDeep?: () => Promise<void>;
  deepStats?: DeepTestStats | null;
  isDeepRunning?: boolean;
}

export function TestCard({
  config,
  onRun,
  result,
  isRunning = false,
  onRunDeep,
  deepStats,
  isDeepRunning = false,
}: TestCardProps) {
  const [status, setStatus] = useState<TestStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isRunning) {
      setStatus("running");
      setError(null);
    } else if (result) {
      setStatus("completed");
      setError(null);
    } else if (!isRunning && !result) {
      setStatus("idle");
    }
  }, [isRunning, result]);

  const handleRun = async () => {
    setStatus("running");
    setError(null);
    try {
      await onRun();
      setStatus("completed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "running":
        return <Loader2 className="h-4 w-4 animate-spin text-amber-500" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getWinner = () => {
    if (!result) return null;
    if (result.prisma.timeMs < result.drizzle.timeMs) return "prisma";
    if (result.drizzle.timeMs < result.prisma.timeMs) return "drizzle";
    return "tie";
  };

  const winner = getWinner();

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <CardTitle className="text-lg font-semibold text-zinc-100">
              {config.name}
            </CardTitle>
            {getStatusIcon()}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onRunDeep && (
              <Button
                size="sm"
                variant="outline"
                onClick={onRunDeep}
                disabled={isDeepRunning || status === "running"}
                className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600"
              >
                {isDeepRunning ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                ) : (
                  <Play className="h-4 w-4 mr-1.5" />
                )}
                {isDeepRunning ? "Running..." : "DeepTest (10x)"}
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleRun}
              disabled={status === "running" || isDeepRunning}
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600"
            >
              {status === "running" ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : (
                <Play className="h-4 w-4 mr-1.5" />
              )}
              {status === "running" ? "Running..." : "Run Test"}
            </Button>
          </div>
        </div>
        <CardDescription className="text-zinc-400 mt-1">
          {config.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status === "running" && !result && (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full bg-zinc-800" />
            <Skeleton className="h-12 w-full bg-zinc-800" />
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <div className={`flex items-center justify-between p-3 rounded-lg border ${
              winner === "prisma" 
                ? "bg-emerald-950/20 border-emerald-800/50" 
                : "bg-zinc-800/50 border-zinc-700/50"
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="font-medium text-zinc-200">Prisma</span>
                {winner === "prisma" && (
                  <Badge variant="outline" className="bg-emerald-900/50 text-emerald-400 border-emerald-700">
                    Winner
                  </Badge>
                )}
              </div>
              <span className="font-mono text-lg text-zinc-100">
                {formatTime(result.prisma.timeMs)}
              </span>
            </div>

            <div className={`flex items-center justify-between p-3 rounded-lg border ${
              winner === "drizzle" 
                ? "bg-sky-950/20 border-sky-800/50" 
                : "bg-zinc-800/50 border-zinc-700/50"
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-sky-500" />
                <span className="font-medium text-zinc-200">Drizzle</span>
                {winner === "drizzle" && (
                  <Badge variant="outline" className="bg-sky-900/50 text-sky-400 border-sky-700">
                    Winner
                  </Badge>
                )}
              </div>
              <span className="font-mono text-lg text-zinc-100">
                {formatTime(result.drizzle.timeMs)}
              </span>
            </div>

            {winner !== "tie" && (
              <p className="text-xs text-zinc-500 text-center mt-2">
                {winner === "prisma" ? "Prisma" : "Drizzle"} was{" "}
                <span className={winner === "prisma" ? "text-emerald-400" : "text-sky-400"}>
                  {Math.round(
                    ((Math.max(result.prisma.timeMs, result.drizzle.timeMs) -
                      Math.min(result.prisma.timeMs, result.drizzle.timeMs)) /
                      Math.min(result.prisma.timeMs, result.drizzle.timeMs)) *
                      100
                  )}%
                </span>{" "}
                faster
              </p>
            )}
          </div>
        )}

        {deepStats && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase text-zinc-500">{deepStats.runs} runs (DeepTest)</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <DeepStatsColumn label="Prisma" tone="emerald" stats={deepStats.prisma} />
              <DeepStatsColumn label="Drizzle" tone="sky" stats={deepStats.drizzle} />
            </div>
          </div>
        )}

        {status === "idle" && (
          <div className="flex items-center justify-center h-24 text-zinc-500">
            <p className="text-sm">Click "Run Test" to start</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DeepStatsColumn({
  label,
  stats,
  tone,
}: {
  label: string;
  stats: AggregateStats;
  tone: "emerald" | "sky";
}) {
  const accent = tone === "emerald" ? "text-emerald-400" : "text-sky-400";
  return (
    <div className="space-y-1">
      <p className={`text-xs uppercase ${accent}`}>{label}</p>
      <StatRow name="p95" value={formatTime(stats.p95)} />
      <StatRow name="p90" value={formatTime(stats.p90)} />
      <StatRow name="avg" value={formatTime(stats.avg)} />
      <StatRow name="min" value={formatTime(stats.min)} />
      <StatRow name="max" value={formatTime(stats.max)} />
    </div>
  );
}

function StatRow({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-zinc-300">
      <span>{name}</span>
      <span className="text-zinc-100">{value}</span>
    </div>
  );
}

