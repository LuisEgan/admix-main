import { SET_LOADING, ASYNC_ERROR, RESET_ASYNC } from "../actions/asyncActions";

const initialState = {
  asyncLoading: false,
  asyncError: null,
  asyncMessage: null,
};

const actionsMap = {
  [RESET_ASYNC]: () => {
    return { ...initialState };
  },

  [SET_LOADING]: (state, action) => {
    const { asyncLoading } = action;
    let asyncError, asyncMessage;

    if (asyncLoading) {
      asyncError = null;
      asyncMessage = null;
    } else {
      asyncError = state.asyncLoading;
      asyncMessage = state.asyncMessage;
    }

    return { ...state, asyncLoading, asyncError, asyncMessage };
  },

  [ASYNC_ERROR]: (state, action) => {
    const { asyncError } = action;
    const asyncLoading = false;

    return { ...state, asyncLoading, asyncError };
  },
};

const reducer = (state = initialState, action = {}) => {
  const fn = actionsMap[action.type];
  return fn ? fn(state, action) : state;
};

export default reducer;
