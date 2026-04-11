-- Migration: Sprint 1-4 schema updates
-- Run this on the production PostgreSQL database

-- Sprint 1.7: Soft delete for courses
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "Course_deletedAt_idx" ON "Course"("deletedAt");

-- Sprint 4.3: Comment status for review portal
ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'pending';
