"use client";

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { TestResult } from "@/types";

interface ComparisonChartProps {
  results: TestResult[];
}

const chartConfig = {
  prisma: {
    label: "Prisma",
    color: "#10b981",
  },
  drizzle: {
    label: "Drizzle",
    color: "#0ea5e9",
  },
};

export function ComparisonChart({ results }: ComparisonChartProps) {
  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-zinc-900/50 rounded-xl border border-zinc-800">
        <p className="text-zinc-500">Run tests to see comparison chart</p>
      </div>
    );
  }

  const chartData = results.map((result) => ({
    name: result.testName.split(" ")[0],
    fullName: result.testName,
    prisma: result.prisma.timeMs,
    drizzle: result.drizzle.timeMs,
  }));

  return (
    <ChartContainer config={chartConfig} className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          barGap={4}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#71717a"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#71717a"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}ms`}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          name === "prisma" ? "#10b981" : "#0ea5e9",
                      }}
                    />
                    <span className="capitalize">{name}</span>
                    <span className="font-mono ml-auto">
                      {Number(value).toFixed(2)}ms
                    </span>
                  </div>
                )}
              />
            }
          />
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            formatter={(value) => (
              <span className="text-zinc-300 capitalize">{value}</span>
            )}
          />
          <Bar
            dataKey="prisma"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
            maxBarSize={60}
          />
          <Bar
            dataKey="drizzle"
            fill="#0ea5e9"
            radius={[4, 4, 0, 0]}
            maxBarSize={60}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

