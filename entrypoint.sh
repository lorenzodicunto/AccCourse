#!/bin/sh
set -e

echo "🗄️  Applying database schema to PostgreSQL..."
npx prisma db push --skip-generate 2>&1 || echo "⚠️  Schema push had warnings — review above output."

# Seed if no users exist (idempotent check)
node -e "
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  (async () => {
    const count = await prisma.user.count();
    if (count === 0) {
      console.log('🌱 No users found. Running seed...');
      require('./prisma/seed.js');
    } else {
      console.log('✅ Database already has data. Skipping seed.');
    }
    await prisma.\$disconnect();
  })().catch(e => { console.error(e); process.exit(1); });
"

echo "✅ Database ready."

# Ensure uploads directory exists
mkdir -p /app/data/uploads

# Start the application
exec node server.js
