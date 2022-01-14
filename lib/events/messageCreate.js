import Event from "../schema/event.js";
import humanizeDuration from "humanize-duration";
let commandCooldown = {};

export default class extends Event {
    constructor(client) {
        super(client);
    }
    async execute(message) {
        const messageArgs = message.content.split(" ").slice(1);
        if (message.content.startsWith(this.client.config.PREFIX)) {
            let commandName = message.content.split(" ")[0].slice(this.client.config.PREFIX.length);

            if (message.content.startsWith(this.client.config.PREFIX)) {
                let command =
                    this.client.commands.get(commandName) ||
                    this.client.commands.find(({ help: { aliases } }) => aliases.includes(commandName));
                if (command) {
                    // Zero args in command means that this command can have many arguments and won't be checked here.
                    if (messageArgs.length > 0) {
                        if (!command.args.some((arg) => messageArgs.includes(arg)))
                            return message.channel.send(`Argument ${messageArgs} is not allowed.`);
                    }

                    if (command.numberOfArgs > 0 && command.numberOfArgs > messageArgs.length)
                        return message.channel.send(`Wrong number or arguments. Use minimum ${command.numberOfArgs}.`);

                    if (!command.conf.enabled) return message.channel.send("This command is currently disabled!");

                    if (command.conf.developersOnly && !this.client.config.DEVELOPERS.includes(message.author.id))
                        return message.channel.send("This command is for developers.");

                    if (command.conf.nsfw && !message.channel.nsfw)
                        return message.channel.send("This command cannot be used outside of the nsfw channel!");

                    let userCooldown = commandCooldown[message.author.id];
                    if (!userCooldown) {
                        commandCooldown[message.author.id] = {};
                        commandCooldown[message.author.id][command.help.name] = Date.now() + command.conf.cooldown;
                    } else {
                        const time = userCooldown[command.help.name] || 0;
                        if (time && time > Date.now()) {
                            return message.reply(
                                "you have to wait {time} to use this command again".replace(
                                    "{time}",
                                    humanizeDuration(time - Date.now(), { round: true })
                                )
                            );
                        }
                    }

                    try {
                        command.execute(message, messageArgs);
                    } catch (err) {
                        console.log(err);
                    }
                }
            }
        }
    }
}
