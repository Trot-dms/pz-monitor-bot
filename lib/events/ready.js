import Event from "../schema/event.js";

export default class extends Event {
    constructor(client) {
        super(client);
    }
    async execute() {
        console.log("(Event : Ready) : Bot is active!");
    }
}
