import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import MenuPanel from "./MenuPanel";
import FormPanel from "./FormPanel";

// @connect(state => ({
//   asyncLoading: state.app.get("asyncLoading"),
//   selectedApp: state.app.get("selectedApp"),
//   savedApps: state.app.get("savedApps"),
//   accessToken: state.app.get("accessToken"),
//   savedInputs: state.app.get("savedInputs")
// }))
class Panels extends Component {
   static propTypes = {
      asyncLoading: PropTypes.bool,
      selectedApp: PropTypes.object,
      accessToken: PropTypes.string,
      disableControls: PropTypes.func,
      enableControls: PropTypes.func,
      loadScene: PropTypes.func,
      selectedScene: PropTypes.object,
      dispatch: PropTypes.func,
      savedInputs: PropTypes.array,
      clickedPlacement: PropTypes.object,
      sceneMounted: PropTypes.bool,
      mouseOnPanel: PropTypes.func,
      updateClickedPlacement: PropTypes.func
   };

   constructor(props) {
      super(props);

      // If true = panel is slided in
      this.state = {
         MenuPanel: false,
         Instructions: false,
         FormPanel: false,
         selectedScene: "",
         sceneClicked: false,
         saveClicked: false
      };

      this.slidesManager = this.slidesManager.bind(this);
      this.activeClickedElem = this.activeClickedElem.bind(this);
      this.forceCloseFormPanel = this.forceCloseFormPanel.bind(this);
   }

   slidesManager(panel) {
      let state = this.state;
      state[panel] = !state[panel];

      // Close Information Panel ONLY when a scene is clicked.
      if (panel === "MenuPanel") {
         state.sceneClicked = state[panel] ? state.sceneClicked : false;
      }
      this.setState(state);
   }

   activeClickedElem(elem) {
      const state = this.state;
      state[elem] = true;
      this.setState(state);
   }

   // MENU PANEL METHODS -------------------------------------

   // FORM PANEL METHODS -------------------------------------

   forceCloseFormPanel() {
      this.FormPanel.forceClose();
   }

   renderFormDropdown(input) {
      this.FormPanel.renderDropdown(input);
   }

   renderFormActiveToggle() {
      this.FormPanel.renderActiveToggle();
   }

   render() {
      const {
         asyncLoading,
         selectedApp,
         savedApps,
         loadScene,
         dispatch,
         accessToken,
         selectScene,
         selectedScene,
         onSave,
         clickedPlacement,
         sceneMounted,
         mouseOnPanel,
         updateClickedPlacement,
         setDisplayMode
      } = this.props;

      const { saveClicked } = this.state;

      return (
         <div>
            <MenuPanel
               asyncLoading={asyncLoading}
               mouseOnPanel={mouseOnPanel}
               loadScene={loadScene}
               dispatch={dispatch}
               selectedApp={selectedApp}
               slidesManager={this.slidesManager}
               selectScene={selectScene}
               accessToken={accessToken}
               activeClickedElem={this.activeClickedElem}
               saveClicked={saveClicked}
               sceneMounted={sceneMounted}
               forceCloseFormPanel={this.forceCloseFormPanel}
               setDisplayMode={setDisplayMode}
            />

            <FormPanel
               ref={i => (this.FormPanel = i)}
               mouseOnPanel={mouseOnPanel}
               slidesManager={this.slidesManager}
               selectedApp={selectedApp}
               dispatch={dispatch}
               selectedScene={selectedScene}
               savedApps={savedApps}
               onSave={onSave}
               clickedPlacement={clickedPlacement}
               sceneMounted={sceneMounted}
               updateClickedPlacement={updateClickedPlacement}
               activeClickedElem={this.activeClickedElem}
            />
         </div>
      );
   }
}

const mapStateToProps = state => ({
   asyncLoading: state.app.get("asyncLoading"),
   selectedApp: state.app.get("selectedApp"),
   savedApps: state.app.get("savedApps"),
   accessToken: state.app.get("accessToken"),
   savedInputs: state.app.get("savedInputs")
});

export default connect(mapStateToProps)(Panels);
