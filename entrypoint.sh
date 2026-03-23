#!/bin/sh
set -e

echo "🗄️  Applying database schema to PostgreSQL..."
npx prisma db push --skip-generate --accept-data-loss 2>&1
echo "✅ Schema applied successfully."

# Seed: create admin user if none exists
echo "🌱 Checking if seed is needed..."
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
        console.log('✅ Super Admin created: admin@acccourse.com / admin');
      } else {
        console.log('✅ Database already has ' + count + ' user(s). Skipping seed.');
      }
    } catch (e) {
      console.error('❌ Seed error:', e.message);
    }
    await prisma.\$disconnect();
  })();
"

echo "✅ Database ready."

# Ensure uploads directory exists
mkdir -p /app/data/uploads

# Start the application
exec node server.js
