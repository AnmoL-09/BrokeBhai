import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

export const db = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + "?pgbouncer=true&connection_limit=1",
    },
  },
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  errorFormat: 'pretty',
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

// Handle cleanup on process termination
process.on('beforeExit', async () => {
  await db.$disconnect();
});

// Force disconnect and reconnect for Supabase pooling issues
export async function refreshConnection() {
  try {
    await db.$disconnect();
    await db.$connect();
  } catch (error) {
    console.error('Connection refresh failed:', error);
  }
}

// globalThis.prisma: This global variable ensures that the Prisma client instance is
// reused across hot reloads during development. Without this, each time your application
// reloads, a new instance of the Prisma client would be created, potentially leading
// to connection issues.
