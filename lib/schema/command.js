import { EventEmitter } from "events";
export default class extends EventEmitter {
    constructor(
        client,
        {
            name = null,
            enabled = true,
            description = null,
            usage = null,
            aliases = new Array(),
            nsfw = false,
            developersOnly = false,
            cooldown = 3000,
            numberOfArgs = 0,
            args = new Array(),
            availableEvents = new Array(),
        }
    ) {
        super();
        this.client = client;
        this.conf = { enabled, cooldown, nsfw, developersOnly };
        this.help = { name, aliases, description, usage };
        this.numberOfArgs = numberOfArgs;
        this.args = args;
        this.availableEvents = availableEvents;
    }
    async execute() {
        throw new Error("Command execute() method not implemented!");
    }
}
