import { CronJob } from "cron";
import { EmbedBuilder } from "discord.js";
import { colors } from "../consts.js";
import { Event } from "../structures/Event.js";

export default new Event({
  name: "ready",
  run: (client) => {
    console.log(`Logged in as ${client.user.tag}.`);

    new CronJob("0 0 * * *", createReport, null, true, "Africa/Abidjan");
    async function createReport() {
      const channel = await client.channels.fetch("1113632965000429749");
      if (!channel || !channel.isTextBased() || channel.isDMBased()) return;

      await channel.guild.members.fetch();

      const users = await client.db.user.findMany({});

      channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle("Messages sent in the last day")
            .setDescription(
              users
                .filter((user) => channel.guild.members.cache.get(user.id))
                .sort((a, z) => z.messagesToday - a.messagesToday)
                .map(
                  (user) =>
                    `**${channel.guild.members.cache.get(
                      user.id
                    )}**: ${user.messagesToday.toLocaleString()}`
                )
                .join("\n")
            )
            .setFooter({
              text: `Total messages today: ${users.reduce((a, b) => a + b.messagesToday, 0).toLocaleString()}`
            })
            .setTimestamp()
            .setColor(colors.primary),
        ],
      });

      for (const user of users) {
        await client.db.user.update({
          where: {
            id: user.id,
          },
          data: {
            messagesToday: 0,
            charactersToday: 0,
          },
        });
      }
    }
  },
});
