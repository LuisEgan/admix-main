export const SET_LOADING = `SET_LOADING`,
  ASYNC_ERROR = `ASYNC_ERROR`,
  RESET_ASYNC = `RESET_ASYNC`;

export const setAsyncLoading = asyncLoading => ({
  type: SET_LOADING,
  asyncLoading,
});

export const setAsyncError = asyncError => ({
  type: ASYNC_ERROR,
  asyncError,
});

export const resetAsync = () => ({
  type: RESET_ASYNC,
});
