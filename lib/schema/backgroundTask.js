export default class {
    constructor(client, { name = null, enabled = true, description = null, tickRate = 1, autostart = false }) {
        this.client = client;
        this.name = name;
        this.enabled = enabled;
        this.description = description;
        this.tickRate = tickRate;
        this.autostart = autostart;
        this.running = false;
    }
    async execute() {
        this.running = true;
    }
    async stop() {
        this.running = false;
        this.autostart = false;
    }
}
