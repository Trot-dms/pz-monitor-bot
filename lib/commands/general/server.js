import Command from "../../schema/command.js";
import fs from "fs";
import { spawnScript, invokeScript } from "../../utils/invokeBatch.js";
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
        });
    }
    async execute(message, args) {
        const channel = this.client.channels.cache.find((channel) => channel.name === "server-events");
        const argument = args[0];

        let serverStatus = await this.checkServerStatus();
        let bashCommand;

        switch (argument) {
            case "start": {
                if (serverStatus === "offline") {
                    channel.send("> [ZOMBOID] Server starting...");
                    bashCommand = spawnScript("./lib/scripts/server_start.sh", ["/home/pzuser/pzserver/", "pz"]);
                    this.checkServerWasLaunched(channel);
                }
                break;
            }
            case "stop": {
                if (serverStatus === "online") {
                    channel.send("> [ZOMBOID] Server stoping...");
                    bashCommand = spawnScript("./lib/scripts/server_stop.sh", ["pz"]);
                } else {
                    message.channel.send(`Cannot execute command - server ${serverStatus}.`);
                }
                break;
            }
            case "status": {
                serverStatus = await this.checkServerStatus();
                channel.send(`> [ZOMBOID] Server status: ${serverStatus}`);
                break;
            }
            default: {
                channel.send("> [ZOMBOID] Command not implemented yet.");
                break;
            }
        }

        this.bashCommandOutput(bashCommand, message, argument);
    }

    checkServerLogs(logsPath, findPhrase) {
        const data = fs.readFileSync(logsPath, "utf8");
        if (data.includes(findPhrase)) {
            return true;
        }
        return false;
    }

    async checkServerStatus() {
        const serverStatus = await invokeScript("./lib/scripts/server_status.sh", ["pzuser"]);
        return serverStatus.trim();
    }

    async checkServerWasLaunched(channel) {
        let count = 0;
        const interval = setInterval(async () => {
            if (
                (await this.checkServerStatus()) === "online" &&
                this.checkServerLogs("/home/pzuser/Zomboid/server-console.txt", "SERVER STARTED")
            ) {
                channel.send("> [ZOMBOID] Server started.");
                clearInterval(interval);
            }
            count++;
            if (count > 10) {
                channel.send("> [ZOMBOID] Could not start Server.");
                clearInterval(interval);
            }
        }, 1000 * 30);
    }

    bashCommandOutput(bashCommand, message, argument) {
        if (bashCommand) {
            bashCommand.stdout.on("data", (data) => {
                console.log(`[DEBUG] ${data}`);
            });

            bashCommand.stderr.on("data", (err) => {
                console.log(`[ERROR] ${err}`);
                message.channel.send("Something went wrong." + err);
            });

            bashCommand.on("close", (code, signal) => {
                console.log(`[DEBUG] Command server ${argument} closed with code ${code} and signal ${signal}`);
            });
        }
    }
}
