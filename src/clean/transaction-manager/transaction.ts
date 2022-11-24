import { Prisma, PrismaClient } from "@prisma/client";

export class TransactionManager {
  private prismaClient: PrismaClient;

  constructor() {
    this.prismaClient = new PrismaClient();
  }

  async handleTransaction<T>(cb: (transaction: Prisma.TransactionClient) => T): Promise<T> {
    const result = await this.prismaClient.$transaction(async (trx) => cb(trx));
    return result;
  }
}
