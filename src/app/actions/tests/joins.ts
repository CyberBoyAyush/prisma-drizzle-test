"use server";

import { prisma } from "@/db/prisma";
import { db } from "@/db/drizzle";
import { users, posts, comments, categories, postCategories } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { benchmark } from "@/lib/benchmark";
import type { TestResult } from "@/types";

export async function runJoinsTest(): Promise<TestResult> {
  // Prisma Complex Joins
  const prismaResult = await benchmark(async () => {
    // 3-table join: Users with their posts and comments
    const usersWithPostsAndComments = await prisma.user.findMany({
      take: 10,
      include: {
        posts: {
          include: {
            comments: {
              include: {
                author: true,
              },
            },
          },
        },
      },
    });

    // 4-table join: Posts with author, categories, and comments
    const postsWithRelations = await prisma.post.findMany({
      take: 10,
      include: {
        author: true,
        categories: {
          include: {
            category: true,
          },
        },
        comments: {
          include: {
            author: true,
          },
        },
      },
    });

    // Complex query: Find users who have posts in specific categories
    const usersInCategory = await prisma.user.findMany({
      where: {
        posts: {
          some: {
            categories: {
              some: {
                category: {
                  name: "Technology",
                },
              },
            },
          },
        },
      },
      include: {
        posts: {
          include: {
            categories: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      take: 5,
    });

    return {
      usersWithPostsAndComments: usersWithPostsAndComments.length,
      postsWithRelations: postsWithRelations.length,
      usersInCategory: usersInCategory.length,
    };
  });

  // Drizzle Complex Joins
  const drizzleResult = await benchmark(async () => {
    // 3-table join: Users with their posts and comments
    const usersWithPostsAndComments = await db.query.users.findMany({
      limit: 10,
      with: {
        posts: {
          with: {
            comments: {
              with: {
                author: true,
              },
            },
          },
        },
      },
    });

    // 4-table join: Posts with author, categories, and comments
    const postsWithRelations = await db.query.posts.findMany({
      limit: 10,
      with: {
        author: true,
        categories: {
          with: {
            category: true,
          },
        },
        comments: {
          with: {
            author: true,
          },
        },
      },
    });

    // Complex query using raw SQL for users in specific category
    const usersInCategory = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .innerJoin(posts, eq(posts.authorId, users.id))
      .innerJoin(postCategories, eq(postCategories.postId, posts.id))
      .innerJoin(categories, eq(categories.id, postCategories.categoryId))
      .where(eq(categories.name, "Technology"))
      .groupBy(users.id, users.name, users.email)
      .limit(5);

    return {
      usersWithPostsAndComments: usersWithPostsAndComments.length,
      postsWithRelations: postsWithRelations.length,
      usersInCategory: usersInCategory.length,
    };
  });

  return {
    prisma: prismaResult,
    drizzle: drizzleResult,
    testName: "Complex Joins",
    timestamp: Date.now(),
  };
}

