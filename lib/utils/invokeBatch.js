import { exec, spawn } from "child_process";

const invokeScript = async (script, args) => {
    return new Promise((resolve, reject) => {
        exec(script, args, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            } else {
                resolve(stdout);
            }
        });
    });
};

const spawnScript = (script, args) => {
    return spawn(script, args);
};

export { invokeScript, spawnScript };
