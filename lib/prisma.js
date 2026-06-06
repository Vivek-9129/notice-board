// lib/prisma.js
// This creates a single Prisma client instance that is reused across
// hot-reloads in development. Without this, each file save would create
// a new DB connection and you'd quickly hit connection limits.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
