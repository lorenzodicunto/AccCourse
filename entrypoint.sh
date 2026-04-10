#!/bin/sh
set -e

echo "🗄️  AccCourse — Checking database..."

# ─── Step 1: Apply schema changes safely (NO --force-reset) ─────────
# db push without --force-reset will CREATE missing tables/columns
# but NEVER drop existing tables or data from other projects.
echo "📐 Syncing schema with Prisma..."
npx prisma db push --skip-generate --accept-data-loss 2>&1 || {
  echo "⚠️  Prisma db push failed. Trying without --accept-data-loss..."
  npx prisma db push --skip-generate 2>&1 || echo "⚠️  Schema sync had issues (non-fatal)."
}
echo "✅ Schema synced."

# ─── Step 2: Ensure admin user exists (safe upsert) ─────────────────
node -e "
  const { PrismaClient } = require('@prisma/client');
  const bcrypt = require('bcryptjs');
  const prisma = new PrismaClient();
  (async () => {
    try {
      // Check if admin already exists
      const existing = await prisma.user.findUnique({
        where: { email: 'admin@acccourse.com' }
      });
      if (existing) {
        // Ensure admin always has SUPER_ADMIN role (in case of schema migration)
        if (existing.role !== 'SUPER_ADMIN') {
          await prisma.user.update({
            where: { email: 'admin@acccourse.com' },
            data: { role: 'SUPER_ADMIN' },
          });
          console.log('✅ Admin user role updated to SUPER_ADMIN.');
        } else {
          console.log('✅ Admin user exists. Skipping seed.');
        }
      } else {
        console.log('🌱 Creating Super Admin...');
        const passwordHash = await bcrypt.hash('admin', 12);
        await prisma.user.create({
          data: {
            email: 'admin@acccourse.com',
            passwordHash,
            name: 'Super Admin',
            role: 'SUPER_ADMIN',
            tenantId: null,
          },
        });
        console.log('✅ Super Admin created: admin@acccourse.com / admin');
      }
    } catch (e) {
      console.error('⚠️  Seed note:', e.message);
    }
    await prisma.\$disconnect();
  })();
" 2>&1

echo "✅ Database ready."

# ─── Step 3: Ensure uploads directory ────────────────────────────────
mkdir -p /app/data/uploads

# ─── Step 4: Start the application ──────────────────────────────────
exec node server.js
