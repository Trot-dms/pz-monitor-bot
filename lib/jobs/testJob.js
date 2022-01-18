import Job from "../schema/backgroundTask.js";

export default class extends Job {
    constructor(client) {
        super(client, {
            name: "testJob",
            enabled: true,
            description: "Test Job",
            tickRate: 1,
            autostart: false
        });
    }
    async execute() {
        super.execute();
        console.log("Test Job is active!");
        setTimeout(() => {
            this.stop();
        }, 5000);
    }
    async stop() {
        super.stop();
        console.log("Test Job is stopping...");
    }
}
