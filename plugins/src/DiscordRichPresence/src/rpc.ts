// src/rpc.ts

// Interfejs Activity wyraźnie eksportowany
export interface Activity {
    name: string;
    application_id: string;
    type: number;
    details: string;
    state: string;
    timestamps: { _enabled: boolean; start: number };
    assets: { large_image: string; large_text: string; small_image: string; small_text: string };
    buttons: { label: string; url: string }[];
}

// Klasa RPCClient eksportowana jako default
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
