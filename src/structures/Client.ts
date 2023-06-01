import { PrismaClient } from "@prisma/client";
import type { ApplicationCommandDataResolvable, ClientOptions } from "discord.js";
import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "../utils/env.js";
import type { CommandData } from "./Command.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

type BotOptions = Omit<ClientOptions, "intents" | "partials">;

export class BotClient<Ready extends boolean = boolean> extends Client<Ready> {
  commands = new Collection<string, CommandData>();
  db = new PrismaClient();

  constructor(options?: BotOptions) {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
      ],
      partials: [Partials.Message, Partials.Reaction, Partials.User],
      ...options,
    });
  }

  connect() {
    this.login(env.TOKEN);
  }

  async register() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    async function registerCommands() {
      const commands: ApplicationCommandDataResolvable[] = [];
      fs.readdirSync(path.join(__dirname, "../commands")).forEach(
        async (dir) => {
          const commandFiles = fs
            .readdirSync(path.join(__dirname, `../commands/${dir}`))
            .filter((file) => file.endsWith("ts") || file.endsWith("js"));

          for (const file of commandFiles) {
            const command = await import(`../commands/${dir}/${file}`)
              .then((x) => x?.default)
              .catch(() => null);
            if (!command?.data || !command?.run) continue;

            self.commands.set(command.data.toJSON().name, command);
            commands.push({
              ...command.data.toJSON(),
              dmPermission: false,
            });
          }
        }
      );

      self.on("ready", async () => {
        if (env.GUILD_ID && env.GUILD_ID.length) {
          const guild = self.guilds.cache.get(env.GUILD_ID);
          if (!guild)
            throw new SyntaxError(`No guild found with ID ${env.GUILD_ID}.`);

          guild.commands.set(commands);
          console.log(`Registered commands in ${guild.name}.`);
        } else {
          self.application?.commands.set(commands);
          console.log("Registered commands globally.");
        }
      });
    }

    async function registerEvents() {
      const eventFiles = fs
        .readdirSync(path.join(__dirname, "../events"))
        .filter((file) => file.endsWith("ts") || file.endsWith("js"));

      for (const file of eventFiles) {
        const event = await import(`../events/${file}`)
          .then((x) => x?.default)
          .catch(() => null);
        if (!event?.name || !event?.run) continue;

        self.on(event.name, event.run.bind(null, self));
      }
    }

    await registerCommands();
    await registerEvents();
  }
}
