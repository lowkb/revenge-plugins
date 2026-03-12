import { FluxDispatcher } from "@vendetta/metro/common";
import { RPCActivity } from "./types";

export const sendRPC = (activity: RPCActivity, pid = 1608, socketId = "rpc") => {
  FluxDispatcher.dispatch({
    type: "LOCAL_ACTIVITY_UPDATE",
    pid,
    socketId,
    activity
  });
};
