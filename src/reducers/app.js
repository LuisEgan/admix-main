import C from "../utils/constants";

import {
  LOGIN_SUCCESS,
  LOGOUT_SUCCESS,
  REGISTER_SUCCESS,
  APPS_SUCCESS,
  SELECT_APP,
  RESET_SELECTED_APP,
  SAVE_APP,
  SET_PLACEMENT,
  SET_PLACEMENTS,
  SET_PLACEMENTS_BY_ID,
  SAVE_INPUTS,
  RESET_SAVED_INPUTS,
  TOGGLE_APP_STATUS,
  USER_DATA_SUCCESS,
  REPORT_DATA,
  SET_INITIAL_REPORT_APP,
  USER_IMG_UPLOAD,
  SET_USER_IMG_URL,
  SNACKBAR_TOGGLE,
  SET_APPS_FILTER_BY,
  SET_LOADED_SCENE,
} from "../actions";

const initialState = {
  logoutCount: 0,
  counter: 0,
  isSnackBarOpen: false,
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
  reportData: {},
  initialReportAppId: [],
  userImgURL: "",
  appsFilterBy: [],
  loadedScenesByAppId: null,
};

const actionsMap = {
  [SNACKBAR_TOGGLE]: state => {
    let isSnackBarOpen = state.isSnackBarOpen;
    const isLoggedIn = state.isLoggedIn;

    isSnackBarOpen = isLoggedIn ? !isSnackBarOpen : false;

    return { ...state, isSnackBarOpen };
  },

  [SET_APPS_FILTER_BY]: (state, action) => {
    const appsFilterBy = action.data;

    return { ...state, appsFilterBy };
  },

  [REGISTER_SUCCESS]: (state, action) => {
    const to = action.data.message.emailObj.to[0];
    const signupInfo = {
      userName: to.name,
      userEmail: to.email,
    };

    return { ...state, signupInfo };
  },

  [LOGIN_SUCCESS]: (state, action) => {
    const { data } = action.data;
    const isLoggedIn = true;

    const newState = {
      isLoggedIn,
      accessToken: data.loginToken,
    };

    if (data.adminToken) {
      newState.adminToken = data.adminToken;
    }

    return { ...state, newState };
  },
  [LOGOUT_SUCCESS]: () => {
    return { ...initialState, logoutCount: 2 };
  },
  [APPS_SUCCESS]: (state, action) => {
    const apps = Array.isArray(action.data.data) ? action.data.data : [];
    return { ...state, apps };
  },
  [USER_DATA_SUCCESS]: (state, action) => {
    const userData = action.data.data;
    return { ...state, userData };
  },

  [SELECT_APP]: (state, data) => {
    const apps = [...state.apps];
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

    return { ...state, selectedApp };
  },

  [RESET_SELECTED_APP]: state => {
    const selectedApp = {};
    const placementsByAppId = {};
    return { ...state, selectedApp, placementsByAppId };
  },
  [SAVE_APP]: (state, { app }) => {
    let savedApps = [...state.savedApps];
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
    return { ...state, savedApps };
  },

  [SET_PLACEMENT]: (state, { placementOpt }) => {
    let selectedApp = { ...state.selectedApp };
    selectedApp.placementOpt = placementOpt;
    return { ...state, selectedApp };
  },
  [SET_PLACEMENTS]: (state, data) => {
    const selectedApp = { ...state.selectedApp };
    const apps = [...state.apps];
    const placements = data.data.data;

    apps.forEach(app => {
      app.scenes &&
        Array.isArray(app.scenes) &&
        app.scenes.forEach(scene => {
          scene.placements = [];
          Array.isArray(placements) &&
            placements.forEach((placement, i) => {
              if (scene._id === placement.sceneId._id) {
                const placementToPush = { ...placements[i] };
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
              const placementToPush = { ...placements[i] };
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

    return { ...state, selectedApp };
  },

  [SET_PLACEMENTS_BY_ID]: (state, data) => {
    let placementsByAppId = { ...state.placementsByAppId };
    const placements = Array.isArray(data.data.data) ? [...data.data.data] : [];
    let newPcsById = placements.length > 0 ? { ...placementsByAppId } : {};

    placements &&
      placements.forEach(placement => {
        newPcsById[placement._id] = { ...placement };
        delete newPcsById[placement._id]._id;
      });

    return { ...state, placementsByAppId: newPcsById };
  },

  [SAVE_INPUTS]: (state, { toSaveInputs }) => {
    let savedInputs = [...state.savedInputs];
    const newInput = { ...toSaveInputs };
    savedInputs = !!savedInputs ? savedInputs : [];

    // * Slice out the savedInput if it was already saved
    savedInputs = savedInputs.filter(input => {
      return input.placementName !== toSaveInputs.placementName;
    });

    savedInputs = [...savedInputs, newInput];

    return { ...state, savedInputs };
  },

  [RESET_SAVED_INPUTS]: state => {
    return { ...state, savedInputs: [] };
  },

  [TOGGLE_APP_STATUS]: (state, data) => {
    let apps = [...state.apps];
    let selectedApp = { ...state.selectedApp };

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

    return { ...state, apps, selectedApp };
  },

  [REPORT_DATA]: (state, data) => {
    const reportData = {};

    data.data.data.forEach(elem => {
      const elemClone = { ...elem };
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

    return { ...state, reportData };
  },
  [SET_INITIAL_REPORT_APP]: (state, data) => {
    const appsIds = data.data;
    const initialReportAppId = Array.isArray(appsIds) ? appsIds : [appsIds];

    return { ...state, initialReportAppId };
  },

  [USER_IMG_UPLOAD]: (state, data) => {
    const userImgURL = data.data.data.secure_url;
    const isSnackBarOpen = true;

    return { ...state, userImgURL, isSnackBarOpen };
  },

  [SET_USER_IMG_URL]: (state, data) => {
    const userImgURL = data.data;

    return { ...state, userImgURL };
  },

  [SET_LOADED_SCENE]: (state, data) => {
    let loadedScenesByAppId = state.loadedScenesByAppId || {};

    loadedScenesByAppId[data.loadedScene.appId] = { ...data.loadedScene };

    return { ...state, loadedScenesByAppId };
  },
};

export default function reducer(state = initialState, action = {}) {
  const fn = actionsMap[action.type];
  return fn ? fn(state, action) : state;
}
