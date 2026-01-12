#!/bin/sh
set -e

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL environment variable is not set!"
    echo "Please configure it in your deployment platform."
    exit 1
fi

echo "Database URL configured: ${DATABASE_URL%%@*}@***"
echo "Running database migrations..."
node node_modules/.bin/prisma migrate deploy

echo "Starting Next.js application..."
exec node server.js
