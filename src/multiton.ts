import { create, Whatsapp } from "venom-bot";
import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

export interface MessageInterface {
  id: string;
  type: string;
  from: string;
  content: string;
  isGroup: boolean;
  time: Date;
  sender: SenderInterface;
}

export interface SenderInterface {
  id: string;
  contactName: string;
  profileName: string;
  urlProfileImage: string;
  isMyContact: boolean;
}

//generic contract for implementation
export interface WhatsappClientInterface {
  onMessage(cb: (message: MessageInterface) => void);
  getAllUnreadMessages(): Promise<any>;
}

//specific implementation to venom-bot lib
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

// class WhatsappWebJsWhatsappClient implements WhatsappClientInterface {
//   constructor(private readonly client: Client) {}

//   onMessage(cb: (message: any) => void) {
//     this.client.on("message", (message) => {
//       console.log(message);
//       cb(message);
//     });
//   }
// }

//generic contract for implementation
interface WhatsappAdapter {
  create(id: string): Promise<WhatsappClientInterface>;
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

// class WhatsappWebJsAdapter implements WhatsappAdapter {
//   async create(id: string): Promise<WhatsappClientInterface> {
//     console.log(`[${id}] CREATING CLIENT...`);

//     const createdClient = await new Promise<Client>(async (resolve) => {
//       const client = new Client({
//         authStrategy: new LocalAuth({ clientId: id }),
//       });

//       client.on("qr", (qr) => {
//         qrcode.generate(qr, { small: true });
//       });

//       client.on("ready", () => {
//         console.log("im ready!!");
//         resolve(client);
//       });

//       await client.initialize();
//     });

//     const client = new WhatsappWebJsWhatsappClient(createdClient);
//     return client;
//   }
// }

export interface TypeMultiton<T> {
  id: string;
  instance: T;
}

export interface MultitonInterface<T> {
  /** 
    @param {TypeMultiton<T>} instanceToAdd Instance to add in list of intances
    @returns {TypeMultiton<T>} union of instance and id used to search (if the value was added successfully)
  */
  addInstance(instanceToAdd: TypeMultiton<T>): Promise<TypeMultiton<T>>;

  /** 
    @param {string} id Id to search instance
    @returns {TypeMultiton<T>} union of instance and id used to search (if value has been found)
  */
  getInstance(id: string): Promise<TypeMultiton<T>>;
}

export class Multiton<T> implements MultitonInterface<T> {
  private readonly instances: TypeMultiton<T>[] = [];

  public addInstance(instanceToAdd: TypeMultiton<T>): Promise<TypeMultiton<T>> {
    return new Promise<TypeMultiton<T>>((resolve, reject) => {
      const instanceInList = this.instances.find(
        (instance) => instance.id === instanceToAdd.id
      );
      if (instanceInList) {
        reject();
      }

      this.instances.push(instanceToAdd);
      resolve(instanceToAdd);
    });
  }

  public getInstance(id: string): Promise<TypeMultiton<T>> {
    return new Promise<TypeMultiton<T>>((resolve) => {
      const instance = this.instances.find((instance) => instance.id === id);
      resolve(instance);
    });
  }
}

class HandleConnectionOfWhatsapp {
  constructor(
    private readonly whatsappClient: WhatsappAdapter,
    private readonly multiton: MultitonInterface<WhatsappClientInterface>
  ) {}

  async connect() {
    const IDS = ["jamal", "jamal-2"];

    for (const ID of IDS) {
      const client = await this.whatsappClient.create(ID);
      await this.multiton.addInstance({ id: ID, instance: client });

      const whatsappClientInstance = await this.multiton.getInstance(ID);

      console.log("pronto pra receber mensagens!!");

      (whatsappClientInstance.instance as any).client.on(
        "message",
        (message) => {
          console.log(message);
        }
      );

      //console.log(whatsappClientInstance.instance);

      whatsappClientInstance.instance.onMessage((message) => {
        console.log(message);
      });

      client.onMessage((message) => {
        console.log(message);
      });
    }
  }
}

function buildHandleConnectionOfWhatsapp() {
  const venomAdapter = new VenomAdapter();
  //const whatsappWebJsAdapter = new WhatsappWebJsAdapter();

  const multiton = new Multiton<WhatsappClientInterface>();

  const handleConnectionOfWhatsapp = new HandleConnectionOfWhatsapp(
    venomAdapter,
    multiton
  );

  handleConnectionOfWhatsapp.connect();
}

//buildHandleConnectionOfWhatsapp();

// async function connect() {
//   const ID = "jamal";

//   //const client = await create({ session: ID, multidevice: true });

//   const venomAdapter = new VenomAdapter();
//   const client = await venomAdapter.create(ID);

//   const multiton = new Multiton<WhatsappClientInterface>();
//   multiton.addInstance({ id: ID, instance: client });

//   const whatsappInstance = multiton.getInstance(ID);
//   whatsappInstance.instance.onMessage((message) => {
//     console.log(message);
//   });
// }

// connect();
