import "./utils/env.js";

import { ActivityType } from "discord.js";
import { BotClient } from "./structures/Client.js";
const client = new BotClient({
  presence: {
    activities: [
      {
        name: "G20",
        type: ActivityType.Watching
      }
    ]
  }
});

client.connect();
client.register();