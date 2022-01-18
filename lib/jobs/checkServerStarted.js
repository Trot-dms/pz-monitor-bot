import Job from "../schema/backgroundTask.js";
import { checkServerStatus, checkServerLogs } from "../utils/serverUtils.js";
import { initializeDb } from "../utils/dbAdapter.js";

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
        const dbPath = "./database/mods.json";

        try {
            if (
                (await checkServerStatus()) === "online" &&
                checkServerLogs("/home/pzuser/Zomboid/server-console.txt", "SERVER STARTED")
            ) {
                channel.send("> [ZOMBOID] Server started.");
                const db = await initializeDb(dbPath);
                let data = {};

                if (db) {
                    data = db.data;
                    // When server will be started, mods will be updated so update all mods in database.
                    Object.keys(data).forEach((key) => {
                        data[key].status = "ok";
                    });
                    db.write();
                }
                this.stop();
            }
            this.numberOfTries++;
            if (this.numberOfTries > 10) {
                channel.send("> [ZOMBOID] Could not start Server.");
                this.stop();
            }
        } catch (error) {
            console.log(error);
        }
    }

    async stop() {
        super.stop();
        this.numberOfTries = 0;
    }
}
