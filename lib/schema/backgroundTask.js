export default class {
    constructor(
        client,
        {
            name = null,
            enabled = true,
            description = null,
            tickRate = 1000,
        }
    ) {
        this.client = client;
        this.name = name;
        this.enabled = enabled;
        this.description = description;
        this.tickRate = tickRate;
        this.running = false;
    }
    async execute() {
        throw new Error("Background Task execute() method not implemented!");
    }
    async stop() {
        throw new Error("Background Task stop() method not implemented!");
    }
}
