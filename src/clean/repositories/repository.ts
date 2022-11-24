import { Prisma, PrismaClient } from "@prisma/client";

export class Repository {
  private prismaClient: PrismaClient;

  constructor() {
    this.prismaClient = new PrismaClient();
  }

  async findClient(tx?: Prisma.TransactionClient) {
    const finalClient = tx ? tx : this.prismaClient;
    return await finalClient.client.findFirst();
  }

  async createClient(tx?: Prisma.TransactionClient) {
    const finalClient = tx ? tx : this.prismaClient;
    return await finalClient.client.create({
      data: {
        name: "Teste Transaction",
        status: 1,
        createdAt: new Date(),
      },
    });
  }

  async createUser(tx?: Prisma.TransactionClient) {
    const finalClient = tx ? tx : this.prismaClient;
    return await finalClient.user.create({
      data: {
        name: "Teste",
        lastName: "Transaction",
        email: "teste@transaction.com.br",
        status: 1,
        password: "123456",
        admin: false,
        clientId: 1,
        createdAt: new Date(),
      },
    });
  }

  async findUser(tx?: Prisma.TransactionClient) {
    const finalClient = tx ? tx : this.prismaClient;
    return await finalClient.user.findFirst();
  }
}
