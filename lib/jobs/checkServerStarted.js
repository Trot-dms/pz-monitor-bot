import Job from "../schema/backgroundTask.js";
import { checkServerStatus, checkServerLogs } from "../utils/serverUtils.js";

export default class extends Job {
    constructor(client) {
        super(client, {
            name: "checkServerStarted",
            enabled: true,
            description: "Check if the server is started when command !server start was used.",
            tickRate: 3, //each 30 seconds
            autostart: false,
            eventName: "checkServerStarted",
        });
        this.numberOfTries = 0;
    }

    async execute() {
        super.execute();
        const channel = this.client.channels.cache.find((channel) => channel.name === "server-events");

        if (
            (await checkServerStatus()) === "online" &&
            checkServerLogs("/home/pzuser/Zomboid/server-console.txt", "SERVER STARTED")
        ) {
            channel.send("> [ZOMBOID] Server started.");
            this.stop();
        }
        this.numberOfTries++;
        if (this.numberOfTries > 10) {
            channel.send("> [ZOMBOID] Could not start Server.");
            this.stop();
        }
    }

    async stop() {
        super.stop();
        this.numberOfTries = 0;
    }
}
