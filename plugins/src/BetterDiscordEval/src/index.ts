import EvalView from "./EvalView";
import { runEval } from "./Eval";
import { logger } from "@vendetta";

export default {
  onLoad() {
    logger.log("runEval");
    runEval();
  },

  onUnload() {
    // Nothing special to unload
  },

  // Opcjonalnie expose stronę jeśli będziesz chciał używać np. w menu
  View: EvalView,
  logger.log("evalview");
};
