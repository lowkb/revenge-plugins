import { storage } from "@vendetta/plugin";
import { logger } from "@vendetta";

export const storageKey = "BetterDiscordEval";

export const storage = {
  code: ""
};

export async function runEval() {
  if (!storage.code) return;

  try {
    const result = await eval(storage.code);
    logger.log("[Eval Result]", result);
  } catch (err) {
    logger.error("[Eval Error]", err);
  }
}
