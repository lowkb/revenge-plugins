import { MiniEmitter } from "./ws";

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

export default class RPCClient extends MiniEmitter {
    clientId: string;
    constructor(clientId: string) {
        super();
        this.clientId = clientId;
    }

    connect() {
        this.emit("open");
    }

    sendActivity(activity: Activity) {
        this.emit("activity", activity);
    }
}
