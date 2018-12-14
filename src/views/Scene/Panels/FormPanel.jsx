import React, { Component } from "react";
import PropTypes from "prop-types";
import { saveInputs } from "../../../actions/";

import Input from "@material-ui/core/Input";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { KeyboardArrowDown } from "@material-ui/icons";

import SVG from "../../../components/SVG";
import ToggleButton from "../../../components/ToggleButton";
import CSS from "../../../utils/InLineCSS";

import dbCategories from "./categories.json";
import dbSubCategories from "./subCategories.json";

export default class FormPanel extends Component {
  static propTypes = {
    onSave: PropTypes.func,
    dispatch: PropTypes.func,
    updateClickedPlacement: PropTypes.func,

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
    this.toggleActive = this.toggleActive.bind(this);
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
    const { clickedPlacement, displayMode } = nextProps;

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

    // only open, or keep opened, the panel if the display mode is 3D
    if (displayMode !== "raw") {
      this.setState({ savedInputs, slidedIn, subCategories });
    } else {
      this.setState({ savedInputs, subCategories });
    }
  }

  toggleSlide(forceAction) {
    let { slidedIn } = this.state;

    if (forceAction === "close") {
      // if it was already closed, don't close it
      !slidedIn && (slidedIn = true);
    } else if (forceAction === "open") {
      // if it was already open, don't open it
      slidedIn && (slidedIn = false);
    } else {
      slidedIn = !slidedIn;
    }

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

  toggleActive({ save }) {
    const { rawDataChangeActive } = this.props;
    const { savedInputs } = this.state;

    savedInputs.isActive = !savedInputs.isActive;
    this.setState({ savedInputs }, () => {
      if (save) {
        this.onSave();
        rawDataChangeActive({
          placementId: savedInputs.placementId,
          save: false
        });
      }
    });
  }

  onSave() {
    const { savedInputs } = this.state;
    const { dispatch, updateClickedPlacement } = this.props;

    updateClickedPlacement(savedInputs);
    dispatch(saveInputs(savedInputs));
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

  changeDropdownValue({ dropdown, save, newValue }, e) {
    const { rawDataChangeDropdownValue } = this.props;
    const { savedInputs } = this.state;
    const value = newValue ? newValue : e.target.value;
    const newState = { savedInputs };

    if (dropdown === "category") {
      newState.savedInputs.category = value;
      newState.subCategories = dbSubCategories[value] || [];
    } else {
      newState.savedInputs.subCategory = value;
    }

    this.setState(newState, () => {
      if (save) {
        this.onSave();
        rawDataChangeDropdownValue(
          {
            dropdown,
            save: false,
            placementId: savedInputs.placementId,
            newValue: value
          },
          e
        );
      }
    });
  }

  renderDropdown(input) {
    let { subCategories, savedInputs } = this.state;

    const toMap = input === "category" ? dbCategories : subCategories;

    const dropdown = toMap.map(item => {
      return (
        <MenuItem value={item} key={item} style={CSS.mb}>
          {item}
        </MenuItem>
      );
    });

    const value = !Array.isArray(savedInputs[input])
      ? savedInputs[input]
      : savedInputs[input][0];

    return (
      <Select
        value={value}
        onChange={this.changeDropdownValue.bind(null, {
          dropdown: input,
          save: true
        })}
        input={<Input name={input} id={`${input}-helper`} />}
        classes={{ root: "mui-select-root" }}
        disableUnderline={true}
        IconComponent={KeyboardArrowDown}
        style={CSS.mb}
      >
        <MenuItem value="" style={CSS.mb}>
          <em>
            Please select a {input === "category" ? "Category" : "Sub-Category"}
          </em>
        </MenuItem>
        {dropdown}
      </Select>
    );
  }

  renderActiveToggle() {
    const { savedInputs } = this.state;

    return (
      <ToggleButton
        inputName={"app-form"}
        isChecked={savedInputs.isActive}
        onChange={this.toggleActive.bind(null, { save: true })}
      />
    );
  }

  renderInputs() {
    const {
      placementTypeInfoBox,
      activeInfoBox,
      categoryInfoBox,
      savedInputs
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
          display = activeInfoBox ? { display: "block" } : { display: "none" };
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
            Here's some information about the {input} check button, so the user
            understands what he or she is clicking.
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
      <div id="form-panel-inputs">
        <div>
          <div className="mb">Name</div>
          <div className="mb">{savedInputs.placementName}</div>
        </div>
        <div>
          <div className="input-title mb">Format</div>
          <div className="text-truncate mb">{savedInputs.placementType}</div>
          {_q_icon("placementType")}
        </div>
        <div>
          <div className="input-title mb active-prop">Active</div>
          {this.renderActiveToggle()}
          {_q_icon("isActive")}
        </div>
        <div className="form-input-dropdown">
          <div className="input-title mb">Category</div>
          <div>{this.renderDropdown("category")}</div>
          {_q_icon("Category")}
        </div>
        <div className="form-input-dropdown">
          <div className="input-title mb">Sub-Category</div>
          <div>{this.renderDropdown("subCategory")}</div>
        </div>
      </div>
    );
  }

  render() {
    const { slidedIn } = this.state;
    const { sceneMounted, mouseOnPanel, displayMode } = this.props;

    const slideAnim = sceneMounted
      ? slidedIn === "closed"
        ? "closed"
        : slidedIn
        ? "slidePanelOutRight"
        : "slidePanelInRight"
      : "closed";
    const rotateAnim = slidedIn ? "rotate90" : "rotate270";

    if (!sceneMounted) {
      return <div />;
    }

    return (
      <div
        className={`panel ${slideAnim}`}
        id="scene-form-panel"
        onMouseEnter={mouseOnPanel}
        onMouseLeave={mouseOnPanel}
      >
        {displayMode === "3D" && (
          <div className={`panel-toggle-btn cc`} onClick={this.toggleSlide}>
            <div className={`${rotateAnim}`}>{SVG.caretDown}</div>
          </div>
        )}

        <div id="form-title">
          <div>
            <span className="mb" style={{ color: "#14B9BE" }}>
              Editing placement
            </span>
          </div>
        </div>

        {this.renderInputs()}

        <div id="form-footer">
          <div id="form-footer-text" className="mb">
            <span role="img" aria-label="bulb">
              💡
            </span>{" "}
            Click on other placements in the scene to edit!
          </div>
        </div>
      </div>
    );
  }
}
