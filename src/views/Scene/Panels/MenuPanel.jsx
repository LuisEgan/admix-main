import React, { Component } from "react";
import { Redirect, NavLink } from "react-router-dom";
import { routeCodes } from "../../../config/routes";
import PropTypes from "prop-types";
import { getPlacements, resetSelectedApp } from "../../../actions/";

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faMousePointer from "@fortawesome/fontawesome-free-solid/faMousePointer";

import controlsArrows from "../../../assets/img/controlsArrows.png";
import controlsQ from "../../../assets/img/controlsQ.png";
import controlsE from "../../../assets/img/controlsE.png";

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
         slidedIn: false,
         selectedScene: "",
         showHappyInfoBox: false,
         showDdScenes: false
      };

      this.toggleSlide = this.toggleSlide.bind(this);
      this.goBack = this.goBack.bind(this);
      this.sceneOnClick = this.sceneOnClick.bind(this);
      this.toggleDropdowns = this.toggleDropdowns.bind(this);
      this.onHappyBtn = this.onHappyBtn.bind(this);
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

   sceneOnClick(scene) {
      const {
         loadScene,
         selectScene,
         dispatch,
         accessToken,
         selectedApp: { _id },
         activeClickedElem
      } = this.props;
      const sceneId = scene._id;

      // Get scene's placements
      dispatch(getPlacements(_id, sceneId, accessToken));

      // Hide Menu panel
      // this.toggleSlide();

      // Change dropdown scene display
      this.setState({ selectedScene: scene.name });

      // Set Scene (parent parent component /Scene index) selectedScene state
      selectScene(scene);

      // Tell Panel (parent component /Panels index) that a scene was clicked
      activeClickedElem("sceneClicked");

      // Load webgl
      setTimeout(() => {
         loadScene();
      }, 1500);
   }

   toggleDropdowns(forceClose = false) {
      const { forceCloseFormPanel } = this.props;
      let { showDdScenes } = this.state;
      forceCloseFormPanel();
      showDdScenes = forceClose ? false : !showDdScenes;
      this.setState({ showDdScenes });
   }

   renderScenesSelect() {
      const { asyncLoading, selectedApp } = this.props;
      let { selectedScene, showDdScenes } = this.state;
      const { scenes } = selectedApp;
      const loadingIcon = <p>Loading...</p>;
      let dropdown = "";

      dropdown = scenes.map(scene => {
         const { name } = scene;
         return (
            <a
               className="dropdown-item"
               onClick={this.sceneOnClick.bind(null, scene)}
               key={name}
            >
               {name}
            </a>
         );
      });

      if (asyncLoading) {
         dropdown = loadingIcon;
      }

      if (selectedScene.length === 0) {
         selectedScene = "Select your scene";
      }

      let showDropdown = showDdScenes ? "show" : "";

      return (
         <div
            className="btn-group"
            onMouseLeave={this.toggleDropdowns.bind(null, true)}
         >
            <button type="button" className="btn btn-secondary dropdown-title">
               {selectedScene}
            </button>
            <button
               type="button"
               className="btn btn-secondary dropdown-toggle dropdown-toggle-split"
               onClick={this.toggleDropdowns.bind(null, false)}
            >
               <span className="sr-only">{selectedScene}</span>
            </button>
            <div
               className={`dropdown-menu ${showDropdown}`}
               onMouseLeave={this.toggleDropdowns.bind(null, true)}
            >
               {dropdown}
            </div>
         </div>
      );

      // return scenes.map( scene => {
      //     const { name } = scene;
      //     return <button className="btn btn-light" onClick={this.sceneOnClick.bind(null, scene)} key={name}>{name}</button>
      // });
   }

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

   renderControls() {
      return (
         <div className="webglControls fadeIn">
            <div className="cc">
               <span className="mb">Controls</span>
            </div>
            <div>
               <div>
                  <div>
                     <img src={controlsArrows} alt="Arrows" />
                  </div>
                  <div>
                     <img src={controlsQ} alt="Q" />
                  </div>
                  <div>
                     <img src={controlsE} alt="E" />
                  </div>
                  <div>
                     <FontAwesomeIcon icon={faMousePointer} />
                  </div>
               </div>
               <div className="mb">
                  <div>Move</div>
                  <div>Up</div>
                  <div>Down</div>
                  <div>Rotate</div>
               </div>
            </div>
         </div>
      );
   }

   render() {
      const {
         selectedApp,
         location,
         mouseOnPanel,
         saveClicked,
         sceneMounted
      } = this.props;

      if (!selectedApp || Object.keys(selectedApp).length < 3) {
         alert("No app selected!");
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

      const slideAnim = slidedIn ? "slideOutLeft" : "slideInLeft";
      const arrow = slidedIn ? "right" : "left";

      const happyInfoBoxStyle = showHappyInfoBox
         ? { display: "block" }
         : { display: "none" };

      return (
         <div
            className={`container panel ${slideAnim} menu-panel`}
            onMouseEnter={mouseOnPanel}
            onMouseLeave={mouseOnPanel}
         >
            <div
               className={`panel-toggle-btn cc ${arrow}`}
               onClick={this.toggleSlide}
            />

            <div className="container">
               <h3 className="st">Editing</h3>
               <br />
               <span>{selectedApp.name}</span>
            </div>

            <br />

            {this.renderScenesSelect()}

            <hr />

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
               {/* {saveClicked && (
                  <NavLink
                     exact
                     to={routeCodes.VALIDATION}
                     className="btn btn-dark"
                  >
                     Finish Editing
                  </NavLink>
               )}

               {!saveClicked && (
                  <div
                     id="disabledBtnContainer"
                     onMouseEnter={this.onHappyBtn}
                     onMouseLeave={this.onHappyBtn}
                  >
                     <button className="btn btn-dark" disabled>
                        Finish Editing
                     </button>
                  </div>
               )} */}
            </div>

            {sceneMounted && this.renderControls()}
         </div>
      );
   }
}
