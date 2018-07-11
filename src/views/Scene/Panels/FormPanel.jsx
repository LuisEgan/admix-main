import React, { Component } from "react";
import PropTypes from "prop-types";
import { saveInputs } from "../../../actions/";

import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

import thumbsUp from "../../../assets/img/Thumbs_Up_Hand_Sign_Emoji.png";

import dbCategories from "./categories.json";
import dbSubCategories from "./subCategories.json";

export default class FormPanel extends Component {
   static propTypes = {
      slidesManager: PropTypes.func,
      onSave: PropTypes.func,
      dispatch: PropTypes.func,
      updateClickedPlacement: PropTypes.func,
      activeClickedElem: PropTypes.func,

      selectedApp: PropTypes.object,
      selectedScene: PropTypes.object,
      clickedPlacement: PropTypes.object,

      savedApps: PropTypes.array,

      sceneMounted: PropTypes.bool
   };

   constructor(props) {
      super(props);

      this.state = {
         animating: false,
         slidedIn: "closed",
         placementTypeInfoBox: false,
         activeInfoBox: false,
         categoryInfoBox: false,
         publicInfoBox: false,
         publicText: "Public",
         focusedInput: "",
         feedbackClass: "",
         subCategories: [],

         savedInputs: {
            placementId: "",
            appId: "",
            sceneId: "",
            placementName: "",
            placementType: "",
            isActive: true,
            category: "Category",
            subCategory: "Sub-Category"
         }
      };

      this.toggleSlide = this.toggleSlide.bind(this);
      this.changeDropdownValue = this.changeDropdownValue.bind(this);
      this.renderDropdown = this.renderDropdown.bind(this);
      this.renderActiveToggle = this.renderActiveToggle.bind(this);
      this.renderInputs = this.renderInputs.bind(this);
      this.toggleInfoBox = this.toggleInfoBox.bind(this);
      this.handleActiveChange = this.handleActiveChange.bind(this);
      this.onSave = this.onSave.bind(this);
      this.resetInputs = this.resetInputs.bind(this);
   }

   componentDidMount() {
      window.savedInputs = [];
      window.savedInputsNames = [];
   }

   componentWillReceiveProps(nextProps) {
      let { savedInputs, slidedIn } = this.state;
      const oldClickedPlacement = this.props.clickedPlacement;
      const { clickedPlacement } = nextProps;

      const propsToSave = [
         "appId",
         "sceneId",
         "placementId",
         "placementName",
         "placementType",
         "isActive",
         "category",
         "subCategory",
         "addedPrefix"
      ];

      if (
         !!clickedPlacement.placementName &&
         oldClickedPlacement.placementName !== clickedPlacement.placementName
      ) {
         propsToSave.forEach(prop => {
            savedInputs[prop] = clickedPlacement[prop];
         });

         slidedIn = false;
      }

      const subCategories = dbSubCategories[savedInputs.category]
         ? dbSubCategories[savedInputs.category]
         : [];

      this.setState({ savedInputs, slidedIn, subCategories });
   }

   toggleSlide() {
      let { slidedIn } = this.state;
      slidedIn = !slidedIn;
      // slidesManager("FormPanel");
      this.setState({ slidedIn });
   }

   toggleInfoBox(input) {
      switch (input) {
         case "placementType":
            const placementTypeInfoBox = !this.state.placementTypeInfoBox;
            this.setState({ placementTypeInfoBox });
            break;
         case "isActive":
            const activeInfoBox = !this.state.activeInfoBox;
            this.setState({ activeInfoBox });
            break;
         case "Category":
            const categoryInfoBox = !this.state.categoryInfoBox;
            this.setState({ categoryInfoBox });
            break;

         default:
      }
   }

   handleActiveChange(input, e) {
      const { savedInputs } = this.state;
      let {
         target: { value }
      } = e;

      if (input === "isActive") {
         value = e.target.checked;
      }

      console.log("savedInputs: ", savedInputs);
      savedInputs[input] = value;
      this.setState({ savedInputs, animating: true });
      this.onSave();

      setTimeout(() => {
         this.setState({ animating: false });
      }, 1000);
   }

   onSave() {
      const { savedInputs } = this.state;
      const {
         dispatch,
         updateClickedPlacement,
         activeClickedElem
      } = this.props;

      updateClickedPlacement(savedInputs);
      dispatch(saveInputs(savedInputs));

      this.setState({ feedbackClass: "feedback" });
      setTimeout(() => {
         this.setState({ feedbackClass: "" });
      }, 2300);

      activeClickedElem("saveClicked");
   }

   resetInputs() {
      const { placementName } = this.state;
      const savedInputs = {
         appId: "",
         sceneId: "",
         placementName,
         placementType: "",
         isActive: true,
         Public: true,
         Default: "",
         category: "Category",
         subCategory: "Sub-Category",
         Preferred: "",
         Blacklisted: ""
      };
      this.setState({ savedInputs });
   }

   changeDropdownValue(dropdown, e) {
      const { value } = e.target;
      const { savedInputs } = this.state;
      const newState = { savedInputs };

      if (dropdown === "category") {
         newState.savedInputs.category = value;
         newState.subCategories = dbSubCategories[value];
      } else {
         newState.savedInputs.subCategory = value;
      }

      this.setState(newState);
      this.onSave();
   }

   renderDropdown(input) {
      let { subCategories, savedInputs } = this.state;

      const toMap = input === "category" ? dbCategories : subCategories;

      const dropdown = toMap.map(item => {
         return (
            <MenuItem value={item} key={item} className="mb">
               {item}
            </MenuItem>
         );
      });

      return (
         <FormControl className="fw">
            <InputLabel htmlFor={`${input}-helper`} className="mb">
               {input === "category" ? "Category" : "Sub-Category"}
            </InputLabel>
            <Select
               value={
                  !Array.isArray(savedInputs[input])
                     ? savedInputs[input]
                     : savedInputs[input][0]
               }
               onChange={this.changeDropdownValue.bind(null, input)}
               input={<Input name={input} id={`${input}-helper`} />}
               className="mb"
            >
               <MenuItem value="" className="mb">
                  <em>
                     Please select a{" "}
                     {input === "category" ? "Category" : "Sub-Category"}
                  </em>
               </MenuItem>
               {dropdown}
            </Select>
         </FormControl>
      );
   }

   renderActiveToggle() {
      const { savedInputs, animating } = this.state;
      const labelStyle = animating ? { opacity: 0.7 } : { opacity: 1 };

      return (
         <div id="form-panel-active-switch">
            <div className="active-switch clearfix toggleBtn">
               <div className="toggles">
                  <input
                     type="checkbox"
                     name="formPanelToggle"
                     id="formPanelToggle"
                     className="ios-toggle"
                     checked={savedInputs.isActive}
                     onChange={this.handleActiveChange.bind(null, "isActive")}
                     disabled={animating}
                  />
                  <label
                     htmlFor="formPanelToggle"
                     className="checkbox-label"
                     data-on=""
                     data-off=""
                     style={labelStyle}
                  />
               </div>
            </div>
         </div>
      );
   }

   renderInputs() {
      const {
         placementTypeInfoBox,
         activeInfoBox,
         categoryInfoBox,
         savedInputs,
         feedbackClass
      } = this.state;

      const _q_icon = input => {
         let display;
         let top = {};
         switch (input) {
            case "placementType":
               display = placementTypeInfoBox
                  ? { display: "block" }
                  : { display: "none" };
               break;
            case "isActive":
               display = activeInfoBox
                  ? { display: "block" }
                  : { display: "none" };
               // top = { top: "35%" };
               break;
            case "Category":
               display = categoryInfoBox
                  ? { display: "block" }
                  : { display: "none" };
               break;
            default:
         }
         const style = display;
         return (
            <div className="question-icon" style={top}>
               <div className="info-box" style={style} id={`${input}-info-box`}>
                  Here's some information about the {input} check button, so the
                  user understands what he or she is clicking.
               </div>
               <i
                  className="fa fa-question-circle"
                  aria-hidden="true"
                  onMouseEnter={this.toggleInfoBox.bind(null, input)}
                  onMouseLeave={this.toggleInfoBox.bind(null, input)}
               />
            </div>
         );
      };

      return (
         <div id="inputs-container">
            <div className="input-container">
               <div className="input-title mb">Name</div>
               <div id="input-placement-name" className="mb">
                  {savedInputs.placementName}
               </div>
            </div>
            <div className="input-container">
               {_q_icon("placementType")}
               <div className="input-title mb">Format</div>
               <div className="text-truncate mb">
                  {savedInputs.placementType}
               </div>
            </div>
            <div className="input-container">
               {_q_icon("isActive")}
               <div className="input-title mb active-prop">Active</div>
               {this.renderActiveToggle()}
            </div>
            <div className="input-container column">
               {_q_icon("Category")}
               <div>{this.renderDropdown("category")}</div>
            </div>
            <div className="input-container column">
               <div>{this.renderDropdown("subCategory")}</div>
            </div>
            <div className="input-container cc">
               <div id="input-save-feedback" className={feedbackClass}>
                  Saved!
                  <img src={thumbsUp} alt="Thumbs Up!" />
               </div>
            </div>
         </div>
      );
   }

   render() {
      const { slidedIn } = this.state;
      const { sceneMounted, mouseOnPanel } = this.props;

      const slideAnim = sceneMounted
         ? slidedIn === "closed"
            ? "closed"
            : slidedIn
               ? "slidePanelOutRight"
               : "slidePanelInRight"
         : "closed";
      const arrow = slidedIn ? "left" : "right";

      if (!sceneMounted) {
         return <div />;
      }

      return (
         <div
            className={`container panel ${slideAnim}`}
            id="form-panel"
            onMouseEnter={mouseOnPanel}
            onMouseLeave={mouseOnPanel}
         >
            <div
               className={`panel-toggle-btn cc ${arrow}`}
               onClick={this.toggleSlide}
            />

            <h3 className="st">Edit placement</h3>

            <div id="form-panel-inputs">{this.renderInputs()}</div>

            <div id="form-footer">
               <div id="form-footer-separator" />
               <div id="form-footer-text" className="mb">
                  Click on other placements in the scene to edit!
               </div>
            </div>
         </div>
      );
   }
}
