#!/bin/sh
set -e

# Check if the AccCourse schema exists by looking for the User table with passwordHash column
SCHEMA_OK=$(node -e "
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  (async () => {
    try {
      await prisma.user.findFirst({ select: { passwordHash: true } });
      console.log('OK');
    } catch (e) {
      console.log('NEEDS_RESET');
    }
    await prisma.\$disconnect();
  })();
" 2>/dev/null || echo "NEEDS_RESET")

if echo "$SCHEMA_OK" | grep -q "NEEDS_RESET"; then
  echo "🗄️  Schema incompatible or missing. Force-resetting database..."
  npx prisma db push --skip-generate --force-reset 2>&1
  echo "✅ Schema created from scratch."

  # Seed: create admin user
  echo "🌱 Creating Super Admin user..."
  node -e "
    const { PrismaClient } = require('@prisma/client');
    const bcrypt = require('bcryptjs');
    const prisma = new PrismaClient();
    (async () => {
      try {
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
      } catch (e) {
        console.error('❌ Seed error:', e.message);
      }
      await prisma.\$disconnect();
    })();
  "
else
  echo "✅ Schema OK. Applying any new changes..."
  npx prisma db push --skip-generate 2>&1 || echo "⚠️  Schema push had warnings."

  # Check if admin user exists
  node -e "
    const { PrismaClient } = require('@prisma/client');
    const bcrypt = require('bcryptjs');
    const prisma = new PrismaClient();
    (async () => {
      try {
        const count = await prisma.user.count();
        if (count === 0) {
          console.log('🌱 No users found. Creating Super Admin...');
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
          console.log('✅ Super Admin created.');
        } else {
          console.log('✅ Database has ' + count + ' user(s). Skipping seed.');
        }
      } catch (e) {
        console.error('❌ Seed error:', e.message);
      }
      await prisma.\$disconnect();
    })();
  "
fi

echo "✅ Database ready."

# Ensure uploads directory exists
mkdir -p /app/data/uploads

# Start the application
exec node server.js
