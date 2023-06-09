import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { colors } from "../../consts.js";
import { Command } from "../../structures/Command.js";

export default new Command({
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("View the stats of a user.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to view the stats of.")
        .setRequired(false)
    ),
  run: async ({ client, interaction }) => {
    const user = interaction.options.getUser("user") || interaction.user;
    const data = await client.db.user.upsert({
      where: {
        id: user.id,
      },
      create: {
        id: user.id,
      },
      update: {},
    });

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: user.tag,
            iconURL: user.displayAvatarURL(),
          })
          .setDescription(
            [
              `**Messages**: ${data.messages.toLocaleString()}`,
              `↪ **Today**: ${data.messagesToday.toLocaleString()}`,
              `**Characters**: ${data.characters.toLocaleString()}`,
              `↪ **Today**: ${data.charactersToday.toLocaleString()}`,
            ].join("\n")
          )
          .setColor(colors.primary),
      ],
      ephemeral: true,
    });
  },
});
