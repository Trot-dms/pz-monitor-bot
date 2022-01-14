import Command from "../../schema/command.js";
import checkMods, { getModsToUpdate, saveChangedMods } from "../../utils/modsChecker.js";

export default class extends Command {
    constructor(client) {
        super(client, {
            name: "mods",
            aliases: ["ch"],
            usage: "mods check|restart",
            enabled: true,
            nsfw: false,
            developersOnly: false,
            cooldown: 3000,
            numberOfArgs: 1,
            args: ["check", "restart"],
        });
    }
    async execute(message, args) {
        const serverConfigPath = "/home/pzuser/Zomboid/Server/servertest.ini";
        const dbPath = "./database/mods.json";

        switch (args[0]) {
            case "mods": {
                const mods = await checkMods(dbPath, serverConfigPath);
                const modsToUpdate = getModsToUpdate(mods);
                if (modsToUpdate.length > 0) {
                    message.channel.send(`> [ZOMBOID] Server mods to update: ${modsToUpdate}`);
                    message.channel.send("> [ZOMBOID] Server restart required.");
                } else {
                    message.channel.send("> [ZOMBOID] Server mods are up to date.");
                }
                break;
            }
            default: {
                message.channel.send("> [ZOMBOID] Command not implemented yet.");
                break;
            }
        }
        /**
         * import checkMods, { shouldRestartServer, saveChangedMods } from './lib/utils/modsChecker.js';
         * const serverConfigPath = '/home/pzuser/Zomboid/Server/servertest.ini';
         * const dbPath = './mods.json';
         * const mods = await checkMods(dbPath, serverConfigPath);
         * const serverRestart = shouldRestartServer(mods);
         * console.log("Restaart server: ", serverRestart);
         * [RESTART SERVER...]
         * await saveChangedMods(dbPath, mods);
         */
    }
}
