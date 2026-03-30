import { patcher } from "@vendetta";
import { findByDisplayName, findByName, findByProps, findByPropsAll, findByStoreName, findByTypeNameAll, findByTypeName } from "@vendetta/metro";
import { General } from "@vendetta/ui/components";
import { findInReactTree } from "@vendetta/utils";
import StatusIcons from "./StatusIcons";
import { storage } from "@vendetta/plugin";
import PresenceUpdatedContainer from "./PresenceUpdatedContainer";
import React from "react";

const { Text, View } = General;

let unpatches: Function[] = [];

export default {
    onLoad: () => {
        storage.dmTopBar ??= true;
        storage.userList ??= true;
        storage.profileUsername ??= true;
        storage.removeDefaultMobile ??= true;
        storage.oldUserListIcons ??= false;

        const debugLabels = false;

        // --- PATCH: Profile Content ---
        const UserProfileContent = findByTypeName("UserProfileContent");
        if (UserProfileContent) {
            unpatches.push(patcher.after("type", UserProfileContent, (_, res) => {
                const primaryInfo = findInReactTree(res, c => c?.type?.name === "PrimaryInfo");
                if (!primaryInfo) return res;

                patcher.after("type", primaryInfo, (_, primaryRes) => {
                    const displayName = findInReactTree(primaryRes, c => c?.type?.name === "DisplayName");
                    if (!displayName) return primaryRes;

                    patcher.after("type", displayName, (args, displayRes) => {
                        const userId = args[0]?.user
