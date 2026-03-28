import { patcher } from "@vendetta";
import { findByTypeName, findByStoreName } from "@vendetta/metro";
import { storage } from "@vendetta/plugin";
import React from "react";
import { General } from "@vendetta/ui/components";
import Settings from "./settings";
const { View, Button } = General;

let unpatches: (() => void)[] = [];

export default {
    onLoad: () => {
        storage.showRPCButtons ??= true;

        if (!storage.showRPCButtons) return;

        const UserProfileContent = findByTypeName("UserProfileContent");
        const UserStore = findByStoreName("UserStore");
        const me = UserStore.getCurrentUser();

        unpatches.push(
            patcher.after("type", UserProfileContent, (args, res) => {
                const user = args[0]?.user;
                if (!user || user.id !== me.id) return res;

                const primaryInfo = res.props.children.find(
                    (c: any) => c?.type?.name === "PrimaryInfo"
                );
                if (!primaryInfo || primaryInfo._rpcButtonsPatched) return res;

                primaryInfo._rpcButtonsPatched = true;

                primaryInfo.props.children.push(
                    <View
                        key="RPCButtons"
                        style={{
                            flexDirection: "row",
                            justifyContent: "flex-start",
                            marginTop: 8
                        }}
                    >
                        <Button
                            label="RPC 1"
                            onPress={() => createRPC("action1")}
                        />
                        <Button
                            label="RPC 2"
                            onPress={() => createRPC("action2")}
                        />
                    </View>
                );

                return res;
            })
        );
    },
    onUnload: () => {
        unpatches.forEach(u => u());
    },
    settings: Settings
};
