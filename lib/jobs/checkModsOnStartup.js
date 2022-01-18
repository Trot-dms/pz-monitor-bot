import Job from "../schema/backgroundTask.js";
import { serverGetModsToUpdate } from "../utils/serverUtils.js";

export default class extends Job {
    constructor(client) {
        super(client, {
            name: "checkModsOnStartup",
            enabled: true,
            description: "Check if mods database needs to be updated.",
            tickRate: 1,
            autostart: true,
            eventName: "checkModsOnStartup",
        });
    }

    async execute() {
        super.execute();

        console.log(`(Job : ${this.name}) : Checing mods.`);
        const mods = await serverGetModsToUpdate(true, true);
    }

    async stop() {
        super.stop();
    }
}
