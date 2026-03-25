import EvalView from "./EvalView";
import { runEval } from "./Eval";

export default {
  onLoad() {
    // Auto-run code on load
    runEval();
  },

  onUnload() {
    // Nothing special to unload
  },

  // Opcjonalnie expose stronę jeśli będziesz chciał używać np. w menu
  View: EvalView,
};
