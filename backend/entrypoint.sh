#!/bin/sh

set -e

# Run database migrations
echo "Running Prisma migration..."
pnpx prisma migrate deploy

# Start server
echo "Starting application"
exec pnpm start