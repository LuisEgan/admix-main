import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import _ from "lodash";

import ToggleDisplay from "react-toggle-display";
import DayPickerInput from "react-day-picker/DayPickerInput";
import "../../../node_modules/react-day-picker/lib/style.css";

import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faTrash from "@fortawesome/fontawesome-free-solid/faTrash";

import Overview from "./Components/Overview";
import Performance from "./Components/Performance";
import Analytics from "./Components/Analytics";

import WebGLScene from "../WebGLScene";

const addDays = function(date, days) {
   var dat = new Date(date);
   dat.setDate(dat.getDate() + days);
   return dat;
};

const takeDays = function(date, days) {
   var dat = new Date(date);
   dat.setDate(dat.getDate() - days);
   return dat;
};

// @connect(state => ({
//   apps: state.app.get("apps"),
//   userData: state.app.get("userData"),
//   reportData: state.app.get("reportData"),
//   initialReportAppId: state.app.get("initialReportAppId"),
//   isLoad_webgl: state.app.get("load_webgl")
// }))
class Report extends Component {
   static propTypes = {
      dispatch: PropTypes.func
   };

   constructor(props) {
      super(props);

      this.state = {
         show: "pe",
         from: new Date(),
         to: new Date(),
         doLoadScene: false,
         isSceneLoaded: false,
         isLoadingScene: false,
         progressLoadingScene: 0,
         userApps: {},
         selectedApps: {},
         allAppsSelected: false
      };

      this.filteredData = this.filteredData.bind(this);
      this.previousPeriods = this.previousPeriods.bind(this);
      this.changeView = this.changeView.bind(this);
      this.show = this.show.bind(this);
      this.changeDate = this.changeDate.bind(this);
      this.quickFilter = this.quickFilter.bind(this);
      this.doLoadScene = this.doLoadScene.bind(this);
      this.moveCamera = this.moveCamera.bind(this);
      this.TrackballControlsEnableWheel = this.TrackballControlsEnableWheel.bind(
         this
      );
      this.TrackballControlsDisableWheel = this.TrackballControlsDisableWheel.bind(
         this
      );
      this.noPointerLockControlsRotation = this.noPointerLockControlsRotation.bind(
         this
      );
      this.yesPointerLockControlsRotation = this.yesPointerLockControlsRotation.bind(
         this
      );

      this.addEventListeners = this.addEventListeners.bind(this);
      this.disposeEventListeners = this.disposeEventListeners.bind(this);

      this.confirmSceneLoaded = this.confirmSceneLoaded.bind(this);
      this.isLoadingScene = this.isLoadingScene.bind(this);
      this.progressLoadingScene = this.progressLoadingScene.bind(this);
      this.changeAppSelection = this.changeAppSelection.bind(this);
   }

   componentDidMount() {
      const { apps, initialReportAppId } = this.props;
      let selectedApps = {};
      let allAppsSelected = false;
      this.quickFilter("a");

      const userApps = {};
      apps.forEach(app => {
         userApps[app._id] = app.name;
      });

      initialReportAppId.forEach(appId => {
         selectedApps[appId] = userApps[appId];
      });

      if (Object.keys(selectedApps).length === Object.keys(userApps).length) {
         allAppsSelected = true;
      }

      // for test
      // userApps["c882ce87-d8eb-45c0-b6ef-2cade5bb8fdc"] = "AYY LMAO";

      this.setState({ userApps, selectedApps, allAppsSelected });
   }

   componentWillUnmount() {
      this.disposeEventListeners();
   }

   // =========
   // WebGL Methods
   // =========
   doLoadScene(selectedScene) {
      this.webGL.loadScene(selectedScene);
   }

   moveCamera(selectedPlacement) {
      this.webGL.moveCamera(selectedPlacement);
   }

   TrackballControlsEnableWheel() {
      this.webGL.TrackballControlsEnableWheel();
   }

   TrackballControlsDisableWheel() {
      this.webGL.TrackballControlsDisableWheel();
   }

   confirmSceneLoaded(isSceneLoaded) {
      this.setState({ isSceneLoaded });
   }

   isLoadingScene(isLoading) {
      this.setState({ isLoadingScene: isLoading });
   }

   progressLoadingScene(loadingProgress) {
      this.setState({ progressLoadingScene: loadingProgress });
   }

   noPointerLockControlsRotation() {
      this.webGL.noPointerLockControlsRotation();
   }
   yesPointerLockControlsRotation() {
      this.webGL.yesPointerLockControlsRotation();
   }

   addEventListeners() {
      this.webGL.addEventListeners();
   }

   disposeEventListeners() {
      this.webGL.disposeEventListeners();
   }

   // =========
   // Date manipulation
   // =========
   parseDate(date) {
      return date.toISOString().split("T")[0];
   }

   getDates = (startDate, stopDate) => {
      const dateArray = [];
      let currentDate = startDate;
      let daysInterval = 0;
      while (currentDate <= stopDate) {
         dateArray.push(currentDate);
         currentDate = addDays(currentDate, 1);
         daysInterval++;
      }

      const sameDate =
         startDate.toString().slice(0, 15) === stopDate.toString().slice(0, 15);
      if (daysInterval === 0 && sameDate) {
         dateArray.push(currentDate);
      }
      return { dates: dateArray, daysInterval };
   };

   changeDate(type, date, modifiers) {
      let newState = type === "from" ? { from: date } : { to: date };
      this.setState(newState);
   }

   // =========
   // Data manipulation
   // =========
   filteredData(customFrom = null, customTo = null) {
      const { reportData } = this.props;
      const { from, to, selectedApps } = this.state;

      const filteredDates =
         customFrom && customTo
            ? this.getDates(customFrom, customTo).dates
            : this.getDates(from, to).dates;

      let filteredDataObj = {};

      if (!_.isEmpty(reportData)) {
         console.log("\n\n================================\n\n");
         console.log("reportData: ", reportData);
         filteredDates.forEach(date => {
            const parsedDate = this.parseDate(date);
            console.log("parsedDate: ", parsedDate);
            console.log(
               "reportData[" + parsedDate + "]: ",
               reportData[parsedDate]
            );

            // check if there's data (from db) in the date specified by user
            if (reportData[parsedDate]) {
               console.log("IN");
               // loop through each app data in each report date specified by user
               for (let appId in reportData[parsedDate]) {
                  // check if the app is among the selected apps by the user
                  if (selectedApps[appId]) {
                     console.log("IN - IN");

                     if (!filteredDataObj[parsedDate])
                        filteredDataObj[parsedDate] = {};
                     filteredDataObj[parsedDate][appId] = _.cloneDeep(
                        reportData[parsedDate][appId]
                     );
                  }
               }
            } else {
               console.log("OUT");
               filteredDataObj[parsedDate] = null;
            }
         });
      }

      console.log("filteredDataObj: ", filteredDataObj);
      return filteredDataObj;
   }

   previousPeriods(max) {
      const { from, to } = this.state;
      let previousPeriods = [];

      // Get the interval from the filtered dates
      let daysInterval = this.getDates(from, to).daysInterval;
      daysInterval = daysInterval === 0 ? 1 : daysInterval;

      let intervalCounter = 1;
      for (let i = 0; i < max; i++) {
         previousPeriods.push(
            this.filteredData(
               takeDays(from, daysInterval * intervalCounter),
               takeDays(to, daysInterval * intervalCounter)
            )
         );
         intervalCounter++;
      }

      return previousPeriods;
   }

   changeView(view) {
      const { show } = this.state;
      if (view !== "pe" && show === "pe") {
         // this.webGL.unmountWebGL();
      } else if (view === "pe" && show !== "pe") {
         // this.webGL.mountWebGL();
      }
      this.setState({ show: view });
   }

   show(view) {
      const { show } = this.state;
      return show === view;
   }

   quickFilter(filter) {
      const { reportData } = this.props;

      if (!_.isEmpty(reportData)) {
         let newState;

         const today = new Date();
         const yesterday = new Date();
         const lastWeek = new Date();
         yesterday.setDate(yesterday.getDate() - 1);
         lastWeek.setDate(lastWeek.getDate() - 7);

         switch (filter) {
            case "t":
               newState = { from: today, to: today };
               break;
            case "y":
               newState = { from: yesterday, to: yesterday };
               break;
            case "l":
               newState = { from: lastWeek, to: today };
               break;
            case "a":
               const keys = Object.keys(reportData).sort();
               const first = keys[0];
               const last = keys[keys.length - 1];
               newState = { from: new Date(first), to: new Date(last) };
               break;
            default:
               return;
         }

         this.setState(newState);
      }
   }

   changeAppSelection(appId, e) {
      let { userApps, selectedApps, allAppsSelected } = this.state;
      appId = e.target.value ? e.target.value : appId;

      if (appId !== "add") {
         if (appId !== "all") {
            if (selectedApps[appId]) {
               delete selectedApps[appId];
            } else {
               selectedApps[appId] = _.cloneDeep(userApps[appId]);
            }
         } else {
            if (allAppsSelected) {
               selectedApps = {};
            } else {
               for (let appId in userApps) {
                  selectedApps[appId] = userApps[appId];
               }
            }
         }

         allAppsSelected = false;

         if (
            Object.keys(selectedApps).length === Object.keys(userApps).length
         ) {
            allAppsSelected = true;
         }

         this.setState({ selectedApps, allAppsSelected });
      }
   }

   // =========
   // Render Methods
   // =========
   renderAppsDropdown() {
      const { userApps, selectedApps, allAppsSelected } = this.state;
      const selectedAppsDisplay = [];
      const dropdown = [];

      for (let appId in userApps) {
         if (!selectedApps[appId]) {
            dropdown.push(
               <MenuItem
                  value={appId}
                  key={`${appId}-${Math.random()}`}
                  className="mb"
               >
                  {userApps[appId]}
               </MenuItem>
            );
         }
      }

      for (let appId in selectedApps) {
         const selectedAppDisplay = (
            <div
               className="report-selectedApp"
               key={`${selectedApps[appId]}-${Math.random()}`}
            >
               <div>{selectedApps[appId]}</div>
               <div onClick={this.changeAppSelection.bind(null, appId)}>
                  <FontAwesomeIcon icon={faTrash} />
               </div>
            </div>
         );
         selectedAppsDisplay.push(selectedAppDisplay);
      }

      return (
         <div className="mb">
            <FormControl className="fw">
               <InputLabel htmlFor="apps-helper" className="mb">
                  Apps selection
               </InputLabel>
               <Select
                  value="add"
                  onChange={this.changeAppSelection.bind(null, "")}
                  input={<Input name="apps" id="apps-helper" />}
                  className="mb"
               >
                  <MenuItem value="add" className="mb">
                     Add app
                  </MenuItem>
                  <MenuItem value="all" className="mb">
                     {allAppsSelected ? "Unselect all" : "Select all"}
                  </MenuItem>
                  {dropdown}
               </Select>
            </FormControl>
            <div id="report-selectedAppsDisplay">{selectedAppsDisplay}</div>
         </div>
      );
   }

   render() {
      const { show, filteredData, previousPeriods } = this;
      const {
         from,
         to,
         isSceneLoaded,
         isLoadingScene,
         progressLoadingScene,
         selectedApps
      } = this.state;

      const {
         dispatch,
         accessToken,
         isLoad_webgl,
         reportData,
         userData,
         selectedApp
      } = this.props;

      const owAct = show("ow") ? "active" : "";
      const perAct = show("pe") ? "active" : "";
      // const anAct = show("an") ? "active" : "";

      const performanceShow = show("pe")
         ? { display: "block" }
         : { display: "none" };

      return (
         <div id="report">
            <div style={performanceShow}>
               <WebGLScene
                  isLoad_webgl={isLoad_webgl}
                  dispatch={dispatch}
                  ref={instance => {
                     this.webGL = instance;
                  }}
                  confirmSceneLoaded={this.confirmSceneLoaded}
                  isLoadingScene={this.isLoadingScene}
                  progressLoadingScene={this.progressLoadingScene}
                  userData={userData}
               />
            </div>

            <div className={`panel menu-panel`}>
               <div id="app-selection" className="container">
                  <h3 className="st">Reporting</h3>
                  {this.renderAppsDropdown()}
               </div>

               <div id="dates">
                  <h6 className="sst">Display</h6>
                  <div id="range">
                     <div id="from">
                        <DayPickerInput
                           value={from}
                           onDayChange={this.changeDate.bind(null, "from")}
                           dayPickerProps={{
                              selectedDays: from,
                              disabledDays: { after: to }
                           }}
                        />
                     </div>
                     <div>to</div>
                     <div id="to">
                        <DayPickerInput
                           value={to}
                           onDayChange={this.changeDate.bind(null, "to")}
                           dayPickerProps={{
                              selectedDays: to,
                              disabledDays: { before: from }
                           }}
                        />
                     </div>
                  </div>
                  <div id="quickFilters">
                     <a
                        onClick={this.quickFilter.bind(null, "t")}
                        className="mb"
                     >
                        today
                     </a>
                     <a
                        onClick={this.quickFilter.bind(null, "y")}
                        className="mb"
                     >
                        yesterday
                     </a>
                     <a
                        onClick={this.quickFilter.bind(null, "l")}
                        className="mb"
                     >
                        last week
                     </a>
                     <a
                        onClick={this.quickFilter.bind(null, "a")}
                        className="mb"
                     >
                        all
                     </a>
                  </div>
               </div>

               <hr />

               <div className="list-group sst">
                  <a
                     className={`list-group-item list-group-item-action ${owAct}`}
                     onClick={this.changeView.bind(null, "ow")}
                  >
                     Overview
                  </a>
                  <a
                     className={`list-group-item list-group-item-action ${perAct}`}
                     onClick={this.changeView.bind(null, "pe")}
                  >
                     Performance
                  </a>
                  {/* <a
                     className={`list-group-item list-group-item-action ${anAct}`}
                     onClick={this.changeView.bind(null, "an")}
                  >
                     Analytics
                  </a> */}
               </div>
               {/* <div
                  className="menu-panel-vertical-cover"
                  style={performanceShow}
               /> */}
            </div>

            <ToggleDisplay show={show("ow")}>
               <Overview
                  filteredReportData={filteredData()}
                  previousPeriods={previousPeriods(7)}
               />
            </ToggleDisplay>

            <ToggleDisplay show={show("pe")}>
               <Performance
                  reportData={reportData}
                  dispatch={dispatch}
                  accessToken={accessToken}
                  selectedApp={selectedApp}
                  selectedApps={selectedApps}
                  filteredReportData={filteredData()}
                  fromDate={from}
                  toDate={to}
                  doLoadScene={this.doLoadScene}
                  moveCamera={this.moveCamera}
                  TrackballControlsEnableWheel={
                     this.TrackballControlsEnableWheel
                  }
                  TrackballControlsDisableWheel={
                     this.TrackballControlsDisableWheel
                  }
                  noPointerLockControlsRotation={
                     this.noPointerLockControlsRotation
                  }
                  yesPointerLockControlsRotation={
                     this.yesPointerLockControlsRotation
                  }
                  addEventListeners={this.addEventListeners}
                  disposeEventListeners={this.disposeEventListeners}
                  isSceneLoaded={isSceneLoaded}
                  isLoadingScene={isLoadingScene}
                  progressLoadingScene={progressLoadingScene}
               />
            </ToggleDisplay>

            <ToggleDisplay show={show("an")}>
               <Analytics />
            </ToggleDisplay>
         </div>
      );
   }
}

const mapStateToProps = state => ({
   apps: state.app.get("apps"),
   accessToken: state.app.get("accessToken"),
   userData: state.app.get("userData"),
   selectedApp: state.app.get("selectedApp"),
   reportData: state.app.get("reportData"),
   initialReportAppId: state.app.get("initialReportAppId"),
   isLoad_webgl: state.app.get("load_webgl")
});

export default connect(mapStateToProps)(Report);
