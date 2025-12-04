import type { TestConfig } from "@/types";

export const TEST_CONFIGS: TestConfig[] = [
  {
    id: "crud",
    name: "CRUD Operations",
    description: "Create, Read, Update, Delete single records",
    category: "crud",
  },
  {
    id: "joins",
    name: "Complex Joins",
    description: "3-4 table joins with users, posts, comments, and categories",
    category: "joins",
  },
  {
    id: "aggregations",
    name: "Aggregations",
    description: "COUNT, SUM, AVG, GROUP BY operations",
    category: "aggregations",
  },
  {
    id: "subqueries",
    name: "Subqueries",
    description: "Nested SELECT statements and correlated subqueries",
    category: "subqueries",
  },
  {
    id: "transactions",
    name: "Transactions",
    description: "Multi-operation atomic transactions",
    category: "transactions",
  },
  {
    id: "bulk",
    name: "Bulk Operations",
    description: "Insert, Update, Delete 100+ records at once",
    category: "bulk",
  },
];

export const CATEGORY_COLORS = {
  crud: { prisma: "#10b981", drizzle: "#0ea5e9" },
  joins: { prisma: "#10b981", drizzle: "#0ea5e9" },
  aggregations: { prisma: "#10b981", drizzle: "#0ea5e9" },
  subqueries: { prisma: "#10b981", drizzle: "#0ea5e9" },
  transactions: { prisma: "#10b981", drizzle: "#0ea5e9" },
  bulk: { prisma: "#10b981", drizzle: "#0ea5e9" },
} as const;

