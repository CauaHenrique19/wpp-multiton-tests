import {
  MessageInterface,
  WhatsappAdapter,
  WhatsappClientInterface,
} from "../whatsapp";
import makeWASocket, {
  WALegacySocket,
  WASocket,
  makeWALegacySocket,
} from "@adiwajshing/baileys";
("@adiwajshing/baileys");

export class BayleisWhatsappClient implements WhatsappClientInterface {
  constructor(private readonly client: WASocket) {}

  onMessage(cb: (message: MessageInterface) => void) {
    this.client.ev.on("messages.upsert", (message) => {
      console.log(message);

      cb(message as any);
    });
  }

  async getAllUnreadMessages(): Promise<any> {
    return [];
  }
}

export class BaileysAdapter implements WhatsappAdapter {
  async create(id: string): Promise<WhatsappClientInterface> {
    const socket = makeWASocket({});

    socket.ev.on("connection.update", (update) => {
      console.log(update);

      const { connection } = update;
      console.log(connection);

      if (connection === "close") {
        this.create(id);
      }

      if (connection === "open") {
        //resolve(socket);
      }
    });

    // const createdSocket = await new Promise<WALegacySocket>((resolve) => {
    // });

    return new BayleisWhatsappClient(socket);
  }
}
