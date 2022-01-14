import { Low, JSONFile } from "lowdb";

const initializeDb = async (dbName) => {
    try {
        const adapter = new JSONFile(dbName);
        const lowDb = new Low(adapter);

        if (!lowDb) {
            throw new Error(`Error initializing db ${dbName}`);
        }
        await lowDb.read();
        return lowDb;
    } catch (err) {
        console.error(err);
    }
};

const getDatabaseData = async (dbName, key) => {
    try {
        const db = await initializeDb(dbName);
        return db.data[key];
    } catch (err) {
        console.error(err);
    }
};

export { initializeDb, getDatabaseData };
