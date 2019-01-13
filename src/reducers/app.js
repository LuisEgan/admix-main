import { Map } from "immutable";
import { cloneDeep } from "lodash";
import C from "../utils/constants";

import {
  ACTION,
  ACTION_START,
  ACTION_ERROR,
  ACTION_SUCCESS,
  RESET_ASYNC,
  FORGOT_PASS,
  CHANGE_EMAIL,
  SET_PASS,
  SET_NEW_EMAIL,
  LOGIN_SUCCESS,
  LOGOUT_SUCCESS,
  REGISTER_SUCCESS,
  APPS_SUCCESS,
  SELECT_APP,
  UPDATE_APP,
  RESET_SELECTED_APP,
  SAVE_APP,
  SET_PLACEMENT,
  SET_PLACEMENTS,
  SET_PLACEMENTS_BY_ID,
  SAVE_INPUTS,
  RESET_SAVED_INPUTS,
  TOGGLE_APP_STATUS,
  USER_DATA_SUCCESS,
  LOADED_WEBGL_SCRIPTS,
  REPORT_DATA,
  SET_INITIAL_REPORT_APP,
  UPDATE_PLACEMENTS,
  UPDATE_USER,
  USER_IMG_UPLOAD,
  SET_USER_IMG_URL,
  SNACKBAR_TOGGLE,
  SET_APPS_FILTER_BY,
  SET_LOADED_SCENE,
} from "../actions";

const initialStateValues = {
  logoutCount: 0,
  counter: 0,
  isSnackBarOpen: false,
  asyncLoading: false,
  asyncError: null,
  asyncData: null,
  isLoggedIn: false,
  accessToken: "",
  adminToken: "",
  signupInfo: "",
  userData: {},
  apps: [],
  selectedApp: {},
  placementsByAppId: {},
  savedApps: [],
  savedInputs: [],
  load_webgl: false,
  reportData: {},
  initialReportAppId: [],
  userImgURL: "",
  appsFilterBy: [],
  loadedScenesByAppId: null,
};

export const initialState = Map({ ...initialStateValues });

const actionsMap = {
  [ACTION]: state => {
    const counter = state.get("counter") + 1;

    return state.merge(
      Map({
        counter,
      }),
    );
  },

  [SNACKBAR_TOGGLE]: state => {
    let isSnackBarOpen = state.get("isSnackBarOpen");
    const isLoggedIn = state.get("isLoggedIn");

    isSnackBarOpen = isLoggedIn ? !isSnackBarOpen : false;

    return state.merge(
      Map({
        isSnackBarOpen,
      }),
    );
  },

  [SET_APPS_FILTER_BY]: (state, action) => {
    const appsFilterBy = action.data;

    return state.merge(
      Map({
        appsFilterBy,
      }),
    );
  },

  [LOADED_WEBGL_SCRIPTS]: state => {
    return state.merge(
      Map({
        load_webgl: true,
      }),
    );
  },

  // Async action
  [ACTION_START]: state => {
    return state.merge(
      Map({
        asyncLoading: true,
        asyncError: null,
      }),
    );
  },
  [ACTION_ERROR]: (state, action) => {
    const isLoggedIn = state.get("isLoggedIn");

    const { message, statusMessage } = action.data;
    let asyncError = Array.isArray(message) ? message[0].msg : message;

    // Fallback
    asyncError === "" && (asyncError = statusMessage);

    const asyncData = {
      mssg: asyncError || "Oops.. Something went wrong",
    };
    const isSnackBarOpen = isLoggedIn;

    const asyncLoading = false;
    return state.merge(
      Map({
        asyncLoading,
        asyncError,
        asyncData,
        isSnackBarOpen,
      }),
    );
  },
  [ACTION_SUCCESS]: (state, action) => {
    const asyncLoading = false;
    const asyncData = {};
    let mssg = Array.isArray(action.data) ? action.data[0].msg : action.data;
    asyncData.mssg = mssg;

    return state.merge(
      Map({
        asyncLoading,
        asyncData,
      }),
    );
  },

  [REGISTER_SUCCESS]: (state, action) => {
    const to = action.data.message.emailObj.to[0];
    const signupInfo = {
      userName: to.name,
      userEmail: to.email,
    };

    const asyncLoading = false;
    const asyncData = {
      mssg: "Success! Now, please confirm your email.",
    };
    return state.merge(
      Map({
        asyncLoading,
        asyncData,
        signupInfo,
      }),
    );
  },

  [RESET_ASYNC]: state => {
    const asyncError = null;
    const asyncData = null;
    const asyncLoading = false;
    return state.merge(
      Map({
        asyncError,
        asyncData,
        asyncLoading,
      }),
    );
  },

  [FORGOT_PASS]: (state, data) => {
    const asyncLoading = false;
    const asyncData = {
      mssg: "Success! Now, check your email for further instructions.",
    };
    const isSnackBarOpen = true;
    return state.merge(
      Map({
        asyncLoading,
        asyncData,
        isSnackBarOpen,
      }),
    );
  },

  [CHANGE_EMAIL]: (state, data) => {
    const asyncLoading = false;
    const asyncData = {
      mssg: "Success! Now, check your email for further instructions.",
    };
    const isSnackBarOpen = true;
    return state.merge(
      Map({
        asyncLoading,
        asyncData,
        isSnackBarOpen,
      }),
    );
  },

  [UPDATE_USER]: (state, data) => {
    const asyncLoading = false;
    const asyncData = {
      mssg: "Success! User updated!",
    };
    const isSnackBarOpen = true;
    return state.merge(
      Map({
        asyncLoading,
        asyncData,
        isSnackBarOpen,
      }),
    );
  },

  [SET_PASS]: (state, data) => {
    const asyncLoading = false;

    const asyncData = {
      mssg: Array.isArray(data.data.message)
        ? data.data.message[0].msg
        : data.data.message,
    };
    return state.merge(
      Map({
        asyncLoading,
        asyncData,
      }),
    );
  },

  [SET_NEW_EMAIL]: (state, data) => {
    const asyncLoading = false;

    const asyncData = {
      mssg: Array.isArray(data.data.message)
        ? data.data.message[0].msg
        : data.data.message,
    };
    return state.merge(
      Map({
        asyncLoading,
        asyncData,
      }),
    );
  },

  [LOGIN_SUCCESS]: (state, action) => {
    const { data } = action.data;
    const isLoggedIn = true;
    const asyncLoading = false;

    const newState = {
      isLoggedIn,
      accessToken: data.loginToken,
      asyncLoading,
      asyncData: null,
    };

    if (data.adminToken) {
      newState.adminToken = data.adminToken;
    }

    return state.merge(Map(newState));
  },
  [LOGOUT_SUCCESS]: (state, action) => {
    return state.merge(
      Map({
        ...initialStateValues,
        logoutCount: 2,
      }),
    );
  },
  [APPS_SUCCESS]: (state, action) => {
    const asyncLoading = false;
    const apps = Array.isArray(action.data.data) ? action.data.data : [];
    return state.merge(
      Map({
        apps,
        asyncLoading,
      }),
    );
  },
  [USER_DATA_SUCCESS]: (state, action) => {
    const asyncLoading = false;
    const userData = action.data.data;

    return state.merge(
      Map({
        asyncLoading,
        userData,
      }),
    );
  },

  [SELECT_APP]: (state, data) => {
    const apps = state.get("apps");
    let selectedApp = {};
    const { appId } = data.data;
    const scenes = [...data.data.data];

    apps.some(app => {
      if (app._id === appId) {
        selectedApp = { ...app };
        return true;
      }
      return false;
    });
    selectedApp.scenes = [...scenes];

    const asyncLoading = false;
    return state.merge(
      Map({
        selectedApp,
        asyncLoading,
      }),
    );
  },
  [UPDATE_APP]: (state, data) => {
    const asyncData = {
      mssg: "App updated!",
    };
    const isSnackBarOpen = true;

    const asyncLoading = false;
    return state.merge(
      Map({
        asyncLoading,
        asyncData,
        isSnackBarOpen,
      }),
    );
  },

  [RESET_SELECTED_APP]: state => {
    const selectedApp = {};
    const placementsByAppId = {};
    return state.merge(
      Map({
        selectedApp,
        placementsByAppId,
      }),
    );
  },
  [SAVE_APP]: (state, { app }) => {
    let savedApps = state.get("savedApps");
    // savedApps = savedApps ? savedApps : [];
    const { savedInputs, scenes, selectedScene } = app;
    delete app.savedInputs;
    delete app.selectedScene;

    const _saveAppForFirstTime = () => {
      scenes.some((scene, i) => {
        if (scene._id === selectedScene._id) {
          app.scenes[i].savedInputs = [savedInputs];
          return true;
        }
        return false;
      });
      savedApps.push(app);
    };

    if (savedApps.length <= 0) {
      //If there wasn't any saved apps
      _saveAppForFirstTime();
    } else {
      savedApps.some((savedApp, i) => {
        if (savedApp._id === app._id) {
          //If there were some saved apps and the just clicked was already saved, overwrite it
          savedApp.scenes.some((savedAppScene, j) => {
            if (savedAppScene._id === selectedScene._id) {
              savedAppScene.savedInputs.some((input, k) => {
                if (input.Name === savedInputs.Name) {
                  //If the clicked inputs were already saved, overwrite them
                  savedApps[i].scenes[j].savedInputs[k] = savedInputs;
                  return true;
                } else if (k === savedAppScene.savedInputs.length - 1) {
                  //If the clicked inputs weren't already saved, store them
                  savedApps[i].scenes[j].savedInputs.push(savedInputs);
                }
                return false;
              });
              return true;
            }
            return false;
          });
        } else if (i === savedApps.length - 1) {
          //If there some saved apps but the just clicked wasn't saved yet
          _saveAppForFirstTime();
        }
        return false;
      });
    }

    return state.merge(
      Map({
        savedApps,
      }),
    );
  },

  [SET_PLACEMENT]: (state, { placementOpt }) => {
    let selectedApp = state.get("selectedApp");
    selectedApp.placementOpt = placementOpt;
    return state.merge(
      Map({
        selectedApp,
      }),
    );
  },
  [SET_PLACEMENTS]: (state, data) => {
    const selectedApp = state.get("selectedApp");
    const apps = state.get("apps");
    const placements = data.data.data;

    apps.forEach(app => {
      app.scenes &&
        Array.isArray(app.scenes) &&
        app.scenes.forEach(scene => {
          scene.placements = [];
          Array.isArray(placements) &&
            placements.forEach((placement, i) => {
              if (scene._id === placement.sceneId._id) {
                const placementToPush = cloneDeep(placements[i]);
                placementToPush.addedPrefix = false;

                if (
                  placementToPush.placementName &&
                  !placementToPush.placementName.includes(C.ADMIX_OBJ_PREFIX)
                ) {
                  placementToPush.addedPrefix = true;
                  placementToPush.placementName =
                    C.ADMIX_OBJ_PREFIX + placementToPush.placementName;
                }
                scene.placements.push(placementToPush);
              }
            });
        });
    });

    selectedApp.scenes &&
      selectedApp.scenes.forEach(scene => {
        scene.placements = [];
        Array.isArray(placements) &&
          placements.forEach((placement, i) => {
            if (scene._id === placement.sceneId) {
              const placementToPush = cloneDeep(placements[i]);
              placementToPush.addedPrefix = false;

              if (
                placementToPush.placementName &&
                !placementToPush.placementName.includes(C.ADMIX_OBJ_PREFIX)
              ) {
                placementToPush.addedPrefix = true;
                placementToPush.placementName =
                  C.ADMIX_OBJ_PREFIX + placementToPush.placementName;
              }
              scene.placements.push(placementToPush);
            }
          });
      });

    const asyncLoading = false;
    return state.merge(
      Map({
        selectedApp,
        asyncLoading,
      }),
    );
  },
  [SET_PLACEMENTS_BY_ID]: (state, data) => {
    let placementsByAppId = state.get("placementsByAppId");
    const placements = Array.isArray(data.data.data) ? [...data.data.data] : [];
    let newPcsById = placements.length > 0 ? cloneDeep(placementsByAppId) : {};

    placements &&
      placements.forEach(placement => {
        newPcsById[placement._id] = cloneDeep(placement);
        delete newPcsById[placement._id]._id;
      });

    const asyncLoading = false;
    return state.merge(
      Map({
        asyncLoading,
        placementsByAppId: newPcsById,
      }),
    );
  },

  [SAVE_INPUTS]: (state, { toSaveInputs }) => {
    let savedInputs = state.get("savedInputs");
    const newInput = cloneDeep(toSaveInputs);
    savedInputs = !!savedInputs ? savedInputs : [];

    // Slice out the savedInput if it was already saved
    savedInputs = savedInputs.filter(input => {
      return input.placementName !== toSaveInputs.placementName;
    });

    savedInputs = [...savedInputs, newInput];

    return state.merge(
      Map({
        savedInputs,
      }),
    );
  },

  [RESET_SAVED_INPUTS]: state => {
    return state.merge(
      Map({
        savedInputs: [],
      }),
    );
  },

  [TOGGLE_APP_STATUS]: (state, data) => {
    let apps = state.get("apps");
    let selectedApp = state.get("selectedApp");

    const updatedApp = data.data.data;
    const { _id } = updatedApp;
    apps = apps.map(app => {
      if (app._id === _id) {
        app = updatedApp;
      }
      return app;
    });

    if (Object.keys(selectedApp).length > 0) {
      selectedApp.isActive = updatedApp.isActive;
      selectedApp.appState = updatedApp.appState;
    }

    const asyncLoading = false;
    return state.merge(
      Map({
        apps,
        selectedApp,
        asyncLoading,
      }),
    );
  },

  [UPDATE_PLACEMENTS]: (state, data) => {
    // this are for when there's a validation page
    // const savedInputs = [];
    // const selectedApp = {};
    // const apps = [];

    const asyncLoading = false;
    const asyncData = {
      mssg: "Success! Placements saved!",
    };
    const isSnackBarOpen = true;

    return state.merge(
      Map({
        // savedInputs,
        // selectedApp,
        // apps,
        asyncLoading,
        asyncData,
        isSnackBarOpen,
      }),
    );
  },

  [REPORT_DATA]: (state, data) => {
    const asyncLoading = false;
    const reportData = {};

    data.data.data.forEach(elem => {
      const elemClone = cloneDeep(elem);
      const {
        date,
        keys: { appid },
      } = elemClone;
      delete elemClone.date;
      delete elemClone.keys.appid;

      let reportDate = date.split("T")[0];
      reportDate =
        reportDate.split("-")[1] +
        "/" +
        reportDate.split("-")[2] +
        "/" +
        reportDate.split("-")[0];

      if (reportData[reportDate]) {
        if (reportData[reportDate][appid]) {
          reportData[reportDate][appid] = [
            ...reportData[reportDate][appid],
            elemClone,
          ];
        } else {
          reportData[reportDate][appid] = [elemClone];
        }
      } else {
        reportData[reportDate] = {};
        reportData[reportDate][appid] = [elemClone];
      }
    });

    return state.merge(
      Map({
        reportData,
        asyncLoading,
      }),
    );
  },
  [SET_INITIAL_REPORT_APP]: (state, data) => {
    const appsIds = data.data;
    const initialReportAppId = Array.isArray(appsIds) ? appsIds : [appsIds];

    return state.merge(
      Map({
        initialReportAppId,
      }),
    );
  },

  [USER_IMG_UPLOAD]: (state, data) => {
    const asyncLoading = false;
    const userImgURL = data.data.data.secure_url;
    const asyncData = {
      mssg: "Success! Image updated!",
    };
    const isSnackBarOpen = true;

    return state.merge(
      Map({
        asyncLoading,
        userImgURL,
        asyncData,
        isSnackBarOpen,
      }),
    );
  },

  [SET_USER_IMG_URL]: (state, data) => {
    const asyncLoading = false;
    const userImgURL = data.data;

    return state.merge(
      Map({
        asyncLoading,
        userImgURL,
      }),
    );
  },

  [SET_LOADED_SCENE]: (state, data) => {
    let loadedScenesByAppId = state.get("loadedScenesByAppId") || {};

    loadedScenesByAppId[data.loadedScene.appId] = { ...data.loadedScene };

    return state.merge(
      Map({
        loadedScenesByAppId,
      }),
    );
  },
};

export default function reducer(state = initialState, action = {}) {
  const fn = actionsMap[action.type];
  return fn ? fn(state, action) : state;
}
