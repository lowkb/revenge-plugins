import { FluxDispatcher } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { logger } from "@vendetta";
import Settings from "./settings";

export type Activity = {
    name: string;
    application_id: string;
    type: number;
    details: string;
    state: string;
    timestamps: { _enabled: boolean; start: number };
    assets: { large_image: string; large_text: string; small_image: string; small_text: string };
    buttons: { label: string; url: string }[];
};

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
        buttons: [
            { label: "", url: "" },
            { label: "", url: "" }
        ]
    };
}

// Ensure storage is initialized
if (!typedStorage.selected || !typedStorage.selections) {
    typedStorage.selected = "default";
    typedStorage.selections = { default: createDefaultSelection() };
} else if (!typedStorage.selections[typedStorage.selected]) {
    typedStorage.selections[typedStorage.selected] = createDefaultSelection();
}

async function sendActivity(activity: Activity | null) {
    if (!activity) {
        FluxDispatcher.dispatch({
            type: "LOCAL_ACTIVITY_UPDATE",
            activity: null,
            pid: 1608,
            socketId: "RPC@Vendetta"
        });
        return;
    }

    const cleanActivity = { ...activity };

    // Remove empty buttons
    cleanActivity.buttons = cleanActivity.buttons.filter(b => b.label && b.url);
    if (cleanActivity.buttons.length === 0) delete cleanActivity.buttons;

    FluxDispatcher.dispatch({
        type: "LOCAL_ACTIVITY_UPDATE",
        activity: cleanActivity,
        pid: 1608,
        socketId: "RPC@Vendetta"
    });

    logger.log("[RPC] Activity sent:", cleanActivity);
}

export default {
    onLoad() {
        const current = typedStorage.selections[typedStorage.selected];
        sendActivity(current).catch(e => logger.error("[RPC] Failed:", e));
    },
    onUnload() {
        sendActivity(null);
    },
    settings: Settings
};if (!typedStorage.selected) typedStorage.selected = "default";
if (!typedStorage.selections) typedStorage.selections = {};
if (!typedStorage.selections.default) typedStorage.selections.default = createDefaultSelection();

function buildActivity(activity: Activity) {
    const result: any = {};

    if (activity.name) result.name = activity.name;
    if (activity.application_id) result.application_id = activity.application_id;
    if (activity.type !== undefined) result.type = activity.type;
    if (activity.details) result.details = activity.details;
    if (activity.state) result.state = activity.state;

    if (activity.timestamps?._enabled) {
        result.timestamps = {
            start: activity.timestamps.start
        };
    }

    if (activity.assets) {
        const assets: any = {};

        if (activity.assets.large_image) assets.large_image = activity.assets.large_image;
        if (activity.assets.large_text) assets.large_text = activity.assets.large_text;
        if (activity.assets.small_image) assets.small_image = activity.assets.small_image;
        if (activity.assets.small_text) assets.small_text = activity.assets.small_text;

        if (Object.keys(assets).length) result.assets = assets;
    }

    const buttons = (activity.buttons || []).filter(b => b?.label && b?.url);
    if (buttons.length) result.buttons = buttons;

    return result;
}

function sendActivity(activity: Activity | null) {
    if (!activity) {
        FluxDispatcher.dispatch({
            type: "LOCAL_ACTIVITY_UPDATE",
            pid: 1608,
            socketId: "RPC@Vendetta",
            activity: null
        });
        return;
    }

    const cleanActivity = buildActivity(activity);

    FluxDispatcher.dispatch({
        type: "LOCAL_ACTIVITY_UPDATE",
        pid: 1608,
        socketId: "RPC@Vendetta",
        activity: cleanActivity
    });

    logger.log("[RPC] Activity sent", cleanActivity);
}

export default {
    onLoad() {
        try {
            const current = typedStorage.selections[typedStorage.selected];
            sendActivity(current);
        } catch (e) {
            logger.error("[RPC] Failed to send activity", e);
        }
    },

    onUnload() {
        sendActivity(null);
    },

    settings: Settings
};
