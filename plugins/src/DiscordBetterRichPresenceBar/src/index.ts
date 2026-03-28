import { patcher } from "@vendetta";
import { findByProps, findByStoreName, findByTypeName } from "@vendetta/metro";
import { storage } from "@vendetta/plugin";
import React from "react";
import Settings from "./settings";
import StatusIcons from "./StatusIcons";
import { findInReactTree } from "@vendetta/utils";
import { General } from "@vendetta/ui/components";

const { View } = General;

let unpatches: (() => void)[] = [];

export default {
  onLoad: () => {
    storage.profileRichPresence ??= true;
    storage.profileUsername ??= true;

    const PresenceStore = findByStoreName("PresenceStore");
    const UserProfileContent = findByTypeName("UserProfileContent");

    if (UserProfileContent) {
      unpatches.push(
        patcher.after("type", UserProfileContent, (_, res) => {
          if (!storage.profileRichPresence) return;

          const primaryInfo = findInReactTree(res, (c) => c?.type?.name === "PrimaryInfo");
          if (!primaryInfo) return;

          patcher.after("type", primaryInfo, (_, resPrimary) => {
            if (!resPrimary?.type?.name.includes("UserProfilePrimaryInfo")) return;

            const richPresenceComp = findInReactTree(resPrimary, (c) => c?.type?.name === "UserProfileRichPresence");
            const displayNameComp = findInReactTree(resPrimary, (c) => c?.type?.name === "DisplayName");

            let userId = null;
            if (displayNameComp?.props?.user?.id) userId = displayNameComp.props.user.id;

            if (!userId) return;

            if (richPresenceComp) {
              // Patch rich presence buttons and container
              patcher.after("type", richPresenceComp.type, (_, resRich) => {
                const buttonsContainer = findInReactTree(resRich, (c) => c?.props?.buttons);
                if (buttonsContainer) {
                  // Ensure all buttons are rendered (pass original props)
                  resRich.props.buttons = richPresenceComp.props.buttons;
                }

                // Add your StatusIcons next to rich presence
                if (!findInReactTree(resRich, (c) => c.key === "UserProfileStatusIcons")) {
                  resRich.props.children = (
                    <View style={{ flexDirection: "row" }}>
                      {resRich.props.children}
                      <View key="UserProfileStatusIcons">
                        <StatusIcons userId={userId} />
                      </View>
                    </View>
                  );
                }

                return resRich;
              });
            } else if (displayNameComp && !findInReactTree(displayNameComp, (c) => c.key === "UserProfileStatusIcons")) {
              // Fallback if rich presence component doesn't exist yet
              displayNameComp.props.children.push(
                <View key="UserProfileStatusIcons">
                  <StatusIcons userId={userId} />
                </View>
              );
            }
          });
        })
      );
    }
  },

  onUnload: () => {
    unpatches.forEach((u) => u());
    unpatches = [];
  },

  settings: () => <Settings />,
};
