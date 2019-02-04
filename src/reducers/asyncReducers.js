import {
  SET_LOADING,
  ASYNC_ERROR,
  ASYNC_MESSAGE,
  RESET_ASYNC,
  TOGGLE_SNACKBAR
} from "../actions/asyncActions";
import C from "../utils/constants";

const initialState = {
  asyncLoading: null,
  asyncError: null,
  asyncMessage: null,
  isSnackBarOpen: false,
};

const actionsMap = {
  [RESET_ASYNC]: () => {
    return { ...initialState };
  },

  [TOGGLE_SNACKBAR]: state => {
    return { ...state, isSnackBarOpen: !state.isSnackBarOpen };
  },

  [SET_LOADING]: (state, action) => {
    let { asyncLoading } = action;
    let asyncError, asyncMessage;

    if (asyncLoading) {
      asyncError = null;
      asyncMessage = null;
      asyncLoading = "Loading...";
    } else {
      asyncError = state.asyncError;
      asyncMessage = state.asyncMessage;
    }

    return { ...state, asyncLoading, asyncError, asyncMessage };
  },

  [ASYNC_ERROR]: (state, action) => {
    let { asyncError } = action;
    asyncError = typeof asyncError !== "object" ? asyncError : C.ERRORS.error;
    asyncError = asyncError || C.ERRORS.error;

    return {
      ...initialState,
      asyncError,
      asyncMessage: asyncError,
      isSnackBarOpen: true,
    };
  },

  [ASYNC_MESSAGE]: (state, action) => {
    const { asyncMessage } = action;

    return { ...initialState, asyncMessage, isSnackBarOpen: true };
  },
};

const reducer = (state = initialState, action = {}) => {
  const fn = actionsMap[action.type];
  return fn ? fn(state, action) : state;
};

export default reducer;
