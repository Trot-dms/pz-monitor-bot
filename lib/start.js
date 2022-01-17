import { Client, Collection } from "discord.js";
import { readdirSync } from "fs";
import configurationLoader from "./utils/configurationLoader.js";

class Load extends Client {
    constructor(config) {
        super({
            intents: [
                "GUILDS",
                "GUILD_MESSAGES",
                "GUILD_MESSAGE_REACTIONS",
                "DIRECT_MESSAGES",
                "DIRECT_MESSAGE_REACTIONS",
                "DIRECT_MESSAGE_TYPING",
            ],
        });
        this.commands = new Collection();
        this.jobs = new Map();
        this.config = config;
        this.maxTicks = 0;
    }

    async execute() {
        try {
            // Load jobs
            const backgroundTasks = readdirSync(process.cwd() + "/lib/jobs/");
            backgroundTasks
                .filter((task) => task.split(".").pop() === "js")
                .forEach(async (task) => {
                    const Task = await import(`./jobs/${task}`);
                    const Job = await new Task.default(this);
                    this.jobs.set(Job.name, Job);
                    if (Job.autostart) {
                        console.log(`Starting Job (autostart): ${Job.name}`);
                        await Job.execute();
                    }
                    if (this.maxTicks < Job.tickRate) {
                        this.maxTicks = Job.tickRate;
                    }
                    console.log(`Job ${Job.name} loaded.`);
                });

            // Load commands
            const directories = readdirSync(process.cwd() + "/lib/commands/");
            directories.forEach(async (dir) => {
                const commands = readdirSync(process.cwd() + "/lib/commands/" + dir + "/");
                commands
                    .filter((cmd) => cmd.split(".").pop() === "js")
                    .forEach(async (cmd) => {
                        const Load = await import(`./commands/${dir}/${cmd}`);
                        const Command = await new Load.default(this);
                        Command.availableEvents.forEach((event) => {
                            // Activate event listener
                            Command.on(event, async () => {
                                await this.jobs.get(event).execute();
                            });
                        });
                        this.commands.set(Command.help.name, Command);

                        console.log(`Command ${Command.help.name} loaded.`);
                    });
            });

            // Load events
            const eventFiles = readdirSync(process.cwd() + "/lib/events/");
            eventFiles.forEach(async (file) => {
                const eventName = file.split(".")[0];
                const event = new (await import(`./events/${file}`)).default(this);
                this.on(eventName, (...args) => event.execute(...args));
                console.log(`Event ${eventName} loaded.`);
            });

            await this.login(this.config.BOT_TOKEN);
            await this.backgroundTasks();
        } catch (error) {
            console.log(error);
        }
    }

    async backgroundTasks() {
        console.log("Background tasks runnung. Max tick rate: " + this.maxTicks);
        const defaultTick = 10000;
        let tick = 0;

        const interval = setInterval(async () => {
            tick += 1;
            console.log(`Tick: ${tick}`);
            this.jobs.forEach(async (job) => {
                if (job.enabled && !job.autostart && job.running && tick % job.tickRate === 0) {
                    await job.execute();
                }
            });
            if (tick >= this.maxTicks) tick = 0;
        }, defaultTick);
    }
}

(async function () {
    const config = await configurationLoader();
    new Load(config).execute();
})();
