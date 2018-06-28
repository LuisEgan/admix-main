import React, { Component } from "react";
import PropTypes from "prop-types";
import { saveInputs } from "../../../actions/";

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
      this.hardUnfocus = this.hardUnfocus.bind(this);
      this.renderInputs = this.renderInputs.bind(this);
      this.selectCategory = this.selectCategory.bind(this);
      this.selectSubCategory = this.selectSubCategory.bind(this);
      this.toggleInfoBox = this.toggleInfoBox.bind(this);
      this.toggleDropdowns = this.toggleDropdowns.bind(this);
      this.focusInput = this.focusInput.bind(this);
      this.resetInputFocus = this.resetInputFocus.bind(this);
      this.handleOnChange = this.handleOnChange.bind(this);
      this.onSave = this.onSave.bind(this);
      this.resetInputs = this.resetInputs.bind(this);
      this.forceClose = this.forceClose.bind(this);
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

   hardUnfocus(input) {
      this[input].blur();
   }

   toggleSlide() {
      let { slidedIn } = this.state;
      slidedIn = !slidedIn;
      // slidesManager("FormPanel");
      this.setState({ slidedIn });
   }

   selectCategory(category) {
      const { savedInputs, subCategories } = this.state;
      savedInputs.category = category;

      const newSubCategories = dbSubCategories[category];

      // If the sub-category does not belong in the category, clear it
      let sameSubcategories = true;
      subCategories.some((subCat, i) => {
         if (subCat !== dbSubCategories[category][i]) {
            sameSubcategories = false;
            return true;
         }
         return false;
      });

      if (!sameSubcategories) {
         savedInputs.subCategory = "Sub-Category";
      }

      this.setState({
         savedInputs,
         subCategories: newSubCategories,
         showDdCats: false
      });
      this.onSave();
   }

   selectSubCategory(subCategory) {
      const { savedInputs } = this.state;
      savedInputs.subCategory = subCategory;

      this.setState({ savedInputs, showDdSubCats: false });
      this.onSave();
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

   toggleDropdowns(input, forceClose = false) {
      let { showDdCats, showDdSubCats } = this.state;

      if (input === "category") {
         showDdCats = forceClose ? false : !showDdCats;
         this.setState({ showDdCats });
      } else {
         showDdSubCats = forceClose ? false : !showDdSubCats;
         this.setState({ showDdSubCats });
      }
   }

   focusInput(input) {
      if (input !== "Name") {
         this.setState({ focusedInput: input });
         this[input].focus();
      }
   }

   resetInputFocus() {
      const { focusedInput } = this.state;
      if (!!this[focusedInput]) {
         this[focusedInput].blur();
         this.setState({ focusedInput: "" });
      }
   }

   handleOnChange(input, e) {
      const { savedInputs } = this.state;
      let {
         target: { value }
      } = e;

      if (input === "isActive") {
         value = e.target.checked;
      }

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

   forceClose() {
      const { slidedIn } = this.state;

      if (slidedIn) {
         this.setState({ slidedIn: "closed" });
      } else {
         this.setState({ slidedIn: true });
         setTimeout(() => {
            this.setState({ slidedIn: "closed" });
         }, 600);
      }
   }

   renderInputs() {
      const {
         placementTypeInfoBox,
         activeInfoBox,
         categoryInfoBox,
         savedInputs,
         feedbackClass,
         animating
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

      const dropdown = function(input) {
         let {
            savedInputs: { category, subCategory },
            subCategories,
            showDdCats,
            showDdSubCats
         } = this.state;

         const categories = dbCategories.map(
            function(cat) {
               return (
                  <a
                     className="dropdown-item mb"
                     onClick={this.selectCategory.bind(null, cat)}
                     key={cat}
                  >
                     {cat}
                  </a>
               );
            }.bind(this)
         );

         subCategories = subCategories.map(
            function(cat) {
               return (
                  <a
                     className="dropdown-item mb"
                     onClick={this.selectSubCategory.bind(null, cat)}
                     key={cat}
                  >
                     {cat}
                  </a>
               );
            }.bind(this)
         );

         let title =
            input === "category"
               ? category === undefined
                  ? "Category"
                  : category
               : subCategory === undefined
                  ? "Sub-Category"
                  : subCategory;

         const dropdown = input === "category" ? categories : subCategories;

         let showDropdown = input === "category" ? showDdCats : showDdSubCats;
         showDropdown = showDropdown ? "show" : "";

         return (
            <div
               className="btn-group"
               onMouseLeave={this.toggleDropdowns.bind(null, input, true)}
            >
               <button type="button" className="btn btn-secondary btn-name mb">
                  {title}
               </button>
               <button
                  type="button"
                  className="btn btn-secondary dropdown-toggle dropdown-toggle-split mb"
                  onClick={this.toggleDropdowns.bind(null, input, false)}
               >
                  <span className="sr-only">{title}</span>
               </button>
               <div
                  className={`dropdown-menu ${showDropdown}`}
                  onMouseLeave={this.toggleDropdowns.bind(null, input, true)}
               >
                  {dropdown}
               </div>
            </div>
         );
      }.bind(this);

      const labelStyle = animating ? { opacity: 0.7 } : { opacity: 1 };
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
               <div id="form-panel-active-switch">
                  <div className="active-switch clearfix toggleBtn">
                     <div className="toggles">
                        <input
                           type="checkbox"
                           name="formPanelToggle"
                           id="formPanelToggle"
                           className="ios-toggle"
                           checked={savedInputs.isActive}
                           onChange={this.handleOnChange.bind(null, "isActive")}
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
                     {/* <label className="switch">
              <input
                type="checkbox"
                checked={savedInputs.isActive}
                onChange={this.handleOnChange.bind(null, "isActive")}
              />
              <span className="slider round" />
            </label> */}
                  </div>
               </div>
            </div>
            <div className="input-container column">
               {_q_icon("Category")}
               <div className="input-title mb">Category</div>
               <div>{dropdown("category")}</div>
            </div>
            <div className="input-container column">
               <div className="input-title mb">Sub-Category</div>
               <div>{dropdown("subCategory")}</div>
            </div>
            <div className="input-container cc">
               {/* <button className="submit" onClick={this.onSave}>Save</button> */}
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
               ? "slideOutRight"
               : "slideInRight"
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
