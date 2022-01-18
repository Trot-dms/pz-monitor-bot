/**
 * USAGE:
 *
 * import checkMods, { shouldRestartServer, saveChangedMods } from './lib/utils/modsChecker.js';
 * const serverConfigPath = '/home/pzuser/Zomboid/Server/servertest.ini';
 * const dbPath = './mods.json';
 * const mods = await checkMods(dbPath, serverConfigPath);
 * const serverRestart = shouldRestartServer(mods);
 * console.log("Restaart server: ", serverRestart);
 * [RESTART SERVER...]
 * await saveChangedMods(dbPath, mods);
 */
import fs from "fs";
import { initializeDb } from "./dbAdapter.js";
import axios from "axios";

const STATUS = Object.freeze({
    OK: "ok",
    UPDATE: "update",
});

export default async function checkMods(dbPath, serverConfigPath) {
    const serverConfig = getServerConfig(serverConfigPath);
    const serverMods = getModsFromConfig(serverConfig);
    const steamData = await getSteamWorkshopModsData(serverMods);
    return await updateModsStatuses(dbPath, serverMods, steamData);
}

/**
 * Returns config ini from server.
 * @param {string} dbPath
 * @returns {object} config object (key value pairs)
 */
function getServerConfig(dbPath) {
    const config = {};
    try {
        const data = fs.readFileSync(dbPath, "utf8");
        if (!data) {
            console.error("Error reading server.ini");
        } else {
            const lines = data.split("\n");
            lines.forEach((line) => {
                const [key, value] = line.split("=");
                config[key] = value;
            });
        }
    } catch (err) {
        console.error(err);
    }
    return config;
}

/**
 * Parse server config ini file and returns mods object.
 * @param {object} config
 * @returns {object} mods object (id : { name, status, lastUpdate })
 */
function getModsFromConfig(config) {
    const mods = {};
    try {
        if (config.WorkshopItems.length > 0 && config.Mods.length > 0) {
            const modIds = config.WorkshopItems.split(";");
            const modNames = config.Mods.split(";");
            modIds.forEach((modId, index) => {
                mods[modId] = {
                    name: modNames[index],
                };
            });
        }
    } catch (err) {
        console.error(err);
    }
    return mods;
}

/**
 * Update mods status based on Steam response data.
 * @param {string} dbName
 * @param {object} mods
 * @param {object} steamResponse
 * @returns {object}
 */
async function updateModsStatuses(dbName, mods, steamResponse) {
    const db = await initializeDb(dbName);
    let data = {};

    if (db && steamResponse) {
        try {
            data = db.data;
            const steamData = steamResponse.response.publishedfiledetails;

            Object.keys(mods).forEach((modId) => {
                const modData = steamData.find((mod) => mod.publishedfileid === modId);

                if (data[modId]) {
                    if ((parseInt(data[modId].lastUpdate) || 0) < parseInt(modData.time_updated) && data[modId].status === STATUS.OK) {
                        data[modId].status = STATUS.UPDATE;
                        data[modId].lastUpdate = modData.time_updated;
                    } else {
                        data[modId].status = STATUS.OK;
                    }
                } else {
                    data[modId] = {
                        name: mods[modId].name,
                        status: STATUS.UPDATE,
                        lastUpdate: modData.time_updated,
                    };
                }
            });
        } catch (err) {
            console.error(err);
        }
        return data;
    }
}

async function getSteamWorkshopModsData(mods) {
    let data = {};
    if (!mods) {
        return data;
    }

    let body = `itemcount=${Object.keys(mods).length}`;
    let count = 0;
    Object.keys(mods).forEach((modId) => {
        body = body.concat(`&publishedfileids[${count}]=${modId}`);
        count = count + 1;
    });

    try {
        const response = await axios.post(
            "https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/",
            body,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );
        data = response.data;
    } catch (err) {
        console.error(err);
    }
    return data;
}

export function getModsToUpdate(mods, notifyResults = true) {
    let modsToUpdate = [];
    if (mods) {
        Object.keys(mods).forEach((modId) => {
            if (mods[modId].status === STATUS.UPDATE) {
                modsToUpdate.push(mods[modId].name);
            }
        });

        if (modsToUpdate.length > 0 && notifyResults) {
            console.log(`Mods to update: ${modsToUpdate.join(", ")}`);
        }
    }
    return modsToUpdate;
}

export async function saveChangedMods(dbName, mods) {
    const db = await initializeDb(dbName);
    if (db) {
        db.data = mods;
        db.write();
    }
}
