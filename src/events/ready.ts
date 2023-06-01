import { Event } from "../structures/Event.js";

export default new Event({
  name: "ready",
  once: true,
  run: (client) => console.log(`Logged in as ${client.user.tag}.`)
});