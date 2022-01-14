import Command from "../../schema/command.js";
export default class extends Command {
    constructor(client) {
        super(client, {
            name: "delay",
            aliases: ["ping"],
            usage: "ping command",
            enabled: true,
            nsfw: false,
            developersOnly: false,
            cooldown: 3000,
            numberOfArgs: 0,
            args: new Array()
        });
    }
    async execute(message, args) {
        const ping = this.client.ws.ping;

        message.channel.send(`Pong! ${ping}`);
    }
}
