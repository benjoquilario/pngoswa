#!/bin/sh
set -eu

if [ "${RUN_DB_MIGRATIONS:-true}" = "true" ]; then
  if [ -z "${DATABASE_URL:-}" ]; then
    echo "DATABASE_URL is required when RUN_DB_MIGRATIONS=true." >&2
    exit 1
  fi

  echo "Running Prisma migrations with prisma migrate deploy..."
  node_modules/.bin/prisma migrate deploy
fi

exec node server.js
