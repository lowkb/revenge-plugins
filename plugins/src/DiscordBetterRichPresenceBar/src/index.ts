import { patcher } from "@vendetta";
import { findByTypeName } from "@vendetta/metro";
import { findInReactTree } from "@vendetta/utils";

let unpatches: (() => void)[] = [];

export default {
    onLoad: () => {
        console.log("[RPC LOG] Plugin loading...");

        const UserProfileContent = findByTypeName("UserProfileContent");
        if (!UserProfileContent) {
            console.warn("[RPC LOG] UserProfileContent not found!");
            return;
        }

        unpatches.push(
            patcher.after("type", UserProfileContent, (args, res) => {
                console.log("[RPC LOG] UserProfileContent rendered with args:", args);
                console.log("[RPC LOG] UserProfileContent render result:", res);

                let primaryInfo = findInReactTree(res, (c) => c?.type?.name === "PrimaryInfo");
                console.log("[RPC LOG] PrimaryInfo found:", primaryInfo);

                if (!primaryInfo) return res;

                patcher.after("type", primaryInfo, (args, res) => {
                    console.log("[RPC LOG] PrimaryInfo render args:", args);
                    console.log("[RPC LOG] PrimaryInfo render result:", res);

                    if (res?.type?.name === "UserProfilePrimaryInfo") {
                        patcher.after("type", res, (args, res) => {
                            console.log("[RPC LOG] UserProfilePrimaryInfo render args:", args);
                            console.log("[RPC LOG] UserProfilePrimaryInfo render result:", res);

                            let displayName = findInReactTree(res, (c) => c?.type?.name === "DisplayName");
                            console.log("[RPC LOG] DisplayName found:", displayName);

                            if (!displayName) return res;

                            patcher.after("type", displayName, (args, res) => {
                                console.log("[RPC LOG] DisplayName render args:", args);
                                console.log("[RPC LOG] DisplayName render result:", res);

                                let userId = args[0]?.user?.id;
                                console.log("[RPC LOG] Extracted userId:", userId);
                            });
                        });
                    }
                });

                return res;
            })
        );

        console.log("[RPC LOG] Plugin loaded, patchers installed for logging only");
    },

    onUnload: () => {
        console.log("[RPC LOG] Unloading plugin...");
        unpatches.forEach((u) => u());
        unpatches = [];
        console.log("[RPC LOG] Plugin unloaded");
    },
};
