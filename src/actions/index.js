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
   SET_PASS = "USERS_SET_PASS",
   LOGOUT = "USERS_LOGOUT",
   APPS_SUCCESS = "USERS_APPS_SUCCESS",
   APPS_ERROR = "USERS_APPS_SUCCESS_FAILURE",
   SELECT_APP = "SELECT_APP",
   RESET_SELECTED_APP = "RESET_SELECTED_APP",
   SAVE_APP = "SAVE_APP",
   SET_PLACEMENT = "SET_PLACEMENT",
   SET_PLACEMENTS = "SET_PLACEMENTS",
   SAVE_INPUTS = "SAVE_INPUTS",
   RESET_SAVED_INPUTS = "RESET_SAVED_INPUTS",
   TOGGLE_APP_STATUS = "TOGGLE_APP_STATUS",
   UPDATE_PLACEMENTS = "UPDATE_PLACEMENTS",
   USER_DATA_SUCCESS = "USER_DATA_SUCCESS",
   LOADED_WEBGL_SCRIPTS = "LOADED_WEBGL_SCRIPTS",
   REPORT_DATA = "REPORT_DATA",
   SET_INITIAL_REPORT_APP = "SET_INITIAL_REPORT_APP",
   SET_USER_IMG_URL = "SET_USER_IMG_URL",
   USER_IMG_UPLOAD = "USER_IMG_UPLOAD",
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

function doSetPassword(data) {
   console.log("doSetPassword data: ", data);
   if (data.status) {
      return {
         type: SET_PASS,
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

const doimgUpload = data => ({
   type: USER_IMG_UPLOAD,
   data
});

// ===========================
// FETCH
// ===========================

export function async() {
   return function(dispatch) {
      dispatch(asyncStart());

      api
         .async()
         .then(data => dispatch(asyncSuccess(data)))
         .catch(error => dispatch(asyncError(error)));
   };
}

export function login(email, password) {
   return function(dispatch) {
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
   return function(dispatch) {
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

export const forgotPass = email => dispatch => {
   dispatch(asyncStart());

   const data = { email };
   api
      .forgotPass(data)
      .then(data => dispatch(doForgotPass(data)))
      .catch(error => dispatch(asyncError(error)));
};

export const setNewPass = ({ token, userId, newPass }) => dispatch => {
   dispatch(asyncStart());

   const data = { token, userId, newPass };
   api
      .setNewPass(data)
      .then(res => dispatch(doSetPassword(res)))
      .catch(error => dispatch(asyncError(error)));
};

export const getApps = (accessToken, filterBy = []) => dispatch => {
   dispatch(asyncStart());

   const data = {
      filterBy
   };

   api
      .getApps(accessToken, data)
      .then(data => dispatch(showApps(data)))
      .catch(error => dispatch(asyncError(error)));

   //    api
   //       .isAdmin(accessToken)
   //       .then(response => {
   //          console.log("response: ", response);
   //          if (response.status) {
   //             api
   //                .getAppsAdmin(accessToken, data)
   //                .then(data => dispatch(showApps(data)))
   //                .catch(error => dispatch(asyncError(error)));
   //          } else {
   //             console.log("data: ", data);
   //             api
   //                .getApps(accessToken, data)
   //                .then(data => dispatch(showApps(data)))
   //                .catch(error => dispatch(asyncError(error)));
   //          }
   //       })
   //       .catch(error => dispatch(asyncError(error)));
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

   const { platformName, name, isActive } = appDetails;
   const data = {
      platformName,
      name,
      isActive: !isActive
   };
   api
      .toggleAppStatus(accessToken, data)
      .then(data => {
         dispatch(doToggleAppStatus(data));
      })
      .catch(error => dispatch(asyncError(error)));
};

export const imgUpload = (uploadImg, accessToken) => dispatch => {
   dispatch(asyncStart());

   const data = {
      uploadImg
   };

   api
      .cloudinayImgUpload(accessToken, data)
      .then(data => {
         dispatch(doimgUpload(data));
      })
      .catch(error => {
         console.log("error: ", error);
      });
};

export const fetchUserImgURL = (imgURL, accessToken) => dispatch => {
   dispatch(asyncStart());

   dispatch(setUserImgURL(imgURL));

   //    const data = {
   //       imgURL
   //    };

   //    api
   //       .cloudinayImgURL(accessToken, data)
   //       .then(data => {
   //          dispatch(setUserImgURL(data));
   //       })
   //       .catch(error => dispatch(asyncError(error)));
};

// ===========================
// SELECT APP
// ===========================

export const selectApp = (appId, accessToken) => dispatch => {
   dispatch(asyncStart());

   const data = { appId };

   api
      .getScenes(accessToken, data)
      .then(res => dispatch(doSelectApp(appId, res)))
      .catch(error => dispatch(asyncError(error)));
};

export const getPlacements = (appId, sceneId, accessToken) => dispatch => {
   dispatch(asyncStart());
   const data = { appId, sceneId };

   api
      .getPlacements(accessToken, data)
      .then(res => dispatch(setPlacements(res)))
      .catch(error => dispatch(asyncError(error)));
};

export const updatePlacements = (accessToken, data) => dispatch => {
   dispatch(asyncStart());

   api
      .updatePlacements(accessToken, data)
      .then(res => dispatch(pushPlacements(res)))
      .catch(error => dispatch(asyncError(error)));
};

// ===========================
// REPORT
// ===========================

export const getReportData = (isAdmin, appsIds) => dispatch => {
   dispatch(asyncStart());

   const reportData = api.getReportData(appsIds);
   dispatch(sendReportData(reportData));
};

export const setInitialReportApp = appId => dispatch => {
   dispatch({
      type: SET_INITIAL_REPORT_APP,
      data: appId
   });
};
