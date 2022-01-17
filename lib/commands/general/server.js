import Command from "../../schema/command.js";
import { spawnScript } from "../../utils/invokeBatch.js";
import { checkServerStatus, getInfo } from "../../utils/serverUtils.js";
import { sleep, bashCommandOutput } from "../../utils/utils.js";
export default class extends Command {
    constructor(client) {
        super(client, {
            name: "server",
            aliases: ["srv"],
            usage: "server start|stop|backup|status|restart|info",
            enabled: true,
            nsfw: false,
            developersOnly: false,
            cooldown: 10000,
            numberOfArgs: 1,
            args: ["start", "stop", "backup", "status", "restart", "info"],
            availableEvents: ["checkServerStarted"],
        });
    }
    async execute(message, args) {
        const channel = this.client.channels.cache.find((channel) => channel.name === "server-events");
        const argument = args[0];

        let serverStatus = await checkServerStatus();
        let bashCommand;

        switch (argument) {
            case "start": {
                bashCommand =  this.serverStart(serverStatus, message, channel);
                break;
            }
            case "stop": {
                bashCommand = this.serverStop(serverStatus, message, channel);
                break;
            }
            case "status": {
                serverStatus = await checkServerStatus();
                channel.send(`> [ZOMBOID] Server status: ${serverStatus}.`);
                break;
            }
            case "restart": {
                bashCommand = await this.serverRestart(serverStatus, message, channel);
                break;
            }
            case "info": {
                if (serverStatus === "online") {
                    message.reply(`Server IP is: ${getInfo("/home/pzuser/Zomboid/server-console.txt")}`);
                } else {
                    message.channel.send(`Cannot execute command - server ${serverStatus}.`);
                }
                break;
            }
            default: {
                channel.send("> [ZOMBOID] Command not implemented yet.");
                break;
            }
        }

        bashCommandOutput(bashCommand, message, argument);
    }

    serverStart(serverStatus, message, channel) {
        if (serverStatus === "offline") {
            channel.send("> [ZOMBOID] Server starting...");
            let bashCommand = spawnScript("./lib/scripts/server_start.sh", ["/home/pzuser/pzserver/", "pz"]);
            this.emit(this.availableEvents[0]);
            return bashCommand;
        }
        message.reply("Server already started.");
    }

    serverStop(serverStatus, message, channel) {
        if (serverStatus === "online") {
            channel.send("> [ZOMBOID] Server stopped.");
            return spawnScript("./lib/scripts/server_stop.sh", ["pz"]);
        }
        message.reply("Server already stopped.");
    }

    async serverRestart(serverStatus, message, channel) {
        if (serverStatus === "online") {
            channel.send("> [ZOMBOID] Server restarting...");
            spawnScript("./lib/scripts/server_command.sh", ["pz", 'servermsg "Server restart in 1 min."']);
            await sleep(50000);
            let i = 10;
            while (i >= 1) {
                spawnScript("./lib/scripts/server_command.sh", ["pz", `servermsg "Server restart in ${i} sec."`]);
                await sleep(1000);
                i-=1;
            }
            spawnScript("./lib/scripts/server_command.sh", ["pz", 'servermsg "RESTART"']);
            await sleep(1000);
            this.serverStop("online", message, channel);
            await sleep(5000);
        } else {
            message.reply("Cannot restart server, server stopped.");
        }
        return this.serverStart("offline", message, channel);
    }
}
