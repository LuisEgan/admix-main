import { Map } from "immutable";

import { SET_LOADING, ASYNC_ERROR, RESET_ASYNC } from "../actions/asyncActions";

const initialStateValues = {
  asyncLoading: false,
  asyncError: null,
  asyncMessage: null,
};

export const initialState = Map({ ...initialStateValues });

const actionsMap = {
  [SET_LOADING]: (state, action) => {
    const { asyncLoading } = action;
    let asyncError, asyncMessage;

    if (asyncLoading) {
      asyncError = false;
      asyncMessage = null;
    } else {
      asyncError = state.asyncLoading;
      asyncMessage = state.asyncMessage;
    }

    return state.merge(Map({ asyncLoading, asyncError, asyncMessage }));
  },
  [ASYNC_ERROR]: (state, action) => {
    console.log('state: ', state);
    const { asyncError } = action;
    const isLoggedIn = state.app.get("isLoggedIn");
    console.log("isLoggedIn: ", isLoggedIn);

    const isSnackBarOpen = isLoggedIn;

    const asyncLoading = false;
    return state.merge(
      Map({
        asyncLoading,
        asyncError,
        isSnackBarOpen,
      }),
    );
  },

  [RESET_ASYNC]: state => {
    const asyncError = null;
    const asyncMessage = null;
    const asyncLoading = false;
    return state.merge(
      Map({
        asyncError,
        asyncMessage,
        asyncLoading,
      }),
    );
  },
};

const reducer = (state = initialState, action = {}) => {
  const fn = actionsMap[action.type];
  return fn ? fn(state, action) : state;
};

export default reducer;
