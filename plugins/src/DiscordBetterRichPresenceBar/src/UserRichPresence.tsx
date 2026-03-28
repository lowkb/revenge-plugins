import React from "react";
import { General } from "@vendetta/ui/components";

const { View, Button } = General;

export default function UserRichPresence({ onRPC1, onRPC2 }: { onRPC1: () => void; onRPC2: () => void }) {
    return (
        <View
            key="RPCButtons"
            style={{
                flexDirection: "row",
                justifyContent: "flex-start",
                marginTop: 8
            }}
        >
            <Button label="RPC 1" onPress={onRPC1} />
            <Button label="RPC 2" onPress={onRPC2} />
        </View>
    );
}
