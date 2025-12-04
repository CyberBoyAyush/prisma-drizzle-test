"use server";

import { prisma } from "@/db/prisma";
import { db } from "@/db/drizzle";
import { users, posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { benchmark } from "@/lib/benchmark";
import type { TestResult } from "@/types";

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export async function runCrudTest(): Promise<TestResult> {
  const testUserId = generateId();
  const testPostId = generateId();
  const email = `test-${Date.now()}@crud-test.com`;

  // Prisma CRUD
  const prismaResult = await benchmark(async () => {
    // Create
    const user = await prisma.user.create({
      data: {
        id: testUserId,
        email,
        name: "CRUD Test User",
      },
    });

    // Read
    const readUser = await prisma.user.findUnique({
      where: { id: testUserId },
    });

    // Update
    const updatedUser = await prisma.user.update({
      where: { id: testUserId },
      data: { name: "Updated CRUD User" },
    });

    // Create related post
    const post = await prisma.post.create({
      data: {
        id: testPostId,
        title: "CRUD Test Post",
        content: "This is a test post for CRUD operations",
        authorId: testUserId,
      },
    });

    // Delete post first (due to FK)
    await prisma.post.delete({ where: { id: testPostId } });
    
    // Delete user
    await prisma.user.delete({ where: { id: testUserId } });

    return { user, readUser, updatedUser, post };
  });

  // Drizzle CRUD
  const drizzleUserId = generateId();
  const drizzlePostId = generateId();
  const drizzleEmail = `test-${Date.now()}-drizzle@crud-test.com`;

  const drizzleResult = await benchmark(async () => {
    // Create
    const [user] = await db
      .insert(users)
      .values({
        id: drizzleUserId,
        email: drizzleEmail,
        name: "CRUD Test User",
      })
      .returning();

    // Read
    const readUser = await db.query.users.findFirst({
      where: eq(users.id, drizzleUserId),
    });

    // Update
    const [updatedUser] = await db
      .update(users)
      .set({ name: "Updated CRUD User" })
      .where(eq(users.id, drizzleUserId))
      .returning();

    // Create related post
    const [post] = await db
      .insert(posts)
      .values({
        id: drizzlePostId,
        title: "CRUD Test Post",
        content: "This is a test post for CRUD operations",
        authorId: drizzleUserId,
      })
      .returning();

    // Delete post first (due to FK)
    await db.delete(posts).where(eq(posts.id, drizzlePostId));
    
    // Delete user
    await db.delete(users).where(eq(users.id, drizzleUserId));

    return { user, readUser, updatedUser, post };
  });

  return {
    prisma: prismaResult,
    drizzle: drizzleResult,
    testName: "CRUD Operations",
    timestamp: Date.now(),
  };
}

