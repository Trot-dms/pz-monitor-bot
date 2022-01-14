export default class {
    constructor(
        client,
        { name = null, enabled = true, description = null, tickRate = 1, autostart = false, eventName = null }
    ) {
        this.client = client;
        this.name = name;
        this.enabled = enabled;
        this.description = description;
        this.tickRate = tickRate;
        this.autostart = autostart;
        this.running = false;
        this.eventName = eventName;
    }
    async execute() {
        this.running = true;
    }
    async stop() {
        this.running = false;
        this.autostart = false;
    }
}
