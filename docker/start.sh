#!/bin/sh
set -eu

if [ "${RUN_DB_MIGRATIONS:-true}" = "true" ]; then
  echo "Running Prisma migrations with prisma migrate deploy..."
  node_modules/.bin/prisma migrate deploy
fi

exec node server.js
