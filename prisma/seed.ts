import { config } from "dotenv";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client.js";
import ws from "ws";

// Load .env file from project root
config({ path: ".env" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Available env vars:", Object.keys(process.env).filter(k => k.includes("DATABASE")));
  throw new Error("DATABASE_URL environment variable is not set. Please check your .env file.");
}

// Configure WebSocket for Node.js
neonConfig.webSocketConstructor = ws;

console.log("🔗 Connecting to database...");
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("🌱 Starting seed...");

  // Clean existing data
  console.log("🧹 Cleaning existing data...");
  await prisma.postTag.deleteMany();
  await prisma.postCategory.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log("👤 Creating users...");
  const users = await Promise.all(
    Array.from({ length: 50 }, (_, i) =>
      prisma.user.create({
        data: {
          id: generateId(),
          email: `user${i + 1}@example.com`,
          name: `User ${i + 1}`,
        },
      })
    )
  );
  console.log(`✅ Created ${users.length} users`);

  // Create categories
  console.log("📁 Creating categories...");
  const categoryNames = [
    "Technology",
    "Science",
    "Health",
    "Business",
    "Entertainment",
    "Sports",
    "Politics",
    "Travel",
    "Food",
    "Fashion",
  ];
  const categories = await Promise.all(
    categoryNames.map((name) =>
      prisma.category.create({
        data: {
          id: generateId(),
          name,
          slug: slugify(name),
        },
      })
    )
  );
  console.log(`✅ Created ${categories.length} categories`);

  // Create tags
  console.log("🏷️ Creating tags...");
  const tagNames = [
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "PostgreSQL",
    "Prisma",
    "Drizzle",
    "AI",
    "Machine Learning",
    "Web Development",
    "Mobile",
    "Cloud",
    "DevOps",
    "Security",
    "Performance",
    "Tutorial",
    "News",
    "Opinion",
    "Guide",
  ];
  const tags = await Promise.all(
    tagNames.map((name) =>
      prisma.tag.create({
        data: {
          id: generateId(),
          name,
          slug: slugify(name),
        },
      })
    )
  );
  console.log(`✅ Created ${tags.length} tags`);

  // Create posts
  console.log("📝 Creating posts...");
  const posts = await Promise.all(
    Array.from({ length: 200 }, (_, i) =>
      prisma.post.create({
        data: {
          id: generateId(),
          title: `Post Title ${i + 1}: A Comprehensive Guide`,
          content: `This is the content for post ${i + 1}. It contains detailed information about various topics that are relevant to our testing scenario. The content is designed to be realistic and substantial enough for proper benchmarking.`,
          published: Math.random() > 0.3,
          viewCount: Math.floor(Math.random() * 10000),
          authorId: users[Math.floor(Math.random() * users.length)].id,
        },
      })
    )
  );
  console.log(`✅ Created ${posts.length} posts`);

  // Create post-category relationships
  console.log("🔗 Creating post-category relationships...");
  const postCategories = [];
  for (const post of posts) {
    const numCategories = Math.floor(Math.random() * 3) + 1;
    const shuffledCategories = [...categories].sort(() => Math.random() - 0.5);
    for (let i = 0; i < numCategories; i++) {
      postCategories.push({
        postId: post.id,
        categoryId: shuffledCategories[i].id,
      });
    }
  }
  await prisma.postCategory.createMany({ data: postCategories });
  console.log(`✅ Created ${postCategories.length} post-category relationships`);

  // Create post-tag relationships
  console.log("🔗 Creating post-tag relationships...");
  const postTags = [];
  for (const post of posts) {
    const numTags = Math.floor(Math.random() * 5) + 1;
    const shuffledTags = [...tags].sort(() => Math.random() - 0.5);
    for (let i = 0; i < numTags; i++) {
      postTags.push({
        postId: post.id,
        tagId: shuffledTags[i].id,
      });
    }
  }
  await prisma.postTag.createMany({ data: postTags });
  console.log(`✅ Created ${postTags.length} post-tag relationships`);

  // Create comments
  console.log("💬 Creating comments...");
  const comments = [];
  for (let i = 0; i < 500; i++) {
    comments.push({
      id: generateId(),
      content: `This is comment ${i + 1}. It provides feedback on the post content and contributes to the discussion.`,
      postId: posts[Math.floor(Math.random() * posts.length)].id,
      authorId: users[Math.floor(Math.random() * users.length)].id,
    });
  }
  await prisma.comment.createMany({ data: comments });
  console.log(`✅ Created ${comments.length} comments`);

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

