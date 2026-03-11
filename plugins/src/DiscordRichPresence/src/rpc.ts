// src/rpc.ts
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

export default class RPCClient {
    clientId: string;
    constructor(clientId: string) {
        this.clientId = clientId;
    }

    connect() {
        // w minimalnej wersji tylko logika otwarcia
        console.log("[RPC] Connected");
    }

    sendActivity(activity: Activity) {
        // w minimalnej wersji tylko log aktywności
        console.log("[RPC] Sending activity:", activity);
    }
}
