import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

/**
 * Create a Prisma client with Accelerate extension for edge runtime
 */
export function getPrismaClient(databaseUrl: string) {
  const prisma = new PrismaClient({
    datasourceUrl: databaseUrl,
  }).$extends(withAccelerate());

  return prisma;
}

export type PrismaClientType = ReturnType<typeof getPrismaClient>;
