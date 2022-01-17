import fs from "fs";
import { invokeScript } from "./invokeBatch.js";

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