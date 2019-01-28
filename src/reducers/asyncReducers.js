import {
  SET_LOADING,
  ASYNC_ERROR,
  ASYNC_MESSAGE,
  RESET_ASYNC,
} from "../actions/asyncActions";
import C from "../utils/constants";

const initialState = {
  asyncLoading: null,
  asyncError: null,
  asyncMessage: null,
};

const actionsMap = {
  [RESET_ASYNC]: () => {
    return { ...initialState };
  },

  [SET_LOADING]: (state, action) => {
    let { asyncLoading } = action;
    let asyncError, asyncMessage;

    if (asyncLoading) {
      asyncError = null;
      asyncMessage = null;
      asyncLoading = "Loading..."
    } else {
      asyncError = state.asyncError;
      asyncMessage = state.asyncMessage;
    }

    return { ...state, asyncLoading, asyncError, asyncMessage };
  },

  [ASYNC_ERROR]: (state, action) => {
    let { asyncError } = action;
    asyncError = typeof asyncError === "object" ? C.ERRORS.error : asyncError;

    return { ...initialState, asyncError };
  },

  [ASYNC_MESSAGE]: (state, action) => {
    const { asyncMessage } = action;

    return { ...initialState, asyncMessage };
  },
};

const reducer = (state = initialState, action = {}) => {
  const fn = actionsMap[action.type];
  return fn ? fn(state, action) : state;
};

export default reducer;
