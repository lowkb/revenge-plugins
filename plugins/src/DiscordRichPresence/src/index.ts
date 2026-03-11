import { storage } from "@vendetta/plugin";
import { logger } from "@vendetta";
import Settings from "./settings";
import RPCClient, { Activity } from "./rpc";

const typedStorage = storage as typeof storage & {
    selected: string;
    selections: Record<string, Activity>;
};

let rpc: RPCClient;

function ensureStorage() {
    if (!typedStorage.selected) typedStorage.selected = "default";
    if (!typedStorage.selections) typedStorage.selections = {};
    if (!typedStorage.selections[typedStorage.selected]) {
        typedStorage.selections[typedStorage.selected] = {
            name: "Vendetta RPC",
            application_id: "",
            type: 0,
            details: "",
            state: "",
            timestamps: { start: Date.now() },
            assets: {},
            buttons: [],
        };
    }
}

function sendActivity(activity?: Activity) {
    if (!rpc) return;
    rpc.sendActivity(activity ?? typedStorage.selections[typedStorage.selected]);
}

const plugin = {
    onLoad() {
        ensureStorage();
        rpc = new RPCClient("YOUR_CLIENT_ID"); // <- ustaw swój Discord App Client ID
        setTimeout(() => sendActivity(), 50);
    },
    onUnload() {
        sendActivity({ name: "", application_id: "", type: 0, details: "", state: "" });
    },
    settings: Settings
};

export default plugin;
export { sendActivity };
