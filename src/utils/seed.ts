import { PrismaClient } from "@prisma/client";
import { BotClient } from "../structures/Client.js";
import { env } from "./env.js";
const prisma = new PrismaClient();
async function main() {
  await prisma.user.deleteMany({});

  const client = new BotClient();
  await client.login(env.TOKEN);

  if (!env.GUILD_ID) throw new SyntaxError("No GUILD_ID specified.");

  const guild = client.guilds.cache.get(env.GUILD_ID);
  if (!guild) throw new SyntaxError(`No guild with ID ${env.GUILD_ID} found.`);

  await guild.members.fetch();

  const members = [
    ...guild.members.cache
      .filter((member) => member.id !== client.user?.id)
      .values(),
  ];
  console.log(members);

  for (const member of members) {
    await prisma.user.upsert({
      where: {
        id: member.user.id,
      },
      create: {
        id: member.user.id,
      },
      update: {},
    });
    console.log(`Created record for ${member.user.tag}.`);
  }

  client.destroy();
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
