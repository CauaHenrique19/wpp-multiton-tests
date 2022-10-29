import express from "express";
import { WhatsappWebJsAdapter } from "./clean/adapters";
import { Multiton } from "./clean/multiton";
import { WhatsappAdapter, WhatsappClientInterface } from "./clean/whatsapp";

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

  async connect(parameters: {
    id: string;
    observer: Observer<{ qrCode: string }>;
  }): Promise<void> {
    const { id, observer } = parameters;

    const client = await this.whatsappAdapter.create(id, (qrCode: string) => {
      observer.notify({ qrCode });
    });

    await this.multiton.addInstance({ id, instance: client });

    // const qrCode = new Promise<any>(async (resolve) => {
    // });
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

app.get("/unread-messages", async (req, res) => {
  const { id } = req.query as { id: string };

  const client = await multiton.getInstance(id);

  const messages = await client.instance.getUnreadChats();
  res.status(200).json({ messages });
});

app.listen(4500, () => console.log("[SERVER] Running..."));
