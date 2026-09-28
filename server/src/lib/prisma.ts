import { PrismaClient } from "@prisma/client";

// In dev, tsx watch re-evaluates this module on every file save, which would
// normally create a brand new PrismaClient (and a brand new connection pool)
// each time, without closing the old one. Stashing the client on `globalThis`
// makes it survive hot reloads, so we always reuse the same client and pool.
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;