import { showToast } from "@vendetta/ui/toasts";
import { before } from '@vendetta/patcher';
import { findByProps } from "@vendetta/metro";
import { getAssetIDByName } from '@vendetta/ui/assets';

const LazyActionSheet = findByProps("openLazy", "hideActionSheet");

function SheetOutput(key: string) {
    console.log(`[ActionSheetFinder] Opened: ${key}`);
    showToast(`[ActionSheetFinder] Opened: ${key}`, getAssetIDByName("Check"));
}

// patch dla wszystkich openLazy
const unpatchOpenLazy = before("openLazy", LazyActionSheet, ([_, key]) => {
    SheetOutput(key);
});

export default {
    onLoad() {
        console.log("[ActionSheetFinder] Loaded!");
    },
    onUnload() {
        unpatchOpenLazy?.();
        console.log("[ActionSheetFinder] Unloaded!");
    },
};
