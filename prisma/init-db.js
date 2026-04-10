#!/usr/bin/env node
/**
 * Database initialization script for AccCourse
 * Creates SQLite tables and seeds default admin user
 * Run: node prisma/init-db.js
 */

const { createClient } = require("@libsql/client");
const bcrypt = require("bcryptjs");

async function initDatabase() {
  const dbUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
  console.log(`Initializing database at: ${dbUrl}`);

  const db = createClient({ url: dbUrl });

  // Create tables
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS Tenant (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS User (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'AUTHOR',
      tenantId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tenantId) REFERENCES Tenant(id)
    );

    CREATE TABLE IF NOT EXISTS Course (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      thumbnail TEXT DEFAULT '',
      courseData TEXT DEFAULT '{}',
      tenantId TEXT,
      authorId TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tenantId) REFERENCES Tenant(id),
      FOREIGN KEY (authorId) REFERENCES User(id)
    );

    CREATE TABLE IF NOT EXISTS SharedCourse (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      courseData TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Reviewer (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Comment (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      slideId TEXT NOT NULL,
      sharedCourseId TEXT NOT NULL,
      reviewerId TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sharedCourseId) REFERENCES SharedCourse(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewerId) REFERENCES Reviewer(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Asset (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      type TEXT NOT NULL,
      size INTEGER DEFAULT 0,
      tenantId TEXT,
      uploadedBy TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tenantId) REFERENCES Tenant(id),
      FOREIGN KEY (uploadedBy) REFERENCES User(id)
    );

    CREATE INDEX IF NOT EXISTS idx_user_tenantId ON User(tenantId);
    CREATE INDEX IF NOT EXISTS idx_course_tenantId ON Course(tenantId);
    CREATE INDEX IF NOT EXISTS idx_course_authorId ON Course(authorId);
    CREATE INDEX IF NOT EXISTS idx_comment_sharedCourseId ON Comment(sharedCourseId);
    CREATE INDEX IF NOT EXISTS idx_comment_reviewerId ON Comment(reviewerId);
    CREATE INDEX IF NOT EXISTS idx_asset_tenantId ON Asset(tenantId);
    CREATE INDEX IF NOT EXISTS idx_asset_uploadedBy ON Asset(uploadedBy);
  `);

  console.log("Tables created successfully");

  // Seed admin user
  const hash = await bcrypt.hash("admin", 12);
  const id = "cl" + Date.now().toString(36) + Math.random().toString(36).substring(2, 10);

  try {
    await db.execute({
      sql: "INSERT OR IGNORE INTO User (id, email, passwordHash, name, role) VALUES (?, ?, ?, ?, ?)",
      args: [id, "admin@acccourse.com", hash, "Admin", "SUPER_ADMIN"],
    });
    console.log("Admin user seeded (admin@acccourse.com / admin)");
  } catch (e) {
    console.log("Admin user may already exist");
  }

  console.log("Database initialization complete!");
}

initDatabase().catch((e) => {
  console.error("Database initialization failed:", e);
  process.exit(1);
});
