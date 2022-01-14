import fs from "fs";
import { invokeScript } from "./invokeBatch.js";

export async function checkServerStatus() {
    const serverStatus = await invokeScript("./lib/scripts/server_status.sh pzuser");
    return serverStatus.trim();
}

export function checkServerLogs(logsPath, findPhrase) {
    const data = fs.readFileSync(logsPath, "utf8");
    if (data.includes(findPhrase)) {
        return true;
    }
    return false;
}
