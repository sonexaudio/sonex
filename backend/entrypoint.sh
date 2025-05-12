#!/bin/sh

set -e

# Run database migrations
echo "Running Prisma migration..."
pnpx prisma migrate deploy || { echo "Migration failed"; exit 1; }

# Start server
echo "Starting application"
exec pnpm start || { echo "App start failed"; exit 1; }