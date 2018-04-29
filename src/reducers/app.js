import { Map } from "immutable";
import _ from "lodash";

import {
   ACTION,
   ACTION_START,
   ACTION_ERROR,
   ACTION_SUCCESS,
   RESET_ASYNC,
   FORGOT_PASS,
   LOGIN_SUCCESS,
   LOGOUT_SUCCESS,
   REGISTER_SUCCESS,
   APPS_SUCCESS,
   SELECT_APP,
   RESET_SELECTED_APP,
   SAVE_APP,
   SET_PLACEMENT,
   SET_PLACEMENTS,
   SAVE_INPUTS,
   TOGGLE_APP_STATUS,
   USER_DATA_SUCCESS,
   LOADED_WEBGL_SCRIPTS,
   REPORT_DATA,
   SET_INITIAL_REPORT_APP,
   UPDATE_PLACEMENTS
} from "../actions";
import { selectApp, savedApp, placement } from "../actions";

export const initialState = Map({
   counter: 0,
   asyncLoading: false,
   asyncError: null,
   asyncData: null,
   isLoggedIn: false,
   accessToken: "",
   userData: {},
   apps: [],
   selectedApp: {},
   savedApps: [],
   savedInputs: [],
   load_webgl: false,
   reportData: {},
   initialReportAppId: []
});

const actionsMap = {
   [ACTION]: state => {
      const counter = state.get("counter") + 1;

      return state.merge(
         Map({
            counter
         })
      );
   },

   [LOADED_WEBGL_SCRIPTS]: state => {
      return state.merge(
         Map({
            load_webgl: true
         })
      );
   },

   // Async action
   [ACTION_START]: state => {
      return state.merge(
         Map({
            asyncLoading: true,
            asyncError: null,
            asyncData: null
         })
      );
   },
   [ACTION_ERROR]: (state, action) => {
      const { message, statusMessage } = action.data;
      let asyncError = Array.isArray(message) ? message[0].msg : message;

      // Fallback
      asyncError === "" && (asyncError = statusMessage);

      const asyncLoading = false;
      return state.merge(
         Map({
            asyncLoading,
            asyncError
            // asyncError: action.data && action.data.statusMessage,
         })
      );
   },
   [ACTION_SUCCESS]: (state, action) => {
      const asyncLoading = false;
      return state.merge(
         Map({
            asyncLoading,
            asyncData: action.data
         })
      );
   },

   [REGISTER_SUCCESS]: (state, action) => {
      // const isLoggedIn = true;
      const asyncLoading = false;
      const asyncData = { mssg: "Success! Now, please confirm your email." };
      return state.merge(
         Map({
            asyncLoading,
            asyncData
         })
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
            asyncLoading
         })
      );
   },

   [FORGOT_PASS]: (state, action) => {
      const asyncLoading = false;
      const asyncData = {
         mssg: "Success! Now, check your email for further instructions."
      };
      return state.merge(
         Map({
            asyncLoading,
            asyncData
         })
      );
   },
   [LOGIN_SUCCESS]: (state, action) => {
      const { data } = action.data;
      const isLoggedIn = true;
      const asyncLoading = false;
      return state.merge(
         Map({
            isLoggedIn,
            accessToken: data,
            asyncLoading
         })
      );
   },
   [LOGOUT_SUCCESS]: (state, action) => {
      const isLoggedIn = false;
      return state.merge(Map(initialState));
   },
   [APPS_SUCCESS]: (state, action) => {
      const selectedApp = {};
      const asyncLoading = false;
      return state.merge(
         Map({
            apps: action.data.data,
            asyncLoading,
            selectedApp
         })
      );
   },
   [USER_DATA_SUCCESS]: (state, action) => {
      const asyncLoading = false;
      const userData = action.data.data;
      return state.merge(
         Map({
            asyncLoading,
            userData
         })
      );
   },

   [SELECT_APP]: (state, data) => {
      const apps = state.get("apps");
      let selectedApp = {};
      const { appId } = data.data;
      const scenes = data.data.data;

      apps.some(app => {
         if (app._id === appId) {
            selectedApp = app;
            return true;
         }
      });
      selectedApp.scenes = scenes;

      const asyncLoading = false;
      return state.merge(
         Map({
            selectedApp,
            asyncLoading
         })
      );
   },
   [RESET_SELECTED_APP]: state => {
      const selectedApp = {};
      return state.merge(
         Map({
            selectedApp
         })
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
                     });
                     return true;
                  }
               });
            } else if (i === savedApps.length - 1) {
               //If there some saved apps but the just clicked wasn't saved yet
               _saveAppForFirstTime();
            }
         });
      }

      return state.merge(
         Map({
            savedApps
         })
      );
   },

   [SET_PLACEMENT]: (state, { placementOpt }) => {
      let selectedApp = state.get("selectedApp");
      selectedApp.placementOpt = placementOpt;
      return state.merge(
         Map({
            selectedApp
         })
      );
   },
   [SET_PLACEMENTS]: (state, data) => {
      const selectedApp = state.get("selectedApp");
      const placements = data.data.data;

      selectedApp.scenes.forEach(scene => {
         scene.placements = [];
         placements.some((placement, i) => {
            if (scene._id === placement.sceneId._id) {
               scene.placements.push(placements[i]);
               return true;
            }
         });
      });

      const asyncLoading = false;
      return state.merge(
         Map({
            selectedApp,
            asyncLoading
         })
      );
   },

   [SAVE_INPUTS]: (state, { toSaveInputs }) => {
      let savedInputs = state.get("savedInputs");
      savedInputs = !!savedInputs ? savedInputs : [];

      // Slice out the savedInput if it was already saved
      savedInputs = savedInputs.filter(
         input => input.placementName !== toSaveInputs.placementName
      );

      savedInputs = [...savedInputs, toSaveInputs];

      return state.merge(
         Map({
            savedInputs
         })
      );
   },

   [TOGGLE_APP_STATUS]: (state, data) => {
      let apps = state.get("apps");
      const { _id } = data.data.data;
      apps = apps.map(app => {
         if (app._id === _id) {
            app.isActive = !app.isActive;
         }
         return app;
      });

      const asyncLoading = false;
      return state.merge(
         Map({
            apps,
            asyncLoading
         })
      );
   },

   [UPDATE_PLACEMENTS]: (state, data) => {
      const savedInputs = [];
      const asyncLoading = false;
      const selectedApp = {};
      const apps = [];

      return state.merge(
         Map({
            savedInputs,
            asyncLoading,
            selectedApp,
            apps
         })
      );
   },

   [REPORT_DATA]: (state, data) => {
      const asyncLoading = false;
      const reportData = {};

      data.data.forEach(elem => {
         const elemClone = _.cloneDeep(elem);
         const { reportDate, appId } = elemClone;
         delete elemClone.reportDate;
         delete elemClone.appId;

         // before adding sub-attributes, the parent atrribute must exist, it won't create whilst creating the child
         // obj.a.b = value will only work if obj.a already exists
         if (reportData[reportDate]) {
            if (reportData[reportDate][appId]) {
               reportData[reportDate][appId] = [
                  ...reportData[reportDate][appId],
                  elemClone
               ];
            } else {
               reportData[reportDate][appId] = [elemClone];
            }
         } else {
            reportData[reportDate] = {};
            reportData[reportDate][appId] = [elemClone];
         }
      });

      return state.merge(
         Map({
            reportData,
            asyncLoading
         })
      );
   },
   [SET_INITIAL_REPORT_APP]: (state, data) => {
      const appsIds = data.data;
      const initialReportAppId = Array.isArray(appsIds) ? appsIds : [appsIds];

      return state.merge(
         Map({
            initialReportAppId
         })
      );
   }
};

export default function reducer(state = initialState, action = {}) {
   const fn = actionsMap[action.type];
   return fn ? fn(state, action) : state;
}
