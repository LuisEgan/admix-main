import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import _ from "lodash";
import { routeCodes } from "../../../config/routes";
import PropTypes from "prop-types";
import {
   getPlacements,
   resetSelectedApp,
   toggleAppStatus,
   updatePlacements
   //    selectApp,
   //    getApps
} from "../../../actions/";
import C from "../../../utils/constants";

import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormLabel from "@material-ui/core/FormLabel";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faMousePointer from "@fortawesome/fontawesome-free-solid/faMousePointer";
import faCubes from "@fortawesome/fontawesome-free-solid/faCubes";
import faTable from "@fortawesome/fontawesome-free-solid/faTable";

import MouseScroll from "../../../components/SVG/MouseScroll";
import RightClick from "../../../components/SVG/RightClick";

// import controlsArrows from "../../../assets/img/controlsArrows.png";
// import controlsQ from "../../../assets/img/controlsQ.png";
// import controlsE from "../../../assets/img/controlsE.png";

let oldSavedInputs = {};

export default class MenuPanel extends Component {
   static propTypes = {
      selectedApp: PropTypes.object,
      loadScene: PropTypes.func,
      slidesManager: PropTypes.func,
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
      this.onHappyBtn = this.onHappyBtn.bind(this);
      this.renderDisplayModeToggle = this.renderDisplayModeToggle.bind(this);
      this.renderMenuFooter = this.renderMenuFooter.bind(this);
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
         dispatch(updatePlacements({accessToken, parsedInputs}));
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

      // slidesManager("MenuPanel");
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

   onHappyBtn(container = "") {
      const { saveClicked } = this.props;
      const { showHappyInfoBox } = this.state;
      if (!saveClicked) {
         if (container === "happyBtnCont") {
            if (!showHappyInfoBox) return;
         }
         this.setState({ showHappyInfoBox: !showHappyInfoBox });
      }
   }

   sceneChange(e) {
      const sceneName = e.target.value;
      let scene;
      const {
         loadScene,
         selectScene,
         dispatch,
         accessToken,
         selectedApp: { _id, scenes },
         activeClickedElem
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

         // Get scene's placements
         dispatch(getPlacements(_id, scene._id, accessToken));

         // Hide Menu panel
         // this.toggleSlide();

         // Change dropdown scene display
         this.setState({ selectedScene: sceneName });

         // Set Scene (parent parent component /Scene index) selectedScene state
         selectScene(scene);

         // Tell Panel (parent component /Panels index) that a scene was clicked
         activeClickedElem("sceneClicked");

         // Load webgl
         setTimeout(() => {
            loadScene();
         }, 1500);
      }
   }

   displayChange(e) {
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
         dispatch(updatePlacements({accessToken, parsedInputs}));
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
               className="mb"
            >
               {name}
            </MenuItem>
         );
      });

      return (
         <FormControl className="fw" id="scenesDropdown">
            <InputLabel htmlFor="scene-helper" className="mb">
               Scene selection
            </InputLabel>
            <Select
               value={selectedScene}
               onChange={this.sceneChange}
               input={<Input name="scene" id="scene-helper" />}
               //    disabled={isSceneLoading}
               className="mb"
            >
               <MenuItem value="" className="mb">
                  <em>Please select a scene</em>
               </MenuItem>
               {allScenes}
            </Select>
         </FormControl>
      );
   }

   renderDisplayModeToggle() {
      const { sceneLoadingError, displayMode } = this.props;
      const { selectedScene } = this.state;

      const style3D = displayMode === "3D" ? { background: "#f2f2f2" } : {};
      const styleRaw = displayMode === "raw" ? { background: "#f2f2f2" } : {};

      if (sceneLoadingError !== "") {
         style3D.opacity = 0.3;
      }

      const renderDisplayModeToggle =
         Object.keys(selectedScene).length > 0
            ? { opacity: 1 }
            : { opacity: 0 };

      //   const radiosStyle = isSceneLoading ? { opacity: 0.3 } : {};
      //   const radiosClass = isSceneLoading ? "forbidden-cursor" : "";

      return (
         <FormControl
            component="fieldset"
            id="displayRadios"
            style={renderDisplayModeToggle}
         >
            <FormLabel component="legend" className="mb">
               Display Mode
            </FormLabel>
            <RadioGroup
               aria-label="display"
               name="display1"
               value={displayMode}
               onChange={this.displayChange}
               //    style={radiosStyle}
               //    className={radiosClass}
            >
               <FormControlLabel
                  style={styleRaw}
                  value="raw"
                  control={<Radio className="hidden" />}
                  label={
                     <div className="radio-btn">
                        <FontAwesomeIcon className="faIcon" icon={faTable} />
                        <br />
                        Raw data
                     </div>
                  }
               />
               <FormControlLabel
                  style={style3D}
                  value="3D"
                  control={<Radio className="hidden" />}
                  disabled={sceneLoadingError !== ""}
                  label={
                     <div className="radio-btn">
                        <FontAwesomeIcon className="faIcon" icon={faCubes} />
                        <br />
                        3D
                     </div>
                  }
               />
            </RadioGroup>
            {sceneLoadingError && (
               <div id="sceneLoadErrorMssg" className="mb">
                  Tick Export OBJ to enable 3D view.
               </div>
            )}
         </FormControl>
      );
   }

   renderControls() {
      const { sceneMounted, displayMode } = this.props;
      let renderDisplayModeToggle;
      let fadeIn;
      if (sceneMounted && displayMode === "3D") {
         renderDisplayModeToggle = { opacity: 1 };
         fadeIn = "fadeIn";
      } else {
         renderDisplayModeToggle = { opacity: 0 };
         fadeIn = "";
      }

      return (
         <div
            className={`webglControls ${fadeIn}`}
            style={renderDisplayModeToggle}
         >
            <div className="cc">
               <span className="mb">Controls</span>
            </div>
            <div>
               <div style={{ justifyContent: "center" }}>
                  <div>
                     <MouseScroll />
                  </div>
                  <div>
                     <FontAwesomeIcon icon={faMousePointer} />
                  </div>
                  <div>
                     <RightClick />
                  </div>
                  {/* <div>
                     <img src={controlsE} alt="E" />
                  </div> */}
               </div>
               <div className="mb" style={{ justifyContent: "center" }}>
                  <div>Dolly</div>
                  <div>Orbit</div>
                  <div>Pan</div>
                  {/* <div>Down</div> */}
               </div>
            </div>
         </div>
      );
   }

   renderMenuFooter() {
      const { selectedApp } = this.props;
      const { appState, isActive, storeurl } = selectedApp;

      let footerMssg =
         appState === C.APP_STATES.pending ||
         appState === C.APP_STATES.inactive ||
         !isActive
            ? "Your app isn’t generating revenue yet"
            : "Your app is starting to generate revenue";

      let footerActiveMssg =
         appState !== undefined
            ? appState
            : storeurl !== undefined || storeurl !== ""
               ? C.APP_STATES.inactive
               : C.APP_STATES.pending;

      let footerStyle;

      switch (footerActiveMssg) {
         case C.APP_STATES.inactive:
            footerStyle = { background: "#a6a6a6" };
            break;
         case C.APP_STATES.pending:
            footerStyle = { background: "#ffc266" };
            break;
         default:
            footerStyle = { background: "#47a9eb" };
      }

      return (
         <div id="menu-panel-footer" className="mb" style={footerStyle}>
            <div>{footerMssg}</div>
            <div>
               <Switch
                  checked={isActive}
                  onChange={this.changeActive}
                  value="appState"
                  classes={{
                     switchBase: `switchBase-${footerActiveMssg}`,
                     checked: `checked-${footerActiveMssg}`,
                     bar: `bar-${footerActiveMssg}`
                  }}
               />
               <span>{footerActiveMssg}</span>
               {footerActiveMssg === C.APP_STATES.pending && (
                  <NavLink exact to={routeCodes.INFO} className="btn">
                     Add URL
                  </NavLink>
                  // <a
                  //    href={routeCodes.INFO}
                  //    target="_blank"
                  //    className="btn"
                  //    onClick={this.selectApp}
                  // >
                  //    Add URL
                  // </a>
               )}
            </div>
            <div>
               <NavLink exact to={routeCodes.MYAPPS} className="btn">
                  Back to dashboard
               </NavLink>
            </div>
         </div>
      );
   }

   render() {
      const { selectedApp } = this.props;

      const { slidedIn } = this.state;

      const slideAnim = slidedIn ? "slidePanelOutLeft" : "slidePanelInLeft";
      const arrow = slidedIn ? "right" : "left";

      return (
         <div className={`container panel ${slideAnim} menu-panel`}>
            <div
               className={`panel-toggle-btn cc ${arrow}`}
               onClick={this.toggleSlide}
            />

            <div className="container">
               <h3 className="st">Editing</h3>
               <br />
               <span className="mb">{selectedApp.name}</span>
            </div>

            <br />

            {this.renderScenesSelect()}

            <div
               id="happy-btn"
               //    onMouseLeave={this.onHappyBtn.bind(null, "happyBtnCont")}
            >
               {/* <div className="info-box" style={happyInfoBoxStyle}>
                  Configure your placements before finish editing
               </div>

               <h2 className="mb">Happy with all the scenes?</h2>
               <button className="btn btn-dark" onClick={this.updatePlacements}>
                  Save changes
               </button>
               <NavLink
                  exact
                  to={routeCodes.VALIDATION}
                  className="btn btn-dark"
               >
                  Finish Editing
               </NavLink> */}
            </div>

            {this.renderDisplayModeToggle()}

            {this.renderControls()}

            {this.renderMenuFooter()}
         </div>
      );
   }
}
