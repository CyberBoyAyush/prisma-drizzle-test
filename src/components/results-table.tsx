"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { TestResult } from "@/types";
import { formatTime } from "@/lib/benchmark";

interface ResultsTableProps {
  results: TestResult[];
}

export function ResultsTable({ results }: ResultsTableProps) {
  if (results.length === 0) {
    return null;
  }

  const getWinner = (result: TestResult) => {
    if (result.prisma.timeMs < result.drizzle.timeMs) return "prisma";
    if (result.drizzle.timeMs < result.prisma.timeMs) return "drizzle";
    return "tie";
  };

  const getDiff = (result: TestResult) => {
    const diff = Math.abs(result.prisma.timeMs - result.drizzle.timeMs);
    const min = Math.min(result.prisma.timeMs, result.drizzle.timeMs);
    return Math.round((diff / min) * 100);
  };

  // Calculate totals
  const totalPrisma = results.reduce((sum, r) => sum + r.prisma.timeMs, 0);
  const totalDrizzle = results.reduce((sum, r) => sum + r.drizzle.timeMs, 0);
  const prismaWins = results.filter((r) => getWinner(r) === "prisma").length;
  const drizzleWins = results.filter((r) => getWinner(r) === "drizzle").length;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-800 overflow-x-auto">
        <Table className="min-w-[500px]">
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
              <TableHead className="text-zinc-400">Test</TableHead>
              <TableHead className="text-zinc-400 text-right">Prisma</TableHead>
              <TableHead className="text-zinc-400 text-right">Drizzle</TableHead>
              <TableHead className="text-zinc-400 text-right">Diff</TableHead>
              <TableHead className="text-zinc-400 text-center">Winner</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result) => {
              const winner = getWinner(result);
              const diff = getDiff(result);
              return (
                <TableRow
                  key={result.testName}
                  className="border-zinc-800 hover:bg-zinc-900/50"
                >
                  <TableCell className="font-medium text-zinc-200">
                    {result.testName}
                  </TableCell>
                  <TableCell
                    className={`text-right font-mono ${winner === "prisma" ? "text-emerald-400" : "text-zinc-300"
                      }`}
                  >
                    {formatTime(result.prisma.timeMs)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-mono ${winner === "drizzle" ? "text-sky-400" : "text-zinc-300"
                      }`}
                  >
                    {formatTime(result.drizzle.timeMs)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-zinc-400">
                    {diff}%
                  </TableCell>
                  <TableCell className="text-center">
                    {winner === "tie" ? (
                      <Badge variant="outline" className="bg-zinc-800 border-zinc-700">
                        Tie
                      </Badge>
                    ) : winner === "prisma" ? (
                      <Badge className="bg-emerald-900/50 text-emerald-400 border-emerald-700">
                        Prisma
                      </Badge>
                    ) : (
                      <Badge className="bg-sky-900/50 text-sky-400 border-sky-700">
                        Drizzle
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            <TableRow className="border-zinc-800 bg-zinc-900/30">
              <TableCell className="font-bold text-zinc-100">Total</TableCell>
              <TableCell
                className={`text-right font-mono font-bold ${totalPrisma < totalDrizzle ? "text-emerald-400" : "text-zinc-300"
                  }`}
              >
                {formatTime(totalPrisma)}
              </TableCell>
              <TableCell
                className={`text-right font-mono font-bold ${totalDrizzle < totalPrisma ? "text-sky-400" : "text-zinc-300"
                  }`}
              >
                {formatTime(totalDrizzle)}
              </TableCell>
              <TableCell className="text-right font-mono text-zinc-400">
                {Math.round(
                  (Math.abs(totalPrisma - totalDrizzle) /
                    Math.min(totalPrisma, totalDrizzle)) *
                  100
                )}%
              </TableCell>
              <TableCell className="text-center">
                {totalPrisma < totalDrizzle ? (
                  <Badge className="bg-emerald-900/50 text-emerald-400 border-emerald-700">
                    Prisma ({prismaWins}/{results.length})
                  </Badge>
                ) : totalDrizzle < totalPrisma ? (
                  <Badge className="bg-sky-900/50 text-sky-400 border-sky-700">
                    Drizzle ({drizzleWins}/{results.length})
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-zinc-800 border-zinc-700">
                    Tie
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

