import api from "../api";
import _a from "../utils/analytics";
import {
  setAsyncError,
  setAsyncLoading,
  setAsyncMessage,
} from "./asyncActions";
import C from "../utils/constants";

export const REGISTER_REQUEST = "USERS_REGISTER_REQUEST",
  REGISTER_SUCCESS = "USERS_REGISTER_SUCCESS",
  REGISTER_FAILURE = "USERS_REGISTER_FAILURE",
  RESET_ASYNC = "RESET_ASYNC",
  LOGIN_REQUEST = "USERS_LOGIN_REQUEST",
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGOUT_SUCCESS = "USERS_LOGOUT_SUCCESS",
  LOGIN_FAILURE = "USERS_LOGIN_FAILURE",
  CHANGE_EMAIL = "USERS_CHANGE_EMAIL",
  SET_PASS = "USERS_SET_PASS",
  SET_NEW_EMAIL = "USERS_SET_NEW_EMAIL",
  LOGOUT = "USERS_LOGOUT",
  APPS_SUCCESS = "USERS_APPS_SUCCESS",
  APPS_ERROR = "USERS_APPS_SUCCESS_FAILURE",
  SELECT_APP = "SELECT_APP",
  UPDATE_APP = "UPDATE_APP",
  RESET_SELECTED_APP = "RESET_SELECTED_APP",
  SAVE_APP = "SAVE_APP",
  SET_PLACEMENT = "SET_PLACEMENT",
  SET_PLACEMENTS = "SET_PLACEMENTS",
  SET_PLACEMENTS_BY_ID = "SET_PLACEMENTS_BY_ID",
  SAVE_INPUTS = "SAVE_INPUTS",
  RESET_SAVED_INPUTS = "RESET_SAVED_INPUTS",
  TOGGLE_APP_STATUS = "TOGGLE_APP_STATUS",
  UPDATE_PLACEMENTS = "UPDATE_PLACEMENTS",
  UPDATE_USER = "UPDATE_USER",
  USER_DATA_SUCCESS = "USER_DATA_SUCCESS",
  LOADED_WEBGL_SCRIPTS = "LOADED_WEBGL_SCRIPTS",
  REPORT_DATA = "REPORT_DATA",
  SET_INITIAL_REPORT_APP = "SET_INITIAL_REPORT_APP",
  SET_USER_IMG_URL = "SET_USER_IMG_URL",
  USER_IMG_UPLOAD = "USER_IMG_UPLOAD",
  SNACKBAR_TOGGLE = "SNACKBAR_TOGGLE",
  SET_APPS_FILTER_BY = "SET_APPS_FILTER_BY",
  SET_LOADED_SCENE = "SET_LOADED_SCENE",
  PERSIST_REHYDRATE = "persist/REHYDRATE";

export function logout() {
  return {
    type: LOGOUT_SUCCESS,
  };
}

function dochangeEmail(data) {
  if (data.status) {
    return {
      type: CHANGE_EMAIL,
      data,
    };
  }
}

function doSetPassword(data) {
  if (data.status) {
    return {
      type: SET_PASS,
      data,
    };
  }
}

function doSetEmail(data) {
  if (data.status) {
    return {
      type: SET_NEW_EMAIL,
      data,
    };
  }
}

const doSelectApp = (appId, data) => {
  data.appId = appId;
  if (data.status) {
    return {
      type: SELECT_APP,
      data,
    };
  }
};

const doUpdateApp = data => {
  if (data.status) {
    return {
      type: UPDATE_APP,
      data,
    };
  }
};

export const resetSelectedApp = () => ({
  type: RESET_SELECTED_APP,
});

export const savedApp = app => ({
  type: SAVE_APP,
  app,
});

export const placement = placementOpt => ({
  type: SET_PLACEMENT,
  placementOpt,
});

const setPlacements = data => {
  if (data.status) {
    return {
      type: SET_PLACEMENTS,
      data,
    };
  }
};

const setplacementsByAppId = data => {
  if (data.status) {
    return {
      type: SET_PLACEMENTS_BY_ID,
      data,
    };
  }
};

export const saveInputs = toSaveInputs => ({
  type: SAVE_INPUTS,
  toSaveInputs,
});

export const resetSavedInputs = () => ({
  type: RESET_SAVED_INPUTS,
});

const showUserData = data => {
  if (data.status) {
    return {
      type: USER_DATA_SUCCESS,
      data,
    };
  }
};

const pushPlacements = data => {
  if (data.status) {
    return {
      type: UPDATE_PLACEMENTS,
      data,
    };
  }
};

const sendReportData = data => {
  return {
    type: REPORT_DATA,
    data,
  };
};

export const setUserImgURL = data => ({
  type: SET_USER_IMG_URL,
  data,
});

const imgUploadRes = data => ({
  type: USER_IMG_UPLOAD,
  data,
});

export const snackbarToggle = () => ({
  type: SNACKBAR_TOGGLE,
});

const updateUserRes = data => {
  if (data.status) {
    return {
      type: UPDATE_USER,
      data,
    };
  }
};

export const setAppsFilterBy = data => {
  return {
    type: SET_APPS_FILTER_BY,
    data,
  };
};

export const setLoadedScene = loadedScene => ({
  type: SET_LOADED_SCENE,
  loadedScene,
});

// FETCH =============================================

export const login = (username, password) => async dispatch => {
  dispatch(setAsyncLoading(true));

  const data = {
    username,
    password,
  };

  try {
    const loginRes = await api.login(data);
    if (!loginRes.status) throw C.ERRORS.failedLogin;

    const userRes = await api.getUserData(loginRes.data.loginToken);
    if (!userRes.status) throw C.ERRORS.failedLogin;

    const userData = { ...loginRes.data, ...userRes.data };
    const userId = userData._id;
    if (userId && window.analytics) {
      const traits = {
        name: userData.name,
        email: userData.email.value,
        companyName: userData.companyName,
      };
      _a.identify(userId, traits, {}, () => {
        _a.track(_a.events.account.loggedIn);
      });
      dispatch({
        type: LOGIN_SUCCESS,
        data: userData,
      });
    } else {
      window.analytics && _a.track(_a.events.account.failedLogin);
      dispatch({
        type: LOGIN_SUCCESS,
        data: userData,
      });
    }

    dispatch(setAsyncLoading(false));
  } catch (error) {
    console.error("error: ", error);
    dispatch(setAsyncError(error));
  }
};

export const register = (name, email, password) => async dispatch => {
  dispatch(setAsyncLoading(true));
  const data = {
    email,
    password,
    name,
  };

  try {
    const res = await api.register(data);
    if (res.status) {
      _a.track(_a.events.account.created);
    } else {
      _a.track(_a.events.account.createdFailed);
      throw res.message;
    }

    dispatch({
      type: REGISTER_SUCCESS,
      data: res,
    });
    dispatch(setAsyncMessage(C.SUCCESS.emailSent));
    dispatch(setAsyncLoading(false));
  } catch (error) {
    console.error("error: ", error);
    const correct =
      typeof error !== "object"
        ? error.indexOf("duplicate") >= 0
          ? C.ERRORS.userExists
          : error
        : error;
    dispatch(setAsyncError(correct));
  }
};

export const resendSignUpEmail = ({ userEmail, userName }) => dispatch => {
  // const data = {
  //   userEmail,
  //   userName,
  // };
  // api
  //   .resendSignUpEmail(data)
  //   .then(data => dispatch(doSignup(data)))
  //   .catch(error => dispatch(setAsyncError(error)));
};

export const forgotPass = userEmail => async dispatch => {
  dispatch(setAsyncLoading(true));
  const data = {
    userEmail,
  };

  try {
    const res = await api.forgotPass(data);
    if (!res.status) throw res.message;

    dispatch(setAsyncMessage(C.SUCCESS.emailSent));
  } catch (error) {
    console.error("error: ", error);
    dispatch(setAsyncError(error));
  }
};

export const changeEmail = (email, accessToken) => async dispatch => {
  dispatch(setAsyncLoading(true));
  const data = {
    email,
  };

  try {
    const res = await api.changeEmail(accessToken, data);
    if (!res.status) throw res.message;

    dispatch(setAsyncMessage(C.SUCCESS.emailSent));
  } catch (error) {
    console.error("error: ", error);
    dispatch(setAsyncError(error));
  }
};

export const setNewPass = ({ token, userId, newPass }) => async dispatch => {
  dispatch(setAsyncLoading(true));
  const data = {
    token,
    userId,
    newPass,
  };

  try {
    const res = await api.setNewPass(data);
    if (!res.status) throw res.message;

    dispatch(setAsyncMessage(C.SUCCESS.emailSent));
  } catch (error) {
    console.error("error: ", error);
    dispatch(setAsyncError(error));
  }

  // api
  //   .setNewPass(data)
  //   .then(res => dispatch(doSetPassword(res)))
  //   .catch(error => dispatch(setAsyncError(error)));
};

export const setNewEmail = ({ token, userId, newEmail }) => async dispatch => {
  dispatch(setAsyncLoading(true));
  const data = {
    token,
    userId,
    newEmail,
  };

  try {
    const res = await api.setNewEmail(data);
    if (!res.status) throw res.message;

    dispatch(setAsyncMessage(C.SUCCESS.emailSent));
  } catch (error) {
    console.log("error: ", error);
    dispatch(setAsyncError(error));
  }

  // api
  //   .setNewEmail(data)
  //   .then(res => dispatch(doSetEmail(res)))
  //   .catch(error => dispatch(setAsyncError(error)));
};

export const getApps = ({
  accessToken,
  filterBy,
  adminToken,
}) => async dispatch => {
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

export const getUserData = accessToken => dispatch => {
  api
    .getUserData(accessToken)
    .then(data => dispatch(showUserData(data)))
    .catch(error => dispatch(setAsyncError(error)));
};

export const toggleAppStatus = (appDetails, accessToken) => async dispatch => {
  dispatch(setAsyncLoading(true));

  try {
    const res = await api.toggleAppStatus(accessToken, appDetails);

    dispatch({
      type: TOGGLE_APP_STATUS,
      data: res,
    });
    dispatch(setAsyncLoading(false));
  } catch (error) {
    console.log("error: ", error);
    dispatch(setAsyncError(error));
  }
};

export const imgUpload = (imgPath, userId, accessToken) => dispatch => {
  const data = {
    imgPath,
    userId,
  };

  api
    .cloudinayImgUpload(accessToken, data)
    .then(data => {
      dispatch(imgUploadRes(data));

      // update userData.cloudinaryURL from db
      dispatch(getUserData(accessToken));
    })
    .catch(error => {
      dispatch(setAsyncError(error));
    });
};

export const fetchUserImgURL = (imgURL, accessToken) => dispatch => {
  dispatch(setUserImgURL(imgURL));
};

export const updateUser = (userId, newData, accessToken) => dispatch => {
  const body = {
    userId,
    newData,
  };

  api
    .updateUser(accessToken, body)
    .then(data => {
      dispatch(updateUserRes(data));
      if (data.status) {
        dispatch(getUserData(accessToken));
      }
    })
    .catch(error => {
      dispatch(setAsyncError(error));
    });
};

// APPS =============================================

export const selectApp = (appId, accessToken) => dispatch => {
  const data = {
    appId,
  };

  api
    .getScenes(accessToken, data)
    .then(res => dispatch(doSelectApp(appId, res)))
    .catch(error => dispatch(setAsyncError(error)));
};

export const updateApp = ({
  appData,
  accessToken,
  adminToken,
}) => async dispatch => {
  api
    .updateApp(accessToken, appData)
    .then(() => {
      return adminToken
        ? api.getAppsAdmin(accessToken, adminToken)
        : api.getApps(accessToken);
    })
    .then(res => {
      dispatch(
        getApps({
          accessToken,
        }),
      );
      dispatch(selectApp(appData.appId, accessToken));
      dispatch(doUpdateApp(res));
    })
    .catch(error => dispatch(setAsyncError(error)));
};

export const getPlacements = (appId, sceneId, accessToken) => dispatch => {
  const data = {
    appId,
    sceneId,
  };

  api
    .getPlacements(accessToken, data)
    .then(res => dispatch(setPlacements(res)))
    .catch(error => dispatch(setAsyncError(error)));
};

export const getPlacementsByAppId = (appId, accessToken) => dispatch => {
  const data = {
    appId,
  };

  api
    .getPlacements(accessToken, data)
    .then(res => dispatch(setplacementsByAppId(res)))
    .catch(error => dispatch(setAsyncError(error)));
};

export const updatePlacements = ({
  accessToken,
  data,
  adminToken,
}) => dispatch => {
  if (!adminToken) {
    api
      .updatePlacements(accessToken, data)
      .then(res => dispatch(pushPlacements(res)))
      .catch(error => dispatch(setAsyncError(error)));
  } else {
    api
      .updatePlacementsAdmin(accessToken, adminToken, data)
      .then(data =>
        dispatch({
          type: APPS_SUCCESS,
          data,
        }),
      )
      .catch(error => dispatch(setAsyncError(error)));
  }
};

// REPORT =============================================

export const getReportData = ({
  appsIds,
  accessToken,
  publisherId,
}) => dispatch => {
  const currentDate = new Date();

  const data = {
    startDate: {
      year: 2018,
      month: 1,
      day: 1,
    },
    endDate: {
      year: currentDate.getFullYear(),
      month: currentDate.getMonth(),
      day: currentDate.getDate(),
    },
    publisherId,
  };

  api
    .getReportData(accessToken, data)
    .then(res => {
      dispatch(sendReportData(res));
    })
    .catch(error => {
      dispatch(setAsyncError(error));
    });

  // const reportData = api.getReportData(appsIds);
  // dispatch(sendReportData(reportData));
};

export const setInitialReportApp = appId => dispatch => {
  dispatch({
    type: SET_INITIAL_REPORT_APP,
    data: appId,
  });
};
