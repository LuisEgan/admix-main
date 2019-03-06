import { RESET_STATE_BY_KEY } from "./actions";

const resetKey = keys => ({
  type: RESET_STATE_BY_KEY,
  keys,
});

export default {
  resetKey,
};
