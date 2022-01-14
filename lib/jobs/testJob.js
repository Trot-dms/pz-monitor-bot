import Job from "../schema/backgroundTask.js";

export default class extends Job {
    constructor(client) {
        super(client, {
            name: "testJob",
            enabled: true,
            description: "Test Job",
            tickRate: 1000,
        });
    }
    async execute() {
        console.log("Test Job is active!");
    }
    async stop() {
        this.running = false;
        console.log("Test Job is stopping...");
    }
}
