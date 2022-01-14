export default class {
    constructor(client) {
        this.client = client;
    }
    async execute() {
        throw new Error("Event execute() method not implemented!");
    }
}