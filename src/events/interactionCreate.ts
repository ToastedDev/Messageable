import { EmbedBuilder } from "discord.js";
import { colors } from "../consts.js";
import type { Interaction } from "../structures/Command.js";
import { Event } from "../structures/Event.js";

export default new Event({
  name: "interactionCreate",
  run: async (client, interaction) => {
    if (interaction.isChatInputCommand()) {
      if (!interaction.inGuild())
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("My commands only work in servers.")
              .setColor(colors.primary),
          ],
        });

      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.run({ client, interaction: interaction as Interaction });
      } catch (err) {
        console.error(err);
      }
    }
  },
});
