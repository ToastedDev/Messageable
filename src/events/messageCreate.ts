import { Event } from "../structures/Event.js";

export default new Event({
  name: "messageCreate",
  run: async (client, message) => {
    if (!message.inGuild() || message.author.bot) return;

    const characters = message.content.split("").length;
    await client.db.user.upsert({
      where: {
        id: message.author.id,
      },
      create: {
        id: message.author.id,
        messages: 1,
        characters,
        messagesToday: 1,
        charactersToday: characters,
      },
      update: {
        messages: {
          increment: 1,
        },
        messagesHourly: {
          increment: 1,
        },
        messagesToday: {
          increment: 1,
        },
        characters: {
          increment: characters,
        },
        charactersToday: {
          increment: characters,
        },
      },
    });
  },
});
