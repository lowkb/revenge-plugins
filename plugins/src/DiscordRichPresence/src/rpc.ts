import { FluxDispatcher } from "@vendetta/metro/common";
import type { Activity } from "./types";

export const sendRPC = (activity: Activity, pid = 1608, socketId = "rpc") => {
    
  FluxDispatcher.dispatch(
    { 
      type: "LOCAL_ACTIVITY_UPDATE", 
      pid, 
      socketId, 
      activity 
    }
  );
  logger.log("send" + activity);
};
