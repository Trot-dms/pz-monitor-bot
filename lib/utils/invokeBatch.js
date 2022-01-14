import { exec, spawn } from "child_process";

export async function invokeScript(script, args) {
    return new Promise((resolve, reject) => {
        exec(script, args, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            } else {
                resolve(stdout);
            }
        });
    });
}

export function spawnScript(script, args) {
    return spawn(script, args);
}
