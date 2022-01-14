import Command from "../../schema/command.js";
import { spawnScript } from "../../utils/invokeBatch.js";
import { checkServerStatus } from "../../utils/serverUtils.js";
export default class extends Command {
    constructor(client) {
        super(client, {
            name: "server",
            aliases: ["srv"],
            usage: "server start|stop|backup|status|restart",
            enabled: true,
            nsfw: false,
            developersOnly: false,
            cooldown: 10000,
            numberOfArgs: 1,
            args: ["start", "stop", "backup", "status", "restart"],
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
                if (serverStatus === "offline") {
                    channel.send("> [ZOMBOID] Server starting...");
                    bashCommand = spawnScript("./lib/scripts/server_start.sh", ["/home/pzuser/pzserver/", "pz"]);
                    this.emit(this.availableEvents[0]);
                }
                break;
            }
            case "stop": {
                if (serverStatus === "online") {
                    channel.send("> [ZOMBOID] Server stopped.");
                    bashCommand = spawnScript("./lib/scripts/server_stop.sh", ["pz"]);
                } else {
                    message.channel.send(`Cannot execute command - server ${serverStatus}.`);
                }
                break;
            }
            case "status": {
                serverStatus = await checkServerStatus();
                channel.send(`> [ZOMBOID] Server status: ${serverStatus}.`);
                break;
            }
            default: {
                channel.send("> [ZOMBOID] Command not implemented yet.");
                break;
            }
        }

        this.bashCommandOutput(bashCommand, message, argument);
    }

    bashCommandOutput(bashCommand, message, argument) {
        if (bashCommand) {
            bashCommand.stdout.on("data", (data) => {
                console.log(`[DEBUG] ${data}.`);
            });

            bashCommand.stderr.on("data", (err) => {
                console.log(`[ERROR] ${err}`);
                message.channel.send("Something went wrong. " + err);
            });

            bashCommand.on("close", (code, signal) => {
                console.log(`[DEBUG] Command server ${argument} closed with code ${code} and signal ${signal}.`);
            });
        }
    }
}
