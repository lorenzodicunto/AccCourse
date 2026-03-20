#!/bin/sh
set -e

# Initialize database only if it doesn't exist
if [ ! -f /app/data/prod.db ]; then
  echo "🗄️  Database not found. Creating new database..."
  mkdir -p /app/data
  npx prisma db push --skip-generate
  node prisma/seed.js
  echo "✅ Database created and seeded."
else
  echo "✅ Existing database found. Applying migrations..."
  npx prisma db push --skip-generate --accept-data-loss 2>/dev/null || true
  echo "✅ Database ready."
fi

# Ensure uploads directory exists
mkdir -p /app/data/uploads

# Start the application
exec node server.js
