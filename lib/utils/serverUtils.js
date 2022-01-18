import fs from "fs";
import { invokeScript, spawnScript } from "./invokeBatch.js";
import checkMods, { getModsToUpdate, saveChangedMods } from "./modsChecker.js";

export async function checkServerStatus() {
    const serverStatus = await invokeScript("./lib/scripts/server_status.sh pzuser");
    return serverStatus.trim();
}

export function checkServerLogs(logsPath, findPhrase) {
    return getLog(logsPath).includes(findPhrase);
}

export function getInfo(logsPath) {
    const reg = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
    const log = getLog(logsPath);
    const ip = log.match(reg);
    const phrase = "server is listening on port ";
    const start = log.indexOf(phrase) + phrase.length;
    const end = start + 5;
    const port = log.substring(start, end);
    return `${ip.length > 0 ? ip : "No IP"}:${port}`;
}

function getLog(logsPath) {
    return fs.readFileSync(logsPath, "utf8");
}

export function serverStart(serverStatus, message, channel, notifyOnChannel = true) {
    if (serverStatus === "offline") {
        if (notifyOnChannel) channel.send("> [ZOMBOID] Server starting...");
        let bashCommand = spawnScript("./lib/scripts/server_start.sh", ["/home/pzuser/pzserver/", "pz"]);
        return bashCommand;
    }
    if (notifyOnChannel) message.reply("Server already started.");
}

export function serverStop(serverStatus, message, channel, notifyOnChannel = true) {
    if (serverStatus === "online") {
        if (notifyOnChannel) channel.send("> [ZOMBOID] Server stopped.");
        return spawnScript("./lib/scripts/server_stop.sh", ["pz"]);
    }
    if (notifyOnChannel) message.reply("Server already stopped.");
}

export async function serverGetModsToUpdate(updateDb = false, notifyResults = false) {
    const serverConfigPath = "/home/pzuser/Zomboid/Server/servertest.ini";
    const dbPath = "./database/mods.json";

    const mods = await checkMods(dbPath, serverConfigPath);
    const modsToUpdate = getModsToUpdate(mods, notifyResults);
    if (updateDb) {
        saveChangedMods(dbPath, mods);
    }
    return mods;
}