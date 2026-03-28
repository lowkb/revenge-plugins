import { before } from "@vendetta/patcher";
import { findByName } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";

export default () => {
    const UserProfileCard = findByName("UserProfileCard");
    if (!UserProfileCard) return;

    return before("render", UserProfileCard, (args, res) => {
        const original = res;

        // wyciągamy istniejące RPC (game/aktivność)
        const rpcWrapper = original?.props?.children?.[1]; 

        if (!rpcWrapper) return res;

        // tworzymy własne przyciski
        const buttons = (
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button onClick={() => console.log("Button 1 clicked")}>Action 1</button>
                <button onClick={() => console.log("Button 2 clicked")}>Action 2</button>
            </div>
        );

        // dodajemy buttons pod RPC
        rpcWrapper.props.children.push(buttons);

        return res;
    });
};
