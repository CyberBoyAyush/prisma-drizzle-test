"use server";

import { prisma } from "@/db/prisma";
import { db } from "@/db/drizzle";
import { users, posts, comments } from "@/db/schema";
import { eq, inArray, like } from "drizzle-orm";
import { benchmark } from "@/lib/benchmark";
import type { TestResult } from "@/types";

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

const BULK_COUNT = 100;

export async function runBulkTest(): Promise<TestResult> {
  const testPrefix = `bulk-test-${Date.now()}`;

  // Prisma Bulk Operations
  const prismaResult = await benchmark(async () => {
    // Bulk Insert: Create 100 users
    const usersToCreate = Array.from({ length: BULK_COUNT }, (_, i) => ({
      id: generateId(),
      email: `${testPrefix}-prisma-${i}@bulk.com`,
      name: `Bulk User Prisma ${i}`,
    }));

    const createResult = await prisma.user.createMany({
      data: usersToCreate,
    });

    // Get created user IDs for bulk update
    const createdUsers = await prisma.user.findMany({
      where: { email: { startsWith: `${testPrefix}-prisma` } },
      select: { id: true },
    });
    const userIds = createdUsers.map((u) => u.id);

    // Bulk Update: Update all created users
    const updateResult = await prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: { name: "Bulk Updated Prisma" },
    });

    // Bulk Insert Posts for each user
    const postsToCreate = userIds.slice(0, 50).map((userId) => ({
      id: generateId(),
      title: `${testPrefix}-prisma-post`,
      content: "Bulk created post",
      authorId: userId,
    }));

    await prisma.post.createMany({
      data: postsToCreate,
    });

    // Bulk Delete: Delete all posts first
    const deletePostsResult = await prisma.post.deleteMany({
      where: { title: { startsWith: `${testPrefix}-prisma` } },
    });

    // Bulk Delete: Delete all created users
    const deleteResult = await prisma.user.deleteMany({
      where: { id: { in: userIds } },
    });

    return {
      inserted: createResult.count,
      updated: updateResult.count,
      postsCreated: postsToCreate.length,
      postsDeleted: deletePostsResult.count,
      deleted: deleteResult.count,
    };
  });

  // Drizzle Bulk Operations
  const drizzleResult = await benchmark(async () => {
    // Bulk Insert: Create 100 users
    const usersToCreate = Array.from({ length: BULK_COUNT }, (_, i) => ({
      id: generateId(),
      email: `${testPrefix}-drizzle-${i}@bulk.com`,
      name: `Bulk User Drizzle ${i}`,
    }));

    const createResult = await db.insert(users).values(usersToCreate).returning();

    const userIds = createResult.map((u) => u.id);

    // Bulk Update: Update all created users
    const updateResult = await db
      .update(users)
      .set({ name: "Bulk Updated Drizzle" })
      .where(inArray(users.id, userIds))
      .returning();

    // Bulk Insert Posts for each user
    const postsToCreate = userIds.slice(0, 50).map((userId) => ({
      id: generateId(),
      title: `${testPrefix}-drizzle-post`,
      content: "Bulk created post",
      authorId: userId,
    }));

    const postsResult = await db.insert(posts).values(postsToCreate).returning();

    // Bulk Delete: Delete all posts first
    const deletePostsResult = await db
      .delete(posts)
      .where(like(posts.title, `${testPrefix}-drizzle%`))
      .returning();

    // Bulk Delete: Delete all created users
    const deleteResult = await db
      .delete(users)
      .where(inArray(users.id, userIds))
      .returning();

    return {
      inserted: createResult.length,
      updated: updateResult.length,
      postsCreated: postsResult.length,
      postsDeleted: deletePostsResult.length,
      deleted: deleteResult.length,
    };
  });

  return {
    prisma: prismaResult,
    drizzle: drizzleResult,
    testName: "Bulk Operations",
    timestamp: Date.now(),
  };
}

