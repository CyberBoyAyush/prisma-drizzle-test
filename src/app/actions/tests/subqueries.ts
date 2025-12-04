"use server";

import { prisma } from "@/db/prisma";
import { db } from "@/db/drizzle";
import { users, posts, comments } from "@/db/schema";
import { eq, gt, sql, inArray, desc, count } from "drizzle-orm";
import { benchmark } from "@/lib/benchmark";
import type { TestResult } from "@/types";

export async function runSubqueriesTest(): Promise<TestResult> {
  // Prisma Subqueries
  const prismaResult = await benchmark(async () => {
    // Subquery: Find users with above-average post count
    const avgPostsPerUser = await prisma.post.groupBy({
      by: ["authorId"],
      _count: { id: true },
    });
    const avgCount =
      avgPostsPerUser.reduce((sum, u) => sum + u._count.id, 0) /
      avgPostsPerUser.length;

    const usersAboveAvg = await prisma.user.findMany({
      where: {
        posts: {
          some: {},
        },
      },
      include: {
        _count: { select: { posts: true } },
      },
    });
    const filteredAboveAvg = usersAboveAvg.filter(
      (u) => u._count.posts > avgCount
    );

    // Subquery: Find posts that have comments from their own author
    const postsWithAuthorComments = await prisma.post.findMany({
      where: {
        comments: {
          some: {
            authorId: { not: undefined },
          },
        },
      },
      include: {
        author: true,
        comments: {
          where: {
            author: {
              posts: {
                some: {},
              },
            },
          },
        },
      },
      take: 10,
    });

    // Correlated subquery: Find top 5 users by total view count
    const topUsersByViews = await prisma.user.findMany({
      include: {
        posts: {
          select: { viewCount: true },
        },
      },
      take: 50,
    });
    const sortedByViews = topUsersByViews
      .map((u) => ({
        ...u,
        totalViews: u.posts.reduce((sum, p) => sum + p.viewCount, 0),
      }))
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, 5);

    // Nested subquery: Posts from users who have commented on published posts
    const commentersOnPublished = await prisma.comment.findMany({
      where: {
        post: { published: true },
      },
      select: { authorId: true },
      distinct: ["authorId"],
    });
    const commenterIds = commentersOnPublished.map((c) => c.authorId);
    const postsFromCommenters = await prisma.post.findMany({
      where: { authorId: { in: commenterIds } },
      take: 10,
    });

    return {
      usersAboveAvgPosts: filteredAboveAvg.length,
      postsWithAuthorComments: postsWithAuthorComments.length,
      topUsersByViews: sortedByViews.length,
      postsFromCommenters: postsFromCommenters.length,
    };
  });

  // Drizzle Subqueries
  const drizzleResult = await benchmark(async () => {
    // Subquery: Find users with above-average post count
    const postCounts = await db
      .select({
        authorId: posts.authorId,
        postCount: count(posts.id),
      })
      .from(posts)
      .groupBy(posts.authorId);

    const avgCount =
      postCounts.reduce((sum, u) => sum + u.postCount, 0) / postCounts.length;

    const usersAboveAvg = postCounts.filter((u) => u.postCount > avgCount);

    // Subquery: Posts with their comment counts
    const postsWithCommentCounts = await db
      .select({
        postId: posts.id,
        title: posts.title,
        commentCount: count(comments.id),
      })
      .from(posts)
      .leftJoin(comments, eq(comments.postId, posts.id))
      .groupBy(posts.id, posts.title)
      .having(gt(count(comments.id), 0))
      .limit(10);

    // Correlated subquery: Top 5 users by total view count
    const topUsersByViews = await db
      .select({
        userId: users.id,
        userName: users.name,
        totalViews: sql<number>`COALESCE(SUM(${posts.viewCount}), 0)::int`,
      })
      .from(users)
      .leftJoin(posts, eq(posts.authorId, users.id))
      .groupBy(users.id, users.name)
      .orderBy(desc(sql`SUM(${posts.viewCount})`))
      .limit(5);

    // Nested subquery: Posts from users who have commented on published posts
    const commenterIds = await db
      .selectDistinct({ authorId: comments.authorId })
      .from(comments)
      .innerJoin(posts, eq(posts.id, comments.postId))
      .where(eq(posts.published, true));

    const postsFromCommenters = await db
      .select()
      .from(posts)
      .where(
        inArray(
          posts.authorId,
          commenterIds.map((c) => c.authorId)
        )
      )
      .limit(10);

    return {
      usersAboveAvgPosts: usersAboveAvg.length,
      postsWithAuthorComments: postsWithCommentCounts.length,
      topUsersByViews: topUsersByViews.length,
      postsFromCommenters: postsFromCommenters.length,
    };
  });

  return {
    prisma: prismaResult,
    drizzle: drizzleResult,
    testName: "Subqueries",
    timestamp: Date.now(),
  };
}

