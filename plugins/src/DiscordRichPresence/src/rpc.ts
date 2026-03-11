import { Activity } from "./types";

export default class RPCClient {
    clientId: string;

    constructor(clientId: string) {
        this.clientId = clientId;
    }

    connect(): void {
        console.log("[RPC] Connected");
    }

    sendActivity(activity: Activity): void {
        console.log("[RPC] Sending activity:", activity);
    }
}
