import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

/**
 * Create or reuse a Prisma client with Accelerate extension for edge runtime
 */
export function getPrismaClient(databaseUrl: string) {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      datasourceUrl: databaseUrl,
    }).$extends(withAccelerate()) as unknown as PrismaClient;
  }

  return globalForPrisma.prisma;
}

export type PrismaClientType = ReturnType<typeof getPrismaClient>;
