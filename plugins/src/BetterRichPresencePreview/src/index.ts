import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from '@vendetta/ui/assets';
const bunny = window.bunny.api.react.jsx;

function logComponent(component: any, ret: any) {
    if (!component || !ret) return;

    const cmpName = component.displayName || component.name || "UnknownComponent";
    const retName = ret.type?.displayName || ret.type?.name || "UnknownRet";

    const msg = `[JSXLogger] ${cmpName} -> ${retName}`;
    console.log(msg);
    showToast(msg, getAssetIDByName("Check"));
}

export default {
    onLoad() {
        console.log("[JSXLogger] Loaded!");
        bunny.onJsxCreate("*", logComponent);
    },
    onUnload() {
        // nie ma unpatcha bo onJsxCreate nie zwraca funkcji unpatch, jeśli trzeba można zrobić własny mechanizm
        console.log("[JSXLogger] Unloaded!");
    },
};
