import React, { Component } from "react";
import { Redirect, NavLink } from "react-router-dom";
import { routeCodes } from "../../../config/routes";
import PropTypes from "prop-types";
import { getPlacements, resetSelectedApp } from "../../../actions/";

import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormLabel from "@material-ui/core/FormLabel";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faMousePointer from "@fortawesome/fontawesome-free-solid/faMousePointer";
import faCubes from "@fortawesome/fontawesome-free-solid/faCubes";
import faTable from "@fortawesome/fontawesome-free-solid/faTable";

import MouseScroll from "../../../components/SVG/MouseScroll";
import RightClick from "../../../components/SVG/RightClick";

// import controlsArrows from "../../../assets/img/controlsArrows.png";
// import controlsQ from "../../../assets/img/controlsQ.png";
// import controlsE from "../../../assets/img/controlsE.png";

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
         displayMode: "3D",
         slidedIn: false,
         selectedScene: "",
         showHappyInfoBox: false,
         showDdScenes: false
      };

      this.toggleSlide = this.toggleSlide.bind(this);
      this.goBack = this.goBack.bind(this);
      this.sceneChange = this.sceneChange.bind(this);
      this.displayChange = this.displayChange.bind(this);
      this.toggleDropdowns = this.toggleDropdowns.bind(this);
      this.onHappyBtn = this.onHappyBtn.bind(this);
      this.renderDisplayModeToggle = this.renderDisplayModeToggle.bind(this);
   }

   toggleSlide() {
      const slidedIn = !this.state.slidedIn;

      // slidesManager("MenuPanel");
      this.setState({ slidedIn });
   }

   goBack() {
      const { dispatch } = this.props;
      dispatch(resetSelectedApp());
   }

   toggleDropdowns(forceClose = false) {
      const { forceCloseFormPanel } = this.props;
      let { showDdScenes } = this.state;
      forceCloseFormPanel();
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

   displayChange(e) {
      const { setDisplayMode } = this.props;
      this.setState({ displayMode: e.target.value });

      // for /Scene (grandparent) to know which display mode is selected
      setDisplayMode(e.target.value);
   }

   renderScenesSelect() {
      const { selectedApp } = this.props;
      let { selectedScene } = this.state;
      const { scenes } = selectedApp;

      const allScenes = scenes.map(scene => {
         const { name } = scene;
         return (
            <MenuItem value={name} key={name} className="mb">
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
      const { asyncLoading } = this.props;
      const { displayMode } = this.state;

      const style3D = displayMode === "3D" ? { background: "#f2f2f2" } : {};
      const styleRaw = displayMode === "raw" ? { background: "#f2f2f2" } : {};

      return (
         <FormControl component="fieldset" id="displayRadios">
            <FormLabel component="legend" className="mb">
               Display Mode
            </FormLabel>
            <RadioGroup
               aria-label="display"
               name="display1"
               value={displayMode}
               onChange={this.displayChange}
            >
               <FormControlLabel
                  style={style3D}
                  value="3D"
                  control={<Radio className="hidden" />}
                  disabled={asyncLoading}
                  label={
                     <div className="radio-btn">
                        <FontAwesomeIcon className="faIcon" icon={faCubes} />
                        <br />
                        3D
                     </div>
                  }
               />
               <FormControlLabel
                  style={styleRaw}
                  value="raw"
                  control={<Radio className="hidden" />}
                  disabled={asyncLoading}
                  label={
                     <div className="radio-btn">
                        <FontAwesomeIcon className="faIcon" icon={faTable} />
                        <br />
                        Raw data
                     </div>
                  }
               />
            </RadioGroup>
         </FormControl>
      );
   }

   renderControls() {
      return (
         <div className="webglControls fadeIn">
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

   render() {
      const { selectedApp, location, sceneMounted } = this.props;
      const { displayMode } = this.state;

      if (!selectedApp || Object.keys(selectedApp).length < 3) {
         return (
            <Redirect
               to={{
                  pathname: routeCodes.SETUP,
                  state: { from: location }
               }}
            />
         );
      }

      const { slidedIn, showHappyInfoBox } = this.state;

      const slideAnim = slidedIn ? "slidePanelOutLeft" : "slidePanelInLeft";
      const arrow = slidedIn ? "right" : "left";

      const happyInfoBoxStyle = showHappyInfoBox
         ? { display: "block" }
         : { display: "none" };

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

            <br />

            <div
               id="happy-btn"
               onMouseLeave={this.onHappyBtn.bind(null, "happyBtnCont")}
            >
               <div className="info-box" style={happyInfoBoxStyle}>
                  Configure your placements before finish editing
               </div>

               <h2 className="mb">Happy with all the scenes?</h2>
               <NavLink
                  exact
                  to={routeCodes.VALIDATION}
                  className="btn btn-dark"
               >
                  Finish Editing
               </NavLink>
            </div>

            {this.renderDisplayModeToggle()}

            {sceneMounted && displayMode === "3D" && this.renderControls()}
         </div>
      );
   }
}
