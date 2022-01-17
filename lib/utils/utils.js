export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function bashCommandOutput(bashCommand, message, argument) {
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