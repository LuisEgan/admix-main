export const SET_LOADING = `SET_LOADING`,
  ASYNC_ERROR = `ASYNC_ERROR`,
  ASYNC_MESSAGE = `ASYNC_MESSAGE`,
  RESET_ASYNC = `RESET_ASYNC`,
  TOGGLE_SNACKBAR = `TOGGLE_SNACKBAR`;

export const setAsyncLoading = asyncLoading => ({
  type: SET_LOADING,
  asyncLoading,
});

export const setAsyncError = asyncError => ({
  type: ASYNC_ERROR,
  asyncError,
});

export const setAsyncMessage = asyncMessage => ({
  type: ASYNC_MESSAGE,
  asyncMessage,
});

export const resetAsync = () => ({
  type: RESET_ASYNC,
});

export const toggleSnackbar = () => ({
  type: TOGGLE_SNACKBAR
})
