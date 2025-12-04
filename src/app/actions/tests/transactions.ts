"use server";

import { prisma } from "@/db/prisma";
import { db } from "@/db/drizzle";
import { users, posts, comments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { benchmark } from "@/lib/benchmark";
import type { TestResult } from "@/types";

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export async function runTransactionsTest(): Promise<TestResult> {
  // Prisma Transactions
  const prismaResult = await benchmark(async () => {
    const userId = generateId();
    const postId = generateId();
    const commentId = generateId();
    const email = `tx-prisma-${Date.now()}@test.com`;

    // Transaction 1: Create user, post, and comment atomically
    const createResult = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          id: userId,
          email,
          name: "Transaction Test User",
        },
      });

      const post = await tx.post.create({
        data: {
          id: postId,
          title: "Transaction Test Post",
          content: "Created in a transaction",
          authorId: userId,
          published: true,
        },
      });

      const comment = await tx.comment.create({
        data: {
          id: commentId,
          content: "Transaction test comment",
          postId: postId,
          authorId: userId,
        },
      });

      return { user, post, comment };
    });

    // Transaction 2: Update multiple records atomically
    const updateResult = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { name: "Updated Transaction User" },
      });

      const updatedPost = await tx.post.update({
        where: { id: postId },
        data: { 
          title: "Updated Transaction Post",
          viewCount: { increment: 100 },
        },
      });

      return { updatedUser, updatedPost };
    });

    // Transaction 3: Delete cascade atomically
    const deleteResult = await prisma.$transaction(async (tx) => {
      // Delete comment first
      await tx.comment.delete({ where: { id: commentId } });
      
      // Delete post
      await tx.post.delete({ where: { id: postId } });
      
      // Delete user
      await tx.user.delete({ where: { id: userId } });

      return { deleted: true };
    });

    return {
      created: !!createResult.user,
      updated: !!updateResult.updatedUser,
      deleted: deleteResult.deleted,
    };
  });

  // Drizzle Transactions
  const drizzleResult = await benchmark(async () => {
    const userId = generateId();
    const postId = generateId();
    const commentId = generateId();
    const email = `tx-drizzle-${Date.now()}@test.com`;

    // Transaction 1: Create user, post, and comment atomically
    const createResult = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          id: userId,
          email,
          name: "Transaction Test User",
        })
        .returning();

      const [post] = await tx
        .insert(posts)
        .values({
          id: postId,
          title: "Transaction Test Post",
          content: "Created in a transaction",
          authorId: userId,
          published: true,
        })
        .returning();

      const [comment] = await tx
        .insert(comments)
        .values({
          id: commentId,
          content: "Transaction test comment",
          postId: postId,
          authorId: userId,
        })
        .returning();

      return { user, post, comment };
    });

    // Transaction 2: Update multiple records atomically
    const updateResult = await db.transaction(async (tx) => {
      const [updatedUser] = await tx
        .update(users)
        .set({ name: "Updated Transaction User" })
        .where(eq(users.id, userId))
        .returning();

      // Get current viewCount and increment
      const [currentPost] = await tx
        .select({ viewCount: posts.viewCount })
        .from(posts)
        .where(eq(posts.id, postId));

      const [updatedPost] = await tx
        .update(posts)
        .set({
          title: "Updated Transaction Post",
          viewCount: currentPost.viewCount + 100,
        })
        .where(eq(posts.id, postId))
        .returning();

      return { updatedUser, updatedPost };
    });

    // Transaction 3: Delete cascade atomically
    const deleteResult = await db.transaction(async (tx) => {
      // Delete comment first
      await tx.delete(comments).where(eq(comments.id, commentId));
      
      // Delete post
      await tx.delete(posts).where(eq(posts.id, postId));
      
      // Delete user
      await tx.delete(users).where(eq(users.id, userId));

      return { deleted: true };
    });

    return {
      created: !!createResult.user,
      updated: !!updateResult.updatedUser,
      deleted: deleteResult.deleted,
    };
  });

  return {
    prisma: prismaResult,
    drizzle: drizzleResult,
    testName: "Transactions",
    timestamp: Date.now(),
  };
}

