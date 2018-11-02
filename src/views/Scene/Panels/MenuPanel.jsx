import React, { Component } from "react";
import _a from "../../../utils/analytics";
import _ from "lodash";
import PropTypes from "prop-types";
import {
   getPlacements,
   resetSelectedApp,
   toggleAppStatus,
   updatePlacements
   //    setLoadedScene
} from "../../../actions/";
import C from "../../../utils/constants";
import CSS from "../../../utils/InLineCSS";

import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { KeyboardArrowDown } from "@material-ui/icons";

import STR from "../../../utils/strFuncs";
import SVG from "../../../components/SVG";
import PanelFooter from "../../../components/PanelFooter";

const { ga } = _a;

let oldSavedInputs = {};

export default class MenuPanel extends Component {
   static propTypes = {
      selectedApp: PropTypes.object,
      loadScene: PropTypes.func,
      selectScene: PropTypes.func,
      dispatch: PropTypes.func,
      accessToken: PropTypes.string,
      activeClickedElem: PropTypes.func,
      mouseOnPanel: PropTypes.func
   };

   constructor(props) {
      super(props);

      // If true = panel is slided in
      this.state = {
         appSelected: false,
         interval: null,
         oldStoreurl: null,
         slidedIn: false,
         selectedScene: "",
         showHappyInfoBox: false,
         showDdScenes: false
      };

      // this.selectApp = this.selectApp.bind(this);
      this.toggleSlide = this.toggleSlide.bind(this);
      this.goBack = this.goBack.bind(this);
      this.sceneChange = this.sceneChange.bind(this);
      this.displayChange = this.displayChange.bind(this);
      this.updatePlacements = this.updatePlacements.bind(this);
      this.changeActive = this.changeActive.bind(this);
      this.toggleDropdowns = this.toggleDropdowns.bind(this);
      this.renderDisplayModeToggle = this.renderDisplayModeToggle.bind(this);
   }

   static getDerivedStateFromProps(nextProps, prevState) {
      const { accessToken, dispatch, savedInputs } = nextProps;

      if (
         Object.keys(savedInputs).length > 0 &&
         !_.isEqual(savedInputs, oldSavedInputs)
      ) {
         const parsedInputs = savedInputs.map(input => {
            if (input.addedPrefix) {
               input.placementName = input.placementName.replace(
                  C.ADMIX_OBJ_PREFIX,
                  ""
               );
            }

            return input;
         });

         oldSavedInputs = _.cloneDeep(savedInputs);
         dispatch(updatePlacements({ accessToken, data: parsedInputs }));
      }

      return null;
   }

   componentWillUnmount() {
      const { interval } = this.state;

      clearInterval(interval);
   }

   toggleSlide(forceAction) {
      let slidedIn = !this.state.slidedIn;

      if (forceAction === "close") {
         slidedIn = true;
      } else if (forceAction === "open") {
         slidedIn = false;
      }

      this.setState({ slidedIn });
   }

   //    selectApp() {
   //       const {
   //          dispatch,
   //          accessToken,
   //          selectedApp: { _id, storeurl },
   //       } = this.props;
   //       const { appSelected, oldStoreurl } = this.state;

   //       if (!appSelected) {
   //          const interval = setInterval(() => {
   //             if (storeurl !== oldStoreurl) clearInterval(interval);
   //             dispatch(getApps(accessToken));
   //             dispatch(selectApp(_id, accessToken));
   //          }, 5000);
   //          this.setState({ appSelected: true, interval, oldStoreurl: storeurl });
   //       }
   //    }

   goBack() {
      const { dispatch } = this.props;
      dispatch(resetSelectedApp());
   }

   toggleDropdowns(forceClose = false) {
      let { showDdScenes } = this.state;
      showDdScenes = forceClose ? false : !showDdScenes;
      this.setState({ showDdScenes });
   }

   handleDropdown = event => {
      this.setState({ anchorEl: event.currentTarget });
   };

   handleClose = () => {
      this.setState({ anchorEl: null });
   };

   sceneChange(e) {
      const sceneName = e.target ? e.target.value : e;
      let scene;
      const {
         loadScene,
         selectScene,
         dispatch,
         accessToken,
         selectedApp: { _id, scenes }
      } = this.props;
      const { selectedScene } = this.state;

      if (selectedScene !== sceneName) {
         //Get scene's ID
         scenes.some(s => {
            if (s.name === sceneName) {
               scene = s;
               return true;
            }
            return false;
         });

         if (scene) {
            // Get scene's placements
            dispatch(getPlacements(_id, scene._id, accessToken));

            // Set loaded scene
            // dispatch(setLoadedScene(scene));

            // Hide Menu panel
            // this.toggleSlide();

            // Change dropdown scene display
            this.setState({ selectedScene: sceneName });

            // Set Scene (parent parent component /Scene index) selectedScene state
            selectScene(scene);

            // Load webgl
            setTimeout(() => {
               loadScene();
            }, 1500);
         }
      }
   }

   displayChange(e) {
      _a.track(ga.actions.scenes.toggleSceneDisplayMode, {
         category: ga.categories.scenes,
         label:
            e.target.value === "raw"
               ? ga.labels.toggleSceneDisplayMode.raw
               : ga.labels.toggleSceneDisplayMode.d3
      });

      const { setDisplayMode, forceCloseFormPanel } = this.props;
      forceCloseFormPanel();

      // for /Scene (grandparent) to know which display mode is selected
      setDisplayMode(e.target.value);
   }

   updatePlacements() {
      const { dispatch, savedInputs, accessToken, selectedApp } = this.props;
      const { _id, platformName, name, storeurl } = selectedApp;
      const appDetails = {
         _id,
         platformName,
         name,
         isActive: true,
         appState:
            storeurl !== undefined && storeurl !== ""
               ? C.APP_STATES.live
               : C.APP_STATES.pending
      };
      dispatch(toggleAppStatus(appDetails, accessToken));

      const parsedInputs = savedInputs.map(input => {
         if (input.addedPrefix) {
            input.placementName = input.placementName.replace(
               C.ADMIX_OBJ_PREFIX,
               ""
            );
         }

         return input;
      });

      savedInputs.length !== 0 &&
         dispatch(updatePlacements({ accessToken, data: parsedInputs }));
   }

   changeActive(event) {
      const { dispatch, accessToken, selectedApp } = this.props;

      let {
         _id,
         platformName,
         name,
         isActive,
         appState,
         storeurl
      } = selectedApp;
      appState = isActive ? C.APP_STATES.inactive : C.APP_STATES.live;

      if (storeurl !== undefined && appState !== undefined) {
         if (!isActive && storeurl === "") {
            appState = C.APP_STATES.pending;
         }
      }

      _a.track(ga.actions.apps.toggleAppState, {
         category: ga.categories.apps,
         label: ga.labels.toggleAppState.onScene,
         value: STR.appStateToNumber(appState)
      });

      const appDetails = {
         _id,
         platformName,
         name,
         isActive: !isActive,
         appState
      };
      dispatch(toggleAppStatus(appDetails, accessToken));
   }

   renderScenesSelect() {
      const { selectedApp } = this.props;
      let { selectedScene } = this.state;
      const { scenes } = selectedApp;

      const allScenes = scenes.map(scene => {
         const { name } = scene;
         return (
            <MenuItem
               value={name}
               key={`${name}-${Math.random()}`}
               style={CSS.mb}
            >
               {name}
            </MenuItem>
         );
      });

      return (
         <div id="scene-select">
            <div>
               <span className="mb">Scene selection</span>
               <Select
                  value={selectedScene}
                  onChange={this.sceneChange}
                  input={<Input name="scene" id="scene-helper" />}
                  classes={{ root: "mui-select-root" }}
                  disableUnderline={true}
                  IconComponent={KeyboardArrowDown}
                  style={CSS.mb}
               >
                  <MenuItem value="" style={CSS.mb}>
                     <em>Please select a scene</em>
                  </MenuItem>
                  {allScenes}
               </Select>
            </div>
         </div>
      );
   }

   renderDisplayModeToggle() {
      const { sceneLoadingError, displayMode } = this.props;
      const { selectedScene } = this.state;

      const isSceneSelected = Object.keys(selectedScene).length > 0;

      const class3D = displayMode === "3D" ? "dm-selected" : "dm-not-selected";
      const style3D = { borderLeft: 0 };
      const classRaw =
         displayMode === "raw" ? "dm-selected" : "dm-not-selected";
      const styleRaw = { borderRightColor: "#14b9be" };

      const renderDisplayModeToggle = isSceneSelected
         ? { opacity: 1 }
         : { opacity: 0 };

      return (
         <div id="scene-displayMode">
            <div style={renderDisplayModeToggle}>
               <span className="mb unselectable">Display mode</span>

               <FormControl component="fieldset" id="displayRadios">
                  <RadioGroup
                     aria-label="display"
                     name="display1"
                     value={displayMode}
                     onChange={this.displayChange}
                  >
                     <FormControlLabel
                        classes={{ root: classRaw }}
                        style={isSceneSelected ? styleRaw : { cursor: "unset" }}
                        value="raw"
                        control={<Radio className="hidden" />}
                        label={
                           <div className="radio-btn unselectable">
                              {SVG.data}
                              Data
                           </div>
                        }
                     />
                     <FormControlLabel
                        classes={{ root: class3D }}
                        style={isSceneSelected ? style3D : { cursor: "unset" }}
                        value="3D"
                        control={<Radio className="hidden" />}
                        disabled={sceneLoadingError !== ""}
                        label={
                           <div className="radio-btn unselectable">
                              {SVG.cube}
                              3D
                           </div>
                        }
                     />
                  </RadioGroup>
                  {sceneLoadingError && (
                     <div id="sceneLoadErrorMssg" className="mbs">
                        Tick Export OBJ to enable 3D view.
                     </div>
                  )}
               </FormControl>
            </div>
         </div>
      );
   }

   render() {
      const { selectedApp, displayMode } = this.props;

      const { slidedIn } = this.state;

      const slideAnim = slidedIn ? "slidePanelOutLeft" : "slidePanelInLeft";
      const rotateAnim = slidedIn ? "rotate270" : "rotate90";

      return (
         <div id="scene-menu-panel" className={`panel ${slideAnim}`}>
            {displayMode === "3D" && (
               <div
                  className={`panel-toggle-btn cc`}
                  onClick={this.toggleSlide}
               >
                  <div className={`${rotateAnim}`}>{SVG.caretDown}</div>
               </div>
            )}

            <div id="scene-title">
               <div>
                  <span className="mb" style={{ color: "#14B9BE" }}>
                     Editing
                  </span>
                  <span className="sst">{selectedApp.name}</span>
               </div>
            </div>

            {this.renderScenesSelect()}

            {this.renderDisplayModeToggle()}

            <PanelFooter app={selectedApp} {...this.props} />
         </div>
      );
   }
}
