import api from "../api";

export const ACTION = "ACTION";

export const ACTION_START = "ACTION_START";
export const ACTION_ERROR = "ACTION_ERROR";
export const ACTION_SUCCESS = "ACTION_SUCCESS";

export const REGISTER_REQUEST = "USERS_REGISTER_REQUEST",
      REGISTER_SUCCESS = "USERS_REGISTER_SUCCESS",
      REGISTER_FAILURE = "USERS_REGISTER_FAILURE",
      RESET_ASYNC = "RESET_ASYNC",
      LOGIN_REQUEST = "USERS_LOGIN_REQUEST",
      LOGIN_SUCCESS = "USERS_LOGIN_SUCCESS",
      LOGOUT_SUCCESS = "USERS_LOGOUT_SUCCESS",
      LOGIN_FAILURE = "USERS_LOGIN_FAILURE",
      FORGOT_PASS = "USERS_FORGOT_PASS",
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
      SET_PLACEMENTS_BY_APP = "SET_PLACEMENTS_BY_APP",
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
      PERSIST_REHYDRATE = "persist/REHYDRATE";

// Test action

export function action() {
      return {
            type: ACTION
      };
}

export function load_webgl() {
      return {
            type: LOADED_WEBGL_SCRIPTS
      };
}

// Async action example

function asyncStart() {
      return {
            type: ACTION_START
      };
}

function asyncSuccess(data) {
      return {
            type: ACTION_SUCCESS,
            data
      };
}

const asyncError = data => ({
      type: ACTION_ERROR,
      data
});

export const resetAsync = () => ({
      type: RESET_ASYNC
});

const doLogin = data => {
      if (data.status) {
            return {
                  type: LOGIN_SUCCESS,
                  data
            };
      } else {
            return asyncError(data);
      }
};

export function logout() {
      return {
            type: LOGOUT_SUCCESS
      };
}

function doSignup(data) {
      if (data.status) {
            return {
                  type: REGISTER_SUCCESS,
                  data
            };
      } else {
            return asyncError(data);
      }
}

function doForgotPass(data) {
      if (data.status) {
            return {
                  type: FORGOT_PASS,
                  data
            };
      } else {
            return asyncError(data);
      }
}

function dochangeEmail(data) {
      if (data.status) {
            return {
                  type: CHANGE_EMAIL,
                  data
            };
      } else {
            return asyncError(data);
      }
}


function doSetPassword(data) {
      if (data.status) {
            return {
                  type: SET_PASS,
                  data
            };
      } else {
            return asyncError(data);
      }
}

function doSetEmail(data) {
      if (data.status) {
            return {
                  type: SET_NEW_EMAIL,
                  data
            };
      } else {
            return asyncError(data);
      }
}

function showApps(data) {
      if (data.status) {
            return {
                  type: APPS_SUCCESS,
                  data
            };
      } else {
            return asyncError(data);
      }
}

const doSelectApp = (appId, data) => {
      data.appId = appId;
      if (data.status) {
            return {
                  type: SELECT_APP,
                  data
            };
      } else {
            return asyncError(data);
      }
};

const doUpdateApp = data => {
      if (data.status) {
            return {
                  type: UPDATE_APP,
                  data
            };
      } else {
            return asyncError(data);
      }
};


export const resetSelectedApp = () => ({
      type: RESET_SELECTED_APP
});

export const savedApp = app => ({
      type: SAVE_APP,
      app
});

export const placement = placementOpt => ({
      type: SET_PLACEMENT,
      placementOpt
});

const setPlacements = data => {
      if (data.status) {
            return {
                  type: SET_PLACEMENTS,
                  data
            };
      } else {
            return asyncError(data);
      }
};

const setPlacementsByApp = data => {
      if (data.status) {
            return {
                  type: SET_PLACEMENTS_BY_APP,
                  data
            };
      } else {
            return asyncError(data);
      }
};

export const saveInputs = toSaveInputs => ({
      type: SAVE_INPUTS,
      toSaveInputs
});

export const resetSavedInputs = () => ({
      type: RESET_SAVED_INPUTS
});

const showUserData = data => {
      if (data.status) {
            return {
                  type: USER_DATA_SUCCESS,
                  data
            };
      } else {
            return asyncError(data);
      }
};

const doToggleAppStatus = data => {
      if (data.status) {
            return {
                  type: TOGGLE_APP_STATUS,
                  data
            };
      } else {
            return asyncError(data);
      }
};

const pushPlacements = data => {
      if (data.status) {
            return {
                  type: UPDATE_PLACEMENTS,
                  data
            };
      } else {
            return asyncError(data);
      }
};

const sendReportData = data => {
      return {
            type: REPORT_DATA,
            data
      };
};

export const setUserImgURL = data => ({
      type: SET_USER_IMG_URL,
      data
});

const imgUploadRes = data => ({
      type: USER_IMG_UPLOAD,
      data
});

export const snackbarToggle = () => ({
      type: SNACKBAR_TOGGLE
})

const updateUserRes = (data) => {
      if (data.status) {
            return {
                  type: UPDATE_USER,
                  data
            };
      } else {
            return asyncError(data);
      }
}

export const setAppsFilterBy = data => {
      return {
            type: SET_APPS_FILTER_BY,
            data
      };
}

// FETCH =============================================

export function async () {
      return function (dispatch) {
            dispatch(asyncStart());

            api
                  .async()
                  .then(data => dispatch(asyncSuccess(data)))
                  .catch(error => dispatch(asyncError(error)));
      };
}

export function login(email, password) {
      return function (dispatch) {
            dispatch(asyncStart());
            var data = {
                  username: email,
                  password: password
            };
            api
                  .login(data)
                  .then(data => dispatch(doLogin(data)))
                  .catch(error => dispatch(asyncError(error)));
      };
}

export function signup(name, email, password) {
      return function (dispatch) {
            dispatch(asyncStart());
            var data = {
                  email,
                  password,
                  name
            };
            api
                  .signup(data)
                  .then(data => dispatch(doSignup(data)))
                  .catch(error => dispatch(asyncError(error)));
      };
}

export const resendSignUpEmail = ({
      userEmail,
      userName
}) => dispatch => {
      dispatch(asyncStart());

      const data = {
            userEmail,
            userName
      };
      api
            .resendSignUpEmail(data)
            .then(data => dispatch(doSignup(data)))
            .catch(error => dispatch(asyncError(error)));
};



export const forgotPass = email => dispatch => {
      dispatch(asyncStart());

      const data = {
            email
      };
      api
            .forgotPass(data)
            .then(data => dispatch(doForgotPass(data)))
            .catch(error => dispatch(asyncError(error)));
};

export const changeEmail = (email, accessToken) => dispatch => {
      dispatch(asyncStart());

      const data = {
            email
      };
      api
            .changeEmail(accessToken, data)
            .then(data => dispatch(dochangeEmail(data)))
            .catch(error => dispatch(asyncError(error)));
};

export const setNewPass = ({
      token,
      userId,
      newPass
}) => dispatch => {
      dispatch(asyncStart());

      const data = {
            token,
            userId,
            newPass
      };
      api
            .setNewPass(data)
            .then(res => dispatch(doSetPassword(res)))
            .catch(error => dispatch(asyncError(error)));
};

export const setNewEmail = ({
      token,
      userId,
      newEmail
}) => dispatch => {
      dispatch(asyncStart());

      const data = {
            token,
            userId,
            newEmail
      };
      api
            .setNewEmail(data)
            .then(res => dispatch(doSetEmail(res)))
            .catch(error => dispatch(asyncError(error)));
};

export const getApps = ({
      accessToken,
      filterBy,
      adminToken
}) => dispatch => {
      dispatch(asyncStart());

      const data = {
            filterBy: filterBy || []
      };

      if (!adminToken) {
            api
                  .getApps(accessToken, data)
                  .then(data => dispatch(showApps(data)))
                  .catch(error => dispatch(asyncError(error)));
      } else {
            api
                  .getAppsAdmin(accessToken, adminToken, data)
                  .then(data => dispatch(showApps(data)))
                  .catch(error => dispatch(asyncError(error)));
      }

};

export const getUserData = accessToken => dispatch => {
      dispatch(asyncStart());

      api
            .getUserData(accessToken)
            .then(data => dispatch(showUserData(data)))
            .catch(error => dispatch(asyncError(error)));
};

export const toggleAppStatus = (appDetails, accessToken) => dispatch => {
      dispatch(asyncStart());

      api
            .toggleAppStatus(accessToken, appDetails)
            .then(data => {
                  dispatch(doToggleAppStatus(data));
            })
            .catch(error => dispatch(asyncError(error)));
};

export const imgUpload = (imgPath, userId, accessToken) => dispatch => {
      dispatch(asyncStart());

      const data = {
            imgPath,
            userId
      };

      api
            .cloudinayImgUpload(accessToken, data)
            .then(data => {
                  dispatch(imgUploadRes(data));

                  // update userData.cloudinaryURL from db
                  dispatch(getUserData(accessToken));
            })
            .catch(error => {
                  dispatch(asyncError(error))
            });

};

export const fetchUserImgURL = (imgURL, accessToken) => dispatch => {
      dispatch(asyncStart());

      dispatch(setUserImgURL(imgURL));
};

export const updateUser = (userId, update, accessToken) => dispatch => {
      dispatch(asyncStart());

      const data = {
            userId,
            update
      }

      api
            .updateUser(accessToken, data)
            .then(data => {
                  dispatch(updateUserRes(data));
                  if (data.status) {
                        dispatch(getUserData(accessToken));
                  }
            })
            .catch(error => {
                  dispatch(asyncError(error))
            });

}

// APPS =============================================

export const selectApp = (appId, accessToken) => dispatch => {
      dispatch(asyncStart());

      const data = {
            appId
      };

      api
            .getScenes(accessToken, data)
            .then(res => dispatch(doSelectApp(appId, res)))
            .catch(error => dispatch(asyncError(error)));
};

export const updateApp = (appData, accessToken) => dispatch => {
      dispatch(asyncStart());

      api
            .updateApp(accessToken, appData)
            .then(res => dispatch(doUpdateApp(res)))
            .catch(error => dispatch(asyncError(error)));
};

export const getPlacements = (appId, sceneId, accessToken) => dispatch => {
      dispatch(asyncStart());
      const data = {
            appId,
            sceneId
      };

      api
            .getPlacements(accessToken, data)
            .then(res => dispatch(setPlacements(res)))
            .catch(error => dispatch(asyncError(error)));
};

export const getPlacementsByApp = (appId, accessToken) => dispatch => {
      dispatch(asyncStart());
      const data = {
            appId
      };

      api
            .getPlacements(accessToken, data)
            .then(res => dispatch(setPlacementsByApp(res)))
            .catch(error => dispatch(asyncError(error)));
};

export const updatePlacements = ({
      accessToken,
      data,
      adminToken
}) => dispatch => {
      dispatch(asyncStart());

      if (!adminToken) {
            console.log('data: ', data);
            api
                  .updatePlacements(accessToken, data)
                  .then(res => dispatch(pushPlacements(res)))
                  .catch(error => dispatch(asyncError(error)));
      } else {
            api
                  .updatePlacementsAdmin(accessToken, adminToken, data)
                  .then(data => dispatch(showApps(data)))
                  .catch(error => dispatch(asyncError(error)));
      }

};

// REPORT =============================================

export const getReportData = ({
      isAdmin,
      appsIds,
      accessToken,
      publisherId
}) => dispatch => {
      dispatch(asyncStart());

      const currentDate = new Date();

      const data = {
            startDate: {
                  year: 2018,
                  month: 1,
                  day: 1
            },
            endDate: {
                  year: currentDate.getFullYear(),
                  month: currentDate.getMonth(),
                  day: currentDate.getDate()
            },
            publisherId
      }

      console.log('data: ', data);
      api
            .getReportData(accessToken, data)
            .then(res => {
                  dispatch(sendReportData(res))
            })
            .catch(error => {
                  console.log('error: ', error);
                  dispatch(asyncError(error))
            });

      // const reportData = api.getReportData(appsIds);
      // dispatch(sendReportData(reportData));
};

export const setInitialReportApp = appId => dispatch => {
      dispatch({
            type: SET_INITIAL_REPORT_APP,
            data: appId
      });
};