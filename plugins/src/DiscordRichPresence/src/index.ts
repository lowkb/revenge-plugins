import { FluxDispatcher } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { logger } from "@vendetta";
import Settings from "./settings";

const typedStorage = storage as typeof storage & {
    selected: string;
    selections: Record<string, Activity>;
};

const pluginStart = Date.now();

function createDefaultSelection(): Activity {
    return {
        name: "Example RPC",
        application_id: "",
        type: 0,
        details: "Example details",
        state: "Example state",
        timestamps: {
            _enabled: true,
            start: pluginStart
        },
        assets: {
            large_image: "",
            large_text: "Large image text",
            small_image: "",
            small_text: "Small image text"
        },
        buttons: [
            { label: "GitHub", url: "https://github.com" },
            { label: "Website", url: "https://example.com" }
        ]
    };
}

if (!typedStorage.selected) typedStorage.selected = "default";
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
