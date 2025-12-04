"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Database,
  ArrowLeft,
  Code2,
  Zap,
  GitBranch,
  Calculator,
  Layers,
  Lock,
  Package,
} from "lucide-react";

export default function AboutPage() {
  const testDetails = [
    {
      id: "crud",
      name: "CRUD Operations",
      description: "Tests basic Create, Read, Update, and Delete operations on single records.",
      icon: Code2,
      prismaExample: `// Prisma CRUD Example
const user = await prisma.user.create({
  data: { email: "user@example.com", name: "John" }
});

const found = await prisma.user.findUnique({
  where: { id: user.id }
});

await prisma.user.update({
  where: { id: user.id },
  data: { name: "Jane" }
});

await prisma.user.delete({
  where: { id: user.id }
});`,
      drizzleExample: `// Drizzle CRUD Example
const [user] = await db.insert(users)
  .values({ email: "user@example.com", name: "John" })
  .returning();

const found = await db.query.users.findFirst({
  where: eq(users.id, user.id)
});

await db.update(users)
  .set({ name: "Jane" })
  .where(eq(users.id, user.id));

await db.delete(users)
  .where(eq(users.id, user.id));`,
    },
    {
      id: "joins",
      name: "Complex Joins",
      description: "Tests multi-table joins across 3-4 tables with nested relations.",
      icon: GitBranch,
      prismaExample: `// Prisma Join Example
const usersWithPosts = await prisma.user.findMany({
  include: {
    posts: {
      include: {
        comments: {
          include: { author: true }
        }
      }
    }
  }
});`,
      drizzleExample: `// Drizzle Join Example
const usersWithPosts = await db.query.users.findMany({
  with: {
    posts: {
      with: {
        comments: {
          with: { author: true }
        }
      }
    }
  }
});`,
    },
    {
      id: "aggregations",
      name: "Aggregations",
      description: "Tests COUNT, SUM, AVG, and GROUP BY operations for data analysis.",
      icon: Calculator,
      prismaExample: `// Prisma Aggregation Example
const totalViews = await prisma.post.aggregate({
  _sum: { viewCount: true }
});

const avgViews = await prisma.post.aggregate({
  _avg: { viewCount: true }
});

const postsPerUser = await prisma.post.groupBy({
  by: ["authorId"],
  _count: { id: true }
});`,
      drizzleExample: `// Drizzle Aggregation Example
const totalViews = await db
  .select({ sum: sum(posts.viewCount) })
  .from(posts);

const avgViews = await db
  .select({ avg: avg(posts.viewCount) })
  .from(posts);

const postsPerUser = await db
  .select({
    authorId: posts.authorId,
    count: count(posts.id)
  })
  .from(posts)
  .groupBy(posts.authorId);`,
    },
    {
      id: "subqueries",
      name: "Subqueries",
      description: "Tests nested SELECT statements and correlated subqueries for complex filtering.",
      icon: Layers,
      prismaExample: `// Prisma Subquery Example
const avgPosts = await prisma.post.groupBy({
  by: ["authorId"],
  _avg: { viewCount: true }
});

const usersAboveAvg = await prisma.user.findMany({
  where: {
    posts: {
      some: {
        viewCount: { gt: avgPosts[0]._avg.viewCount }
      }
    }
  }
});`,
      drizzleExample: `// Drizzle Subquery Example
const avgPosts = db
  .select({ avg: avg(posts.viewCount) })
  .from(posts)
  .as("avg_posts");

const usersAboveAvg = await db
  .select()
  .from(users)
  .where(
    gt(
      sql\`(SELECT AVG(view_count) FROM posts)\`,
      sql\`(SELECT view_count FROM posts WHERE author_id = users.id)\`
    )
  );`,
    },
    {
      id: "transactions",
      name: "Transactions",
      description: "Tests atomic multi-operation transactions ensuring data consistency.",
      icon: Lock,
      prismaExample: `// Prisma Transaction Example
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { email: "user@example.com", name: "John" }
  });
  
  const post = await tx.post.create({
    data: { title: "Post", authorId: user.id }
  });
  
  await tx.comment.create({
    data: { content: "Comment", postId: post.id, authorId: user.id }
  });
});`,
      drizzleExample: `// Drizzle Transaction Example
await db.transaction(async (tx) => {
  const [user] = await tx.insert(users)
    .values({ email: "user@example.com", name: "John" })
    .returning();
  
  const [post] = await tx.insert(posts)
    .values({ title: "Post", authorId: user.id })
    .returning();
  
  await tx.insert(comments)
    .values({ content: "Comment", postId: post.id, authorId: user.id });
});`,
    },
    {
      id: "bulk",
      name: "Bulk Operations",
      description: "Tests inserting, updating, and deleting 100+ records in a single operation.",
      icon: Package,
      prismaExample: `// Prisma Bulk Example
await prisma.user.createMany({
  data: Array.from({ length: 100 }, (_, i) => ({
    email: \`user\${i}@example.com\`,
    name: \`User \${i}\`
  }))
});

await prisma.user.updateMany({
  where: { email: { startsWith: "user" } },
  data: { name: "Updated" }
});

await prisma.user.deleteMany({
  where: { email: { startsWith: "user" } }
});`,
      drizzleExample: `// Drizzle Bulk Example
await db.insert(users).values(
  Array.from({ length: 100 }, (_, i) => ({
    email: \`user\${i}@example.com\`,
    name: \`User \${i}\`
  }))
);

await db.update(users)
  .set({ name: "Updated" })
  .where(like(users.email, "user%"));

await db.delete(users)
  .where(like(users.email, "user%"));`,
    },
  ];

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
        <header className="border-b border-zinc-800/50 backdrop-blur-sm bg-zinc-950/50 sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-sky-500/20 border border-zinc-800">
                <Database className="h-5 w-5 text-zinc-100" />
              </div>
              <div>
                <h1 className="font-semibold text-zinc-100">ORM Benchmark</h1>
                <p className="text-xs text-zinc-500">Prisma 7.1.0 vs Drizzle 0.45.0</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Tests
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                <span className="text-zinc-100">About the </span>
                <span className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text text-transparent">
                  Benchmark
                </span>
              </h1>
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                Learn about the test types, database schema, and how we measure ORM performance
              </p>
            </div>
          </div>
        </section>

        {/* Overview Section */}
        <section className="container mx-auto px-6 pb-12">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-100 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  Benchmark Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-zinc-400">
                <p>
                  This benchmark compares the performance of <strong className="text-emerald-400">Prisma 7.1.0</strong> and{" "}
                  <strong className="text-sky-400">Drizzle ORM 0.45.0</strong> using real-world database operations on{" "}
                  <strong className="text-zinc-300">Neon PostgreSQL</strong>.
                </p>
                <p>
                  Each test measures the execution time of equivalent operations in both ORMs, ensuring fair comparison
                  by using the same database, schema, and data volume.
                </p>
                <div className="pt-4 border-t border-zinc-800">
                  <h3 className="text-zinc-200 font-semibold mb-2">Database Schema</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-zinc-500">
                    <li><strong className="text-zinc-300">users</strong> - User accounts with email, name, timestamps</li>
                    <li><strong className="text-zinc-300">posts</strong> - Blog posts with title, content, view count</li>
                    <li><strong className="text-zinc-300">comments</strong> - Comments on posts</li>
                    <li><strong className="text-zinc-300">categories</strong> - Post categories</li>
                    <li><strong className="text-zinc-300">tags</strong> - Post tags</li>
                    <li><strong className="text-zinc-300">post_categories</strong> - Many-to-many relationship</li>
                    <li><strong className="text-zinc-300">post_tags</strong> - Many-to-many relationship</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Test Details Section */}
        <section className="container mx-auto px-6 pb-16">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold text-zinc-100 text-center">Test Types</h2>
            
            {testDetails.map((test) => {
              const Icon = test.icon;
              return (
                <Card key={test.id} className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-zinc-800">
                          <Icon className="h-5 w-5 text-zinc-400" />
                        </div>
                        <div>
                          <CardTitle className="text-zinc-100">{test.name}</CardTitle>
                          <CardDescription className="text-zinc-500">
                            {test.description}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-emerald-900/50 text-emerald-400 border-emerald-700">
                            Prisma
                          </Badge>
                          <span className="text-xs text-zinc-500">Example</span>
                        </div>
                        <pre className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 overflow-x-auto text-xs text-zinc-300 font-mono">
                          <code>{test.prismaExample}</code>
                        </pre>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-sky-900/50 text-sky-400 border-sky-700">
                            Drizzle
                          </Badge>
                          <span className="text-xs text-zinc-500">Example</span>
                        </div>
                        <pre className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 overflow-x-auto text-xs text-zinc-300 font-mono">
                          <code>{test.drizzleExample}</code>
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Methodology Section */}
        <section className="container mx-auto px-6 pb-16">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-100">How We Measure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-zinc-400">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-zinc-200 font-semibold mb-1">Execution Time</h3>
                    <p className="text-sm">
                      Each test measures the total execution time from start to completion, including database round-trips
                      and ORM processing overhead.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-zinc-200 font-semibold mb-1">Fair Comparison</h3>
                    <p className="text-sm">
                      Both ORMs execute the same logical operations on identical data sets, ensuring a fair performance
                      comparison.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-zinc-200 font-semibold mb-1">Real-World Scenarios</h3>
                    <p className="text-sm">
                      Tests are designed to reflect common database operations you'd encounter in production applications,
                      from simple CRUD to complex analytical queries.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-800/50 py-8">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span>Powered by Neon PostgreSQL</span>
              </div>
              <Link href="/">
                <Button variant="outline" size="sm" className="bg-zinc-900 border-zinc-700 text-zinc-400">
                  Run Benchmarks
                </Button>
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

