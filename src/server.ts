import express from "express";
import { Multiton, VenomAdapter, WhatsappClientInterface } from "./multiton";

const app = express();

const multiton = new Multiton<WhatsappClientInterface>();

app.get("/qr", async (req, res) => {
  const { id } = req.query as { id: string };

  //save instance client in multiton
  const venomAdapter = new VenomAdapter();

  const client = await venomAdapter.create(id);
  await multiton.addInstance({ id, instance: client });
  const whatsappClientInstance = await multiton.getInstance(id);

  console.log(`[${id}] ready to receive messages`);
  whatsappClientInstance.instance.onMessage((message) => {
    console.log(message);
  });

  res.status(200).json({ message: "Connected" });
});

app.get("/unread-messages", async (req, res) => {
  const { id } = req.query as { id: string };

  const client = await multiton.getInstance(id);

  const messages = await client.instance.getAllUnreadMessages();
  console.log(client.instance);

  res.status(200).json({ messages });
});

app.listen(4500, () => console.log("[SERVER] Running..."));
