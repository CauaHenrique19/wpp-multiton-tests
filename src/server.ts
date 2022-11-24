import express from "express";
import { WhatsappWebJsAdapter } from "./clean/adapters";
import { Multiton } from "./clean/multiton";
import { Repository } from "./clean/repositories/repository";
import { TransactionManager } from "./clean/transaction-manager/transaction";
import { WhatsappAdapter, WhatsappClientInterface, List, Section } from "./clean/whatsapp";

const app = express();

const multiton = new Multiton<WhatsappClientInterface>();

class Observer<T> {
  constructor(private readonly fn: (data: T) => void) {}

  notify(data: T): void {
    this.fn(data);
  }
}

class ConnectToWhatsappUseCase {
  constructor(
    private readonly multiton: Multiton<WhatsappClientInterface>,
    private readonly whatsappAdapter: WhatsappAdapter
  ) {}

  async connect(parameters: { id: string; observer: Observer<{ qrCode: string }> }): Promise<void> {
    const { id, observer } = parameters;

    const client = await this.whatsappAdapter.create(id, (qrCode: string) => {
      observer.notify({ qrCode });
    });

    await this.multiton.addInstance({ id, instance: client });

    client.onMessage(async (message) => {
      if (message.selectedRowId) {
        const NUMBER = "5521990206939@c.us";
        await client.sendMessage(NUMBER, `Você selecionou a opção ${message.selectedRowId}`);
      }
    });
  }
}

app.get("/qr", async (req, res) => {
  const { id } = req.query as { id: string };

  //save instance client in multiton
  const observer = new Observer<{ qrCode: string }>((data) => {
    console.log("[NEW QRCODE]: ", data);
  });

  const adapter = new WhatsappWebJsAdapter();
  const sla = new ConnectToWhatsappUseCase(multiton, adapter);
  await sla.connect({ id, observer });

  res.status(200).json({ message: "Connected" });
});

app.post("/send-message", async (req, res) => {
  const { id } = req.query as { id: string };
  const { instance: client } = await multiton.getInstance(id);

  const fakeChannels = [
    {
      id: 1,
      name: "1️⃣ Teste 1",
      description: "Este canal é o primeiro canal",
    },
    {
      id: 2,
      name: "2️⃣ Teste 2",
      description: "Este canal é o segundo canal",
    },
    {
      id: 3,
      name: "3️⃣ Teste 3",
      description: "Este canal é o terceiro canal",
    },
    {
      id: 4,
      name: "4️⃣ Teste 4",
      description: "Este canal é o quarto canal",
    },
    {
      id: 5,
      name: "5️⃣ Teste 5",
      description: "Este canal é o quinto canal",
    },
  ];

  const rowsSections = fakeChannels.map((channel, index) => {
    return {
      id: channel.id.toString(),
      title: channel.name,
      description: channel.description,
    };
  });

  const texto = `👋 Olá Fulano de Tal, Tudo Bem? Esperamos que sim!
  \nPara continuarmos o seu atendimento será necessário que você selecione o canal relacionado ao seu atendimento.
  \nLembrando que sua resposta só será computada se você selecionar uma das opções na lista abaixo.`;

  let sections: Section[] = [
    {
      title: "Selecione o canal desejado.",
      rows: rowsSections,
    },
  ];

  const list: List = {
    body: texto,
    buttonText: "Visualizar Canais",
    sections,
  };

  const NUMBER = "5521990206939@c.us";
  await client.sendMessage(NUMBER, list);

  res.status(200).json({ message: "Mensagem Enviada" });
});

app.get("/unread-messages", async (req, res) => {
  //const { id } = req.query as { id: string };

  const repository = new Repository();
  const transactionManager = new TransactionManager();

  const result = await transactionManager.handleTransaction(async (transaction) => {
    const client = await repository.createClient(transaction);
    const user = await repository.createUser(transaction);

    return {
      client,
      user,
    };
  });

  console.log(result);

  // const prismaClient = new PrismaClient();

  // const teste = await prismaClient.$transaction(async (tx) => {
  // });

  //console.log(teste);
  //const client = await transaction.client.findFirst();

  res.status(200).json({});

  //const client = await multiton.getInstance(id);

  //const messages = await client.instance.getUnreadChats();
});

app.listen(4500, () => console.log("[SERVER] Running..."));
