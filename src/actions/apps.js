import api from "../api";
import {
  setAsyncError,
  setAsyncLoading,
  setAsyncMessage,
} from "./asyncActions";
import {
  LOGOUT_SUCCESS,
  RESET_SELECTED_APP,
  RESET_SAVED_INPUTS,
  SET_APPS_FILTER_BY,
  SELECT_APP,
  UPDATE_APP,
  APPS_SUCCESS,
  TOGGLE_APP_STATUS,
  SAVE_INPUTS,
} from "./actions";
import C from "../utils/constants";

const resetSelectedApp = () => ({
  type: RESET_SELECTED_APP,
});

const resetSavedInputs = () => ({
  type: RESET_SAVED_INPUTS,
});

const setAppsFilterBy = data => {
  return {
    type: SET_APPS_FILTER_BY,
    data,
  };
};

const logout = () => ({
  type: LOGOUT_SUCCESS,
});

const saveInputs = toSaveInputs => ({
  type: SAVE_INPUTS,
  toSaveInputs,
});

// * FETCH

const getApps = ({ accessToken, filterBy, adminToken }) => async dispatch => {
  dispatch(setAsyncLoading(true));
  const data = {
    filterBy: filterBy || [],
  };

  try {
    const res = !adminToken
      ? await api.getApps(accessToken, data)
      : await api.getAppsAdmin(accessToken, adminToken, data);
    if (!res.status) throw res.message;

    dispatch({
      type: APPS_SUCCESS,
      data: res,
    });
    dispatch(setAsyncLoading(false));
  } catch (error) {
    console.log("error: ", error);
    dispatch(setAsyncError(error));
  }
};

const toggleAppStatus = (appDetails, accessToken) => async dispatch => {
  dispatch(setAsyncLoading(true));

  try {
    const res = await api.toggleAppStatus(accessToken, appDetails);

    dispatch({
      type: TOGGLE_APP_STATUS,
      data: res,
    });
    dispatch(setAsyncMessage(C.SUCCESS.appUpdated));
    dispatch(setAsyncLoading(false));
  } catch (error) {
    console.log("error: ", error);
    dispatch(setAsyncError(error));
  }
};

const selectApp = (appId, accessToken) => async dispatch => {
  dispatch(setAsyncLoading(true));
  try {
    const res = await api.getScenes(accessToken, appId);
    console.log('res: ', res);
    if (!res.status) throw res.message;

    const data = { appId, ...res };
    dispatch({
      type: SELECT_APP,
      data,
    });
    dispatch(setAsyncLoading(false));
  } catch (error) {
    console.log("error: ", error);
    dispatch(setAsyncError(error));
  }
};

const updateApp = ({ appData, accessToken, adminToken }) => async dispatch => {
  dispatch(setAsyncLoading(true));
  const { appId, ...newData } = appData;
  const data = {
    appId,
    newData,
  };

  try {
    const res = await api.updateApp(accessToken, data);
    if (!res.status) throw res.message;

    const resApps = adminToken
      ? await api.getAppsAdmin(accessToken, adminToken)
      : await api.getApps(accessToken);
    if (!resApps.status) throw res.message;

    dispatch(getApps({ accessToken }));
    dispatch(selectApp(appId, accessToken));
    dispatch({
      type: UPDATE_APP,
      data: resApps,
    });

    dispatch(setAsyncMessage(C.SUCCESS.appUpdated));
    dispatch(setAsyncLoading(false));
  } catch (error) {
    console.log("error: ", error);
    dispatch(setAsyncError(error));
  }
};

export default {
  saveInputs,
  logout,
  setAppsFilterBy,
  resetSavedInputs,
  resetSelectedApp,
  getApps,
  toggleAppStatus,
  selectApp,
  updateApp,
};
