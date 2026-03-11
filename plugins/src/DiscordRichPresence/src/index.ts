import { FluxDispatcher } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { logger } from "@vendetta";
import Settings from "./settings";
import RPCClient from "./rpc";
import type { Activity } from "./types";

const typedStorage = storage as typeof storage & {
    selected: string;
    selections: Record<string, Activity>;
};

const pluginStart = Date.now();

function createDefaultSelection(): Activity {
    return {
        name: "",
        application_id: "",
        type: 0,
        details: "",
        state: "",
        timestamps: { _enabled: false, start: pluginStart },
        assets: { large_image: "", large_text: "", small_image: "", small_text: "" },
        buttons: [{ label: "", url: "" }, { label: "", url: "" }]
    };
}

function ensureStorage() {
    if (!typedStorage.selected || !typedStorage.selections) {
        typedStorage.selected = "default";
        typedStorage.selections = { default: createDefaultSelection() };
    } else if (!typedStorage.selections[typedStorage.selected]) {
        typedStorage.selections[typedStorage.selected] = createDefaultSelection();
    }
}

async function sendActivity(activity?: Activity | null) {
    const act = activity ?? createDefaultSelection();
    const cleanActivity = { ...act };
    cleanActivity.buttons = cleanActivity.buttons.filter(b => b.label && b.url);
    if (cleanActivity.buttons.length === 0) delete cleanActivity.buttons;

    FluxDispatcher.dispatch({
        type: "ACTIVITY_UPDATE",
        activity: cleanActivity,
        pid: 1608,
        socketId: "RPC@Vendetta"
    });

    logger.log("[RPC] Activity sent:", cleanActivity);
}

const plugin = {
    onLoad() {
        ensureStorage();
        setTimeout(() => {
            const current = typedStorage.selections[typedStorage.selected];
            sendActivity(current).catch(e => logger.error("[RPC] Failed:", e));
        }, 50);
    },
    onUnload() {
        sendActivity(null);
    },
    settings: Settings
};

export default plugin;
export { sendActivity };
export type { Activity };
