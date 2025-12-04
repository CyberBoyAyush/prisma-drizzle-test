"use server";

import { prisma } from "@/db/prisma";
import { db } from "@/db/drizzle";
import { users, posts, comments } from "@/db/schema";
import { count, sum, avg, sql, eq, gt, desc } from "drizzle-orm";
import { benchmark } from "@/lib/benchmark";
import type { TestResult } from "@/types";

export async function runAggregationsTest(): Promise<TestResult> {
  // Prisma Aggregations
  const prismaResult = await benchmark(async () => {
    // COUNT: Total users, posts, comments
    const totalUsers = await prisma.user.count();
    const totalPosts = await prisma.post.count();
    const totalComments = await prisma.comment.count();

    // SUM: Total view count
    const totalViews = await prisma.post.aggregate({
      _sum: { viewCount: true },
    });

    // AVG: Average view count
    const avgViews = await prisma.post.aggregate({
      _avg: { viewCount: true },
    });

    // GROUP BY: Posts per user
    const postsPerUser = await prisma.post.groupBy({
      by: ["authorId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });

    // GROUP BY with HAVING: Users with more than 3 posts
    const activeUsers = await prisma.post.groupBy({
      by: ["authorId"],
      _count: { id: true },
      having: { id: { _count: { gt: 3 } } },
    });

    // Complex: Average comments per post
    const postsWithCommentCount = await prisma.post.findMany({
      select: {
        id: true,
        _count: { select: { comments: true } },
      },
    });
    const avgCommentsPerPost =
      postsWithCommentCount.reduce((sum, p) => sum + p._count.comments, 0) /
      postsWithCommentCount.length;

    return {
      totalUsers,
      totalPosts,
      totalComments,
      totalViews: totalViews._sum.viewCount,
      avgViews: avgViews._avg.viewCount,
      postsPerUserTop10: postsPerUser.length,
      activeUsersCount: activeUsers.length,
      avgCommentsPerPost,
    };
  });

  // Drizzle Aggregations
  const drizzleResult = await benchmark(async () => {
    // COUNT: Total users, posts, comments
    const [{ totalUsers }] = await db
      .select({ totalUsers: count() })
      .from(users);
    const [{ totalPosts }] = await db
      .select({ totalPosts: count() })
      .from(posts);
    const [{ totalComments }] = await db
      .select({ totalComments: count() })
      .from(comments);

    // SUM: Total view count
    const [{ totalViews }] = await db
      .select({ totalViews: sum(posts.viewCount) })
      .from(posts);

    // AVG: Average view count
    const [{ avgViews }] = await db
      .select({ avgViews: avg(posts.viewCount) })
      .from(posts);

    // GROUP BY: Posts per user
    const postsPerUser = await db
      .select({
        authorId: posts.authorId,
        postCount: count(posts.id),
      })
      .from(posts)
      .groupBy(posts.authorId)
      .orderBy(desc(count(posts.id)))
      .limit(10);

    // GROUP BY with HAVING: Users with more than 3 posts
    const activeUsers = await db
      .select({
        authorId: posts.authorId,
        postCount: count(posts.id),
      })
      .from(posts)
      .groupBy(posts.authorId)
      .having(gt(count(posts.id), 3));

    // Complex: Average comments per post
    const commentCounts = await db
      .select({
        postId: comments.postId,
        commentCount: count(comments.id),
      })
      .from(comments)
      .groupBy(comments.postId);

    const avgCommentsPerPost =
      commentCounts.length > 0
        ? commentCounts.reduce((sum, c) => sum + c.commentCount, 0) /
          commentCounts.length
        : 0;

    return {
      totalUsers,
      totalPosts,
      totalComments,
      totalViews: Number(totalViews),
      avgViews: Number(avgViews),
      postsPerUserTop10: postsPerUser.length,
      activeUsersCount: activeUsers.length,
      avgCommentsPerPost,
    };
  });

  return {
    prisma: prismaResult,
    drizzle: drizzleResult,
    testName: "Aggregations",
    timestamp: Date.now(),
  };
}

