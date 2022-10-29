import { Multiton, MultitonInterface } from "./multiton";
import { WhatsappAdapter, WhatsappClientInterface } from "./whatsapp";
import { WhatsappWebJsAdapter, BaileysAdapter, VenomAdapter } from "./adapters";

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
      whatsappClientInstance.instance.onMessage((message) => {
        console.log(message);
      });
    }
  }
}

function buildHandleConnectionOfWhatsapp() {
  const venomAdapter = new VenomAdapter();
  const whatsappWebJsAdapter = new WhatsappWebJsAdapter();
  const baileysAdapter = new BaileysAdapter();

  const multiton = new Multiton<WhatsappClientInterface>();

  const handleConnectionOfWhatsapp = new HandleConnectionOfWhatsapp(
    whatsappWebJsAdapter,
    multiton
  );

  handleConnectionOfWhatsapp.connect();
}

buildHandleConnectionOfWhatsapp();
