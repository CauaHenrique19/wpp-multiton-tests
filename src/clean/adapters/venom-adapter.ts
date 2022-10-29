import {
  MessageInterface,
  WhatsappAdapter,
  WhatsappClientInterface,
} from "../whatsapp";
import { create, Whatsapp } from "venom-bot";

export class VenomWhatsappClient implements WhatsappClientInterface {
  constructor(private readonly client: Whatsapp) {}

  onMessage(cb: (message: MessageInterface) => void) {
    this.client.onMessage(async (message) => {
      const ureadMessages = await this.client.getAllContacts();
      console.log(ureadMessages);

      // const message: MessageInterface = {
      //   id,
      //   type,
      //   from,
      //   content,
      //   isGroup: isGroupMsg,
      //   time: new Date(),
      //   sender: {
      //     id: sender.id,
      //     contactName: sender.name,
      //     profileName: sender.pushname,
      //     urlProfileImage: sender.profilePicThumbObj.eurl,
      //     isMyContact: sender.isMyContact,
      //   },
      // };

      cb(message as any);
    });
  }

  getAllUnreadMessages(): Promise<any> {
    return this.client.getAllUnreadMessages();
  }
}

//specific implementation to venom-bot lib
export class VenomAdapter implements WhatsappAdapter {
  async create(id: string): Promise<WhatsappClientInterface> {
    const createdClient = await new Promise<Whatsapp>((resolve) => {
      create({ session: id, multidevice: true }).then((client) =>
        resolve(client)
      );
    });

    const client = new VenomWhatsappClient(createdClient);
    return client;

    // const createdClient = await new Promise<Whatsapp>(async (resolve) => {
    //   const sessions = [];

    //   const client = await create(id, undefined, (session) => {}, {
    //     multidevice: true,
    //   });

    //   const state = await client.getConnectionState();
    //   if (state === "CONNECTED") {
    //     resolve(client);
    //   }
    // });

    // const client = new VenomWhatsappClient(createdClient);
    // return client;
  }
}
