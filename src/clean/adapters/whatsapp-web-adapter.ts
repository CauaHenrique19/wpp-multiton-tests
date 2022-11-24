import { Client, LocalAuth, Chat as WhatsappWebChat, List as WhatsAppList } from "whatsapp-web.js";
import {
  Chat,
  List,
  MessageInterface,
  WhatsappAdapter,
  WhatsappClientInterface,
} from "../whatsapp";

export class WhatsappWebJsWhatsappClient implements WhatsappClientInterface {
  constructor(private readonly client: Client) {}

  onMessage(cb: (message: MessageInterface) => void) {
    this.client.on("message", async (message) => {
      const contact = await message.getContact();
      const urlContactImage = await contact.getProfilePicUrl();

      const formattedMessage: MessageInterface = {
        type: message.type,
        content: message.body,
        from: message.from,
        id: message.id.id,
        time: new Date(),
        isStatus: message.isStatus,
        isGroup: contact.isGroup,
        selectedRowId: message.selectedRowId,
        sender: {
          id: contact.id.user,
          profileName: contact.pushname,
          isMyContact: contact.isMyContact,
          urlProfileImage: urlContactImage,
          contactName: contact.name,
        },
      };

      console.log(message);
      cb(formattedMessage);
    });
  }

  onAckUpdated() {
    this.client.on("message_ack", (message, ack) => {
      console.log(message);
      console.log(ack);
    });
  }

  async getUnreadChats(): Promise<Chat[]> {
    const chats = await this.client.getChats();
    const unreadChats = chats.filter((chat) => chat.unreadCount !== 0);

    const fomattedChats: Chat[] = unreadChats.map(
      (chat: WhatsappWebChat & { pinned: boolean }) => ({
        name: chat.name,
        isGroup: chat.isGroup,
        isMuted: chat.isMuted,
        unreadCount: chat.unreadCount,
        pinned: chat.pinned,
        muteExpiration: chat.muteExpiration,
      })
    );

    return fomattedChats;
  }

  async sendMessage(number: string, content: List | string) {
    const contactInfo = await this.client.getNumberId(number);

    let finalContent = content;

    if (typeof content === "object") {
      const listContent = content as List;
      finalContent = new WhatsAppList(
        listContent.body,
        listContent.buttonText,
        listContent.sections
      );
    }

    await this.client.sendMessage(contactInfo._serialized, finalContent);
  }
}

export class WhatsappWebJsAdapter implements WhatsappAdapter {
  async create(id: string, onQr: (qr: string) => void): Promise<WhatsappClientInterface> {
    console.log(`[${id}] CREATING CLIENT...`);

    const createdClient = await new Promise<Client>(async (resolve) => {
      const client = new Client({
        authStrategy: new LocalAuth({ clientId: id }),
      });

      client.on("qr", (qr) => {
        onQr(qr);
      });

      client.on("ready", () => {
        console.log("im ready!!");
        resolve(client);
      });

      await client.initialize();
    });

    const client = new WhatsappWebJsWhatsappClient(createdClient);
    return client;
  }
}
