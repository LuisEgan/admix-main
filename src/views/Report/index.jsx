import React, { Component } from "react";
import _a from "../../utils/analytics";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { isEmpty, cloneDeep, isEqual } from "lodash";
import { getPlacementsByAppId } from "../../actions";

import ToggleDisplay from "react-toggle-display";
import DayPickerInput from "react-day-picker/DayPickerInput";
import "../../../node_modules/react-day-picker/lib/style.css";

import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { KeyboardArrowDown, KeyboardArrowRight } from "@material-ui/icons";

import CSS from "../../utils/InLineCSS";

import Overview from "./Components/Overview";
import Performance from "./Components/Performance";
import Analytics from "./Components/Analytics";

import WebGLScene from "../WebGLScene";

const { ga } = _a;

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

const isDateBetween = ({
   from,
   to,
   date,
   inclusiveFrom,
   inclusiveTo,
   inclusiveBoth
}) => {
   inclusiveFrom = inclusiveFrom || true;
   inclusiveTo = inclusiveTo || true;
   inclusiveBoth = inclusiveBoth || (inclusiveFrom && inclusiveTo);

   from.setHours(0, 0, 0, 0);
   to.setHours(0, 0, 0, 0);
   date.setHours(0, 0, 0, 0);

   const betweenFrom = inclusiveBoth
      ? from <= date
      : inclusiveFrom
         ? from <= date
         : from < date;
   const betweenTo = inclusiveBoth
      ? to >= date
      : inclusiveTo
         ? to >= date
         : to > date;
   return betweenFrom && betweenTo;
};

class Report extends Component {
   static propTypes = {
      dispatch: PropTypes.func
   };

   constructor(props) {
      super(props);

      this.state = {
         show: "ov",
         from: new Date(),
         to: new Date(),
         initialDateSetup: false,
         quickFilterFirstClick: true,
         quickFilter: "l",
         doLoadScene: false,
         isSceneLoaded: false,
         isLoadingScene: false,
         progressLoadingScene: 0,
         userApps: {},
         oldSelectedApps: {},
         selectedApps: {},
         selectedAppsLength: 0,
         allAppsSelected: false,
         placementsByAppId: {}
      };

      this.filteredData = this.filteredData.bind(this);
      this.previousPeriods = this.previousPeriods.bind(this);
      this.changeView = this.changeView.bind(this);
      this.show = this.show.bind(this);
      this.changeDate = this.changeDate.bind(this);
      this.quickFilter = this.quickFilter.bind(this);

      this.TJSclear = this.TJSclear.bind(this);
      this.doLoadScene = this.doLoadScene.bind(this);
      this.moveCamera = this.moveCamera.bind(this);

      this.addEventListeners = this.addEventListeners.bind(this);
      this.disposeEventListeners = this.disposeEventListeners.bind(this);

      this.confirmSceneLoaded = this.confirmSceneLoaded.bind(this);
      this.isLoadingScene = this.isLoadingScene.bind(this);
      this.progressLoadingScene = this.progressLoadingScene.bind(this);
      this.changeAppSelection = this.changeAppSelection.bind(this);
   }

   componentWillUnmount() {
      this.disposeEventListeners();
   }

   componentDidMount() {
      document.getElementById("report-content").scrollTop = 0;
      this.quickFilter("l");
   }

   shouldComponentUpdate(nextProps, nextState, nextContext) {
      const {
         from,
         to,
         selectedApps,
         show,
         selectedAppsLength,
         quickFilter,
         placementsByAppId
      } = this.state;
      if (
         from !== nextState.from ||
         to !== nextState.to ||
         Object.keys(selectedApps).length === 0 ||
         selectedAppsLength !== nextState.selectedAppsLength ||
         show !== nextState.show ||
         quickFilter !== nextState.quickFilter ||
         !isEqual(placementsByAppId, nextProps.placementsByAppId)
      ) {
         return true;
      }
      return false;
   }

   static getDerivedStateFromProps(nextProps, prevState) {
      const {
         apps,
         reportData,
         initialReportAppId,
         placementsByAppId
      } = nextProps;
      const { initialDateSetup } = prevState;

      if (Object.keys(reportData).length > 0 && !initialDateSetup) {
         const keys = Object.keys(reportData).sort();
         const first = keys[0];
         const from = new Date(first);
         const to = new Date();
         const selectedApps = {};
         let allAppsSelected = false;

         const userApps = {};
         apps.forEach(app => {
            userApps[app._id] = app.name;
         });

         initialReportAppId.forEach(appId => {
            selectedApps[appId] = {};
            selectedApps[appId].name = userApps[appId];
            selectedApps[appId].reportData = Report.aggReportDataByDate({
               reportData,
               from,
               to,
               appId
            });
         });

         allAppsSelected =
            Object.keys(selectedApps).length === Object.keys(userApps).length;

         //    const last = keys[keys.length - 1];
         return {
            userApps,
            selectedApps,
            allAppsSelected,
            selectedAppsLength: Object.keys(selectedApps).length,
            placementsByAppId: cloneDeep(placementsByAppId),

            initialDateSetup: true,
            from,
            to
            // to: new Date(last)
         };
      }

      if (!isEqual(placementsByAppId, prevState.placementsByAppId)) {
         return {
            placementsByAppId: cloneDeep(placementsByAppId)
         };
      }

      return null;
   }

   static aggReportDataByDate({ reportData, from, to, appId }) {
      let aggregatedData = {
         revenue: 0,
         impression: 0,
         bidRequest: 0,
         bidResponse: 0,
         gaze: 0,
         gazeUnique: 0,
         impressionUnique: 0,
         RPM: 0,
         fillRate: 0,
         byDate: {},
         bySceneId: {},
         byPlacementId: {},
         byPublisherId: {}
      };
      from = new Date(from);
      to = new Date(to);

      let keyLabel, reportItem;

      for (let date in reportData) {
         if (isDateBetween({ from, to, date: new Date(date) })) {
            // is there report data of that app in that date?
            if (reportData[date][appId]) {
               for (let i = 0; i < reportData[date][appId].length; i++) {
                  reportItem = reportData[date][appId][i];
                  for (let dataKey in aggregatedData) {
                     if (reportItem[dataKey]) {
                        aggregatedData[dataKey] =
                           reportItem[dataKey] + aggregatedData[dataKey];

                        aggregatedData.byDate[date] =
                           aggregatedData.byDate[date] || {};
                        aggregatedData.byDate[date][dataKey] =
                           reportItem[dataKey] +
                           (aggregatedData.byDate[date][dataKey] || 0);

                        for (let idKey in reportItem.keys) {
                           switch (idKey) {
                              case "sceid":
                                 keyLabel = "bySceneId";
                                 break;
                              case "plaid":
                                 keyLabel = "byPlacementId";
                                 break;
                              case "pubid":
                                 keyLabel = "byPublisherId";
                                 break;
                              default:
                           }

                           aggregatedData[keyLabel][reportItem.keys[idKey]] =
                              aggregatedData[keyLabel][
                                 reportItem.keys[idKey]
                              ] || {};
                           aggregatedData[keyLabel][reportItem.keys[idKey]][
                              dataKey
                           ] =
                              reportItem[dataKey] +
                              (aggregatedData[keyLabel][reportItem.keys[idKey]][
                                 dataKey
                              ] || 0);
                        }
                     }
                  }
               }
            }
         }
      }

      aggregatedData.RPM =
         aggregatedData.revenue && aggregatedData.impression
            ? (aggregatedData.revenue / 1000 / aggregatedData.impression) * 1000
            : 0;

      aggregatedData.fillRate =
         aggregatedData.impression && aggregatedData.bidRequest
            ? (aggregatedData.impression / aggregatedData.bidRequest) * 100
            : 0;

      for (let dataKey in aggregatedData) {
         if (dataKey.indexOf("by") < 0) {
            aggregatedData[dataKey] =
               dataKey === "revenue"
                  ? aggregatedData[dataKey] / 1000
                  : aggregatedData[dataKey];
            aggregatedData[dataKey] = Number.isInteger(aggregatedData[dataKey])
               ? Math.round(aggregatedData[dataKey])
               : +aggregatedData[dataKey].toFixed(2);
         }
      }

      return aggregatedData;
   }

   // WebGL Methods -----------------------------------------

   TJSclear() {
      this.webGL.clear({});
      this.setState({
         doLoadScene: false,
         isSceneLoaded: false,
         isLoadingScene: false
      });
   }

   doLoadScene(selectedScene) {
      this.webGL.loadScene(selectedScene);
   }

   moveCamera(selectedPlacement) {
      this.webGL.moveCamera(selectedPlacement);
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

   addEventListeners() {
      this.webGL.addEventListeners();
   }

   disposeEventListeners() {
      this.webGL.disposeEventListeners();
   }

   // Date manipulation -----------------------------------------

   parseDate(date) {
      let parseMonth = (date.getMonth() + 1).toString();
      parseMonth = parseMonth.length === 1 ? `0${parseMonth}` : parseMonth;

      let parseDay = date.getDate().toString();
      parseDay = parseDay.length === 1 ? `0${parseDay}` : parseDay;

      const parsedDate = date.getFullYear() + "-" + parseMonth + "-" + parseDay;
      return parsedDate;
      // return date.toISOString().split("T")[0];
   }

   getDates = (startDate, stopDate) => {
      const dateArray = [];
      let currentDate = startDate;
      let daysInterval = 0;

      if (startDate && stopDate) {
         startDate.setHours(0, 0, 0, 0);
         stopDate.setHours(0, 0, 0, 0);

         while (currentDate <= stopDate) {
            dateArray.push(currentDate);
            currentDate = addDays(currentDate, 1);
            daysInterval++;
         }

         const sameDate =
            startDate.toString().slice(0, 15) ===
            stopDate.toString().slice(0, 15);
         if (daysInterval === 0 && sameDate) {
            dateArray.push(currentDate);
         }
      }

      return { dates: dateArray, daysInterval };
   };

   changeDate({ newFrom, newTo, quickFilter }, DayPickerInputDate) {
      const { quickFilterFirstClick } = this.state;

      if (!quickFilterFirstClick) {
         _a.track(ga.actions.report.changeReportDate, {
            category: ga.categories.report,
            label: ga.labels.changeReportDate[quickFilter ? quickFilter : "c"]
         });
      }

      const { reportData } = this.props;
      let { from, to, selectedApps } = this.state;

      let newState = {
         from: newFrom
            ? newFrom === "DayPickerInput"
               ? DayPickerInputDate
               : newFrom
            : from,
         to: newTo
            ? newTo === "DayPickerInput"
               ? DayPickerInputDate
               : newTo
            : to
      };

      newState.selectedApps = cloneDeep(selectedApps);

      for (let appId in newState.selectedApps) {
         newState.selectedApps[appId].reportData = Report.aggReportDataByDate({
            reportData,
            from: newState.from,
            to: newState.to,
            appId
         });
      }

      if (!quickFilter) {
         newState.quickFilter = null;
      }

      newState.quickFilterFirstClick = false;

      this.setState(newState);
   }

   // Data manipulation -----------------------------------------

   filteredData(customFrom = null, customTo = null) {
      const { reportData } = this.props;
      const { from, to, selectedApps } = this.state;

      const filteredDates =
         customFrom && customTo
            ? this.getDates(customFrom, customTo).dates
            : this.getDates(from, to).dates;

      let filteredDataObj = {};

      if (!isEmpty(reportData) && !isEmpty(selectedApps)) {
         filteredDates.forEach(date => {
            const parsedDate = this.parseDate(date);

            // check if there's data (from db) in the date specified by user
            if (reportData[parsedDate]) {
               // loop through each app data in each report date specified by user
               for (let appId in reportData[parsedDate]) {
                  // check if the app is among the selected apps by the user
                  if (selectedApps[appId]) {
                     if (!filteredDataObj[parsedDate]) {
                        filteredDataObj[parsedDate] = {};
                     }
                     filteredDataObj[parsedDate][appId] = cloneDeep(
                        reportData[parsedDate][appId]
                     );
                  } else {
                     filteredDataObj[parsedDate] = null;
                  }
               }
            }
         });
      }

      return filteredDataObj;
   }

   previousPeriods(max) {
      const { reportData } = this.props;
      const { from, to, selectedApps } = this.state;
      const previousPeriods = [{}];

      // Get the interval from the filtered dates
      let daysInterval = this.getDates(from, to).daysInterval;
      daysInterval = daysInterval === 0 ? 1 : daysInterval;

      let pp = {};
      let ppFrom, ppTo;
      let ppData = {};

      for (let i = 0; i <= max; i++) {
         ppFrom = takeDays(from, daysInterval * i);
         ppTo = takeDays(to, daysInterval * i);

         for (let appId in selectedApps) {
            ppData[appId] = Report.aggReportDataByDate({
               reportData,
               from: takeDays(from, daysInterval * i),
               to: takeDays(to, daysInterval * i),
               appId
            });
         }

         pp = {
            from: ppFrom,
            to: ppTo,
            data: cloneDeep(ppData)
         };

         previousPeriods[i] = pp;
      }

      return previousPeriods;
   }

   changeView(view) {
      const { show } = this.state;

      if (show !== view) {
         _a.track(ga.actions.report.changeReportDisplay, {
            category: ga.categories.report,
            label: ga.labels.changeReportDisplay[view]
         });
      }

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

   quickFilter(quickFilter) {
      let { reportData } = this.props;
      reportData = reportData || {};

      let from, to;

      const today = new Date();
      const yesterday = new Date();
      const lastWeek = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      lastWeek.setDate(lastWeek.getDate() - 6);

      switch (quickFilter) {
         case "t":
            from = today;
            to = today;
            break;
         case "y":
            from = yesterday;
            to = yesterday;
            break;
         case "l":
            from = lastWeek;
            to = today;
            break;
         case "a":
            const keys = Object.keys(reportData).sort();
            const first = keys[0];
            from = first ? new Date(first) : new Date();
            to = today;
            //    const last = keys[keys.length - 1];
            //    newState = { from: new Date(first), to: new Date(last) };
            break;
         default:
      }

      this.setState({ quickFilter }, () => {
         this.changeDate({ newFrom: from, newTo: to, quickFilter }, null);
      });
   }

   changeAppSelection(appId, e) {
      let { userApps, selectedApps, allAppsSelected, from, to } = this.state;
      const { accessToken, dispatch, reportData } = this.props;
      appId = e.target.value || appId;

      const _aAction =
         appId === "all"
            ? allAppsSelected
               ? ga.actions.report.unselectAllApps
               : ga.actions.report.selectAllApps
            : selectedApps[appId]
               ? ga.actions.report.unselectApp
               : ga.actions.report.selectApp;

      _a.track(_aAction, {
         category: ga.categories.report
      });

      let getNewPcs = false;

      if (appId !== "add") {
         if (appId !== "all") {
            if (selectedApps[appId]) {
               delete selectedApps[appId];
            } else {
               getNewPcs = true;
               selectedApps[appId] = {};
               selectedApps[appId].name = userApps[appId];
               selectedApps[appId].reportData = Report.aggReportDataByDate({
                  reportData,
                  from,
                  to,
                  appId
               });
            }
         } else {
            if (allAppsSelected) {
               selectedApps = {};
            } else {
               for (let appId in userApps) {
                  getNewPcs = true;
                  selectedApps[appId] = {};
                  selectedApps[appId].name = userApps[appId];
                  selectedApps[appId].reportData = Report.aggReportDataByDate({
                     reportData,
                     from,
                     to,
                     appId
                  });
               }
            }
         }

         allAppsSelected =
            Object.keys(selectedApps).length === Object.keys(userApps).length;

         this.setState(
            {
               selectedApps,
               allAppsSelected,
               selectedAppsLength: Object.keys(selectedApps).length
            },
            () => {
               if (getNewPcs) {
                  for (let appId in userApps) {
                     dispatch(getPlacementsByAppId(appId, accessToken));
                  }
               }
            }
         );
      }
   }

   // Render Methods -----------------------------------------

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
               key={`${selectedApps[appId].name}-${Math.random()}`}
            >
               <div>{selectedApps[appId].name}</div> &nbsp;
               <div onClick={this.changeAppSelection.bind(null, appId)}>
                  {/* <FontAwesomeIcon icon={faTrash} /> */} X
               </div>
            </div>
         );
         selectedAppsDisplay.push(selectedAppDisplay);
      }

      return (
         <div className="mb">
            <FormControl className="fw">
               <span className="input-label">Apps selection</span>
               <Select
                  value="add"
                  onChange={this.changeAppSelection.bind(null, "")}
                  input={<Input name="apps" id="apps-helper" />}
                  style={CSS.mb}
                  classes={{ root: "mui-select-root" }}
                  disableUnderline={true}
                  IconComponent={KeyboardArrowDown}
               >
                  <MenuItem value="add" style={CSS.mb}>
                     Add app
                  </MenuItem>
                  <MenuItem value="all" style={CSS.mb}>
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
      const { show, previousPeriods } = this;

      const { from, to } = this.state;

      const { dispatch, isLoad_webgl, userData } = this.props;

      const owAct = show("ov") ? "active" : "";
      const perAct = show("pe") ? "active" : "";

      const performanceShow = show("pe")
         ? { display: "block" }
         : { display: "none" };

      return (
         <div id="report" className="page-withPanel-container">
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

            <div className={`panel menu-panel mb`}>
               <div id="app-selection">
                  <span style={{ color: "#14B9BE" }}>Reporting</span>
                  {this.renderAppsDropdown()}
               </div>

               <div id="dates">
                  <span className="input-label">Display</span>
                  <div id="range">
                     <div id="from">
                        <DayPickerInput
                           value={from}
                           onDayChange={this.changeDate.bind(null, {
                              newFrom: "DayPickerInput"
                           })}
                           dayPickerProps={{
                              selectedDays: from,
                              disabledDays: { after: to }
                           }}
                        />
                     </div>
                     <div id="to">
                        <DayPickerInput
                           value={to}
                           onDayChange={this.changeDate.bind(null, {
                              newTo: "DayPickerInput"
                           })}
                           dayPickerProps={{
                              selectedDays: to,
                              disabledDays: { before: from }
                           }}
                        />
                     </div>
                  </div>
                  <div id="quickFilters" className="mbs">
                     <a onClick={this.quickFilter.bind(null, "t")}>Today</a>
                     <a onClick={this.quickFilter.bind(null, "y")}>Yesterday</a>
                     <a onClick={this.quickFilter.bind(null, "l")}>Last week</a>
                     <a onClick={this.quickFilter.bind(null, "a")}>All</a>
                  </div>
               </div>

               <div className="list-group">
                  <div
                     className={`${owAct}`}
                     onClick={this.changeView.bind(null, "ov")}
                  >
                     <span>Overview</span>
                     {show("ov") ? (
                        <KeyboardArrowRight className="rotate90" />
                     ) : (
                        <KeyboardArrowDown className="rotate270" />
                     )}
                  </div>
                  <div
                     className={`${perAct}`}
                     onClick={this.changeView.bind(null, "pe")}
                  >
                     <span>Performance</span>
                     {show("pe") ? (
                        <KeyboardArrowRight className="rotate90" />
                     ) : (
                        <KeyboardArrowDown className="rotate270" />
                     )}
                  </div>
               </div>
            </div>

            <div className="page-content" id="report-content">
               <ToggleDisplay show={show("ov")}>
                  <Overview
                     previousPeriods={previousPeriods(7)}
                     {...this.state}
                     {...this.props}
                  />
               </ToggleDisplay>

               <ToggleDisplay show={show("pe")}>
                  <Performance {...this} {...this.state} {...this.props} />
               </ToggleDisplay>

               <ToggleDisplay show={show("an")}>
                  <Analytics />
               </ToggleDisplay>
            </div>
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
   placementsByAppId: state.app.get("placementsByAppId"),
   isLoad_webgl: state.app.get("load_webgl")
});

export default connect(mapStateToProps)(Report);
