import React, { Component } from "react";
import PropTypes from "prop-types";
import { Pie } from "react-chartjs-2";

import { colors } from "../../../assets/data/colorsArr";

export default class Performance extends Component {
   static propTypes = {
      dispatch: PropTypes.func
   };

   constructor(props) {
      super(props);

      this.state = {
         loadedScene: "",
         selectedPlacement: "",
         sceneClicked: false,

         clickedAppId: "",
         appsPieData: {},
         appsPieOpts: {},
         appsTableData: [],

         scenesPieData: {},
         scenesPieOpts: {},
         scenesTableData: [],

         placementsPieData: {},
         placementsPieOpts: {},
         placementsTableData: []
      };

      this.pieColorsAssigned = false;

      this.ControlsRotationToggle = this.ControlsRotationToggle.bind(this);
      this.onAppElementsClick = this.onAppElementsClick.bind(this);
      this.onSceneElementsClick = this.onSceneElementsClick.bind(this);
      this.onPlacementElementsClick = this.onPlacementElementsClick.bind(this);
      this.setScenesData = this.setScenesData.bind(this);
      this.setPlacementsData = this.setPlacementsData.bind(this);
      this.renderScenesTable = this.renderScenesTable.bind(this);
      this.renderPlacementsTable = this.renderPlacementsTable.bind(this);
   }

   generateColor = () => {
      return (
         "#" +
         Math.random()
            .toString(16)
            .substr(-6)
      );
   };

   numberWithCommas = x => {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
   };

   componentDidMount() {
      const { filteredReportData } = this.props;
      this.setAppsData(filteredReportData);
   }

   componentWillReceiveProps(nextProps) {
      const { clickedAppId } = this.state;

      const { filteredReportData } = nextProps;
      this.setAppsData(filteredReportData);
      this.setScenesData(filteredReportData, clickedAppId);
      this.setPlacementsData(filteredReportData);
   }

   ControlsRotationToggle(toggle) {
      const {
         isSceneLoaded,
         noPointerLockControlsRotation,
         yesPointerLockControlsRotation
      } = this.props;

      if (isSceneLoaded) {
         if (toggle === "enable") {
            // TrackballControlsEnableWheel();
            yesPointerLockControlsRotation();
         } else {
            // TrackballControlsDisableWheel();
            noPointerLockControlsRotation();
         }
      }
   }

   onAppElementsClick(e) {
      const { filteredReportData } = this.props;
      const { clickedAppId } = this.state;

      if (e[0]) {
         const {
            _model: { label },
            _chart: {
               options: { appClickId }
            }
         } = e[0];
         if (appClickId[label] !== clickedAppId) {
            this.setState({ clickedAppId: appClickId[label] });
            this.setScenesData(filteredReportData, appClickId[label]);
         }
      }
   }

   onSceneElementsClick(e) {
      const { doLoadScene } = this.props;
      const { loadedScene } = this.state;

      if (e[0]) {
         const {
            _model: { label },
            _chart: {
               options: { sceneClickId }
            }
         } = e[0];
         if (sceneClickId[label] !== loadedScene) {
            doLoadScene();
            this.setState({
               loadedScene: sceneClickId[label],
               sceneClicked: true
            });
         }
      }
   }

   onPlacementElementsClick(e) {
      const { moveCamera } = this.props;
      const { selectedPlacement } = this.state;

      if (e[0]) {
         const {
            _model: { label },
            _chart: {
               options: { placementClickId }
            }
         } = e[0];
         moveCamera("__advirObj__banner2");
         if (placementClickId[label] !== selectedPlacement) {
            // moveCamera(label);
            this.setState({ selectedPlacement: placementClickId[label] });
         }
      }
   }

   setAppsData(filteredReportData) {
      const { selectedApps } = this.props;
      const pieBackgroundColors = [];
      const pieLabels = [];
      const pieData = [];

      let uniqueApps = {};

      // group data by appId
      for (let date in filteredReportData) {
         for (let appId in filteredReportData[date]) {
            filteredReportData[date][appId].forEach(item => {
               // make the sum for each items's revenue, impressions and impressionsUniques

               if (uniqueApps[appId]) {
                  uniqueApps[appId].revenue =
                     uniqueApps[appId].revenue + item.revenue;

                  // this is for all the apps table
                  uniqueApps[appId].impression =
                     uniqueApps[appId].impression + item.impression;

                  uniqueApps[appId].impressionUnique =
                     uniqueApps[appId].impressionUnique + item.impressionUnique;
               } else {
                  uniqueApps[appId] = {};
                  uniqueApps[appId].revenue = item.revenue;

                  // this is for all the tables
                  uniqueApps[appId].impression = item.impression;
                  uniqueApps[appId].impressionUnique = item.impressionUnique;
               }
            });
         }
      }

      // populate arrays for chart for each unique
      let appClickId = {};
      let i = 1;
      let appLabel = "";
      let appsTableData = [];
      for (let appId in uniqueApps) {
         let appsTableDataItem = {};
         appLabel = selectedApps[appId];

         // for pie graph
         pieBackgroundColors.push(colors[i - 1 + 6]);
         pieLabels.push(appLabel);
         pieData.push(uniqueApps[appId].revenue);

         // to know what app was clicked to load its scenes
         appClickId[appLabel] = appId;

         // for apps table
         appsTableDataItem.label = appLabel;
         appsTableDataItem.appId = appId;
         appsTableDataItem.revenue = uniqueApps[appId].revenue;
         appsTableDataItem.impression = uniqueApps[appId].impression;
         appsTableDataItem.impressionUnique =
            uniqueApps[appId].impressionUnique;

         appsTableData.push(appsTableDataItem);
         i++;
      }

      const appsPieData = {
         labels: pieLabels,
         datasets: [
            {
               data: pieData,
               backgroundColor: pieBackgroundColors,
               hoverBackgroundColor: pieBackgroundColors
            }
         ]
      };

      const appsPieOpts = {
         legend: false,
         appClickId
      };

      this.setState({
         appsPieData,
         appsPieOpts,
         appsTableData
      });
   }

   // this also sets placementsTableData
   setScenesData(filteredReportData, clickedAppId) {
      // const { clickedAppId } = this.state;
      const pieBackgroundColors = [];
      const pieLabels = [];
      const pieData = [];

      let uniqueScenes = {};

      // this is for all the placements table
      let uniquePlacements = {};

      // group data by scene
      for (let date in filteredReportData) {
         for (let appId in filteredReportData[date]) {
            if (appId === clickedAppId) {
               filteredReportData[date][appId].forEach(item => {
                  // make the sum for each items's revenue, impressions and impressionsUniques

                  // ========
                  // SCENES RUMS
                  // ========

                  if (uniqueScenes[item.sceneId]) {
                     uniqueScenes[item.sceneId].revenue =
                        uniqueScenes[item.sceneId].revenue + item.revenue;

                     // this is for all the scenes table
                     uniqueScenes[item.sceneId].impression =
                        uniqueScenes[item.sceneId].impression + item.impression;

                     uniqueScenes[item.sceneId].impressionUnique =
                        uniqueScenes[item.sceneId].impressionUnique +
                        item.impressionUnique;
                  } else {
                     uniqueScenes[item.sceneId] = {};
                     uniqueScenes[item.sceneId].revenue = item.revenue;
                     uniqueScenes[item.sceneId].sceneId = item.sceneId;

                     // this is for all the tables
                     uniqueScenes[item.sceneId].impression = item.impression;
                     uniqueScenes[item.sceneId].impressionUnique =
                        item.impressionUnique;
                  }

                  // ========
                  // PLACEMENTS SUMS
                  // ========

                  if (uniquePlacements[item.placementId]) {
                     uniquePlacements[item.placementId].revenue =
                        uniquePlacements[item.placementId].revenue +
                        item.revenue;

                     uniquePlacements[item.placementId].impression =
                        uniquePlacements[item.placementId].impression +
                        item.impression;

                     uniquePlacements[item.placementId].impressionUnique =
                        uniquePlacements[item.placementId].impressionUnique +
                        item.impressionUnique;
                  } else {
                     uniquePlacements[item.placementId] = {};
                     uniquePlacements[item.placementId].sceneId = item.sceneId;
                     uniquePlacements[item.placementId].placementId =
                        item.placementId;
                     uniquePlacements[item.placementId].revenue = item.revenue;
                     uniquePlacements[item.placementId].impression =
                        item.impression;
                     uniquePlacements[item.placementId].impressionUnique =
                        item.impressionUnique;
                  }
               });
            }
         }
      }

      // populate arrays for chart for each unique

      // ========
      // SCENES
      // ========

      let sceneClickId = {};
      let i = 1;
      let sceneLabel = "";
      let scenesTableData = [];
      for (let scene in uniqueScenes) {
         let scenesTableDataItem = {};
         sceneLabel = `Scene ${i}`;

         // for pie graph
         pieBackgroundColors.push(colors[i - 1]);
         pieLabels.push(sceneLabel);
         pieData.push(uniqueScenes[scene].revenue);

         // to know what scene was clicked to load its placements
         sceneClickId[sceneLabel] = uniqueScenes[scene].sceneId;

         // for scenes table
         scenesTableDataItem.label = sceneLabel;
         scenesTableDataItem.sceneId = uniqueScenes[scene].sceneId;
         scenesTableDataItem.revenue = uniqueScenes[scene].revenue;
         scenesTableDataItem.impression = uniqueScenes[scene].impression;
         scenesTableDataItem.impressionUnique =
            uniqueScenes[scene].impressionUnique;

         scenesTableData.push(scenesTableDataItem);
         i++;
      }

      // ========
      // PLACEMENTS
      // ========

      let placementsTableData = [];
      for (let placement in uniquePlacements) {
         let placementsTableDataItem = {};
         scenesTableData.some(scene => {
            if (scene.sceneId === uniquePlacements[placement].sceneId) {
               placementsTableDataItem.sceneLabel = scene.label;
               return true;
            }
            return false;
         });

         placementsTableDataItem.label =
            uniquePlacements[placement].placementId;
         placementsTableDataItem.revenue = uniquePlacements[placement].revenue;
         placementsTableDataItem.impression =
            uniquePlacements[placement].impression;
         placementsTableDataItem.impressionUnique =
            uniquePlacements[placement].impressionUnique;

         placementsTableData[
            placementsTableData.length
         ] = placementsTableDataItem;
      }

      const scenesPieData = {
         labels: pieLabels,
         datasets: [
            {
               data: pieData,
               backgroundColor: pieBackgroundColors,
               hoverBackgroundColor: pieBackgroundColors
            }
         ]
      };

      const scenesPieOpts = {
         legend: false,
         sceneClickId
      };

      this.setState({
         scenesPieData,
         scenesPieOpts,
         scenesTableData,
         placementsTableData
      });
   }

   setPlacementsData(filteredReportData) {
      // const { filteredReportData } = this.props;
      const { loadedScene } = this.state;

      const pieBackgroundColors = [];
      const pieLabels = [];
      const pieData = [];

      let uniquePlacements = {};

      // group data by scene
      for (let date in filteredReportData) {
         if (!!filteredReportData[date]) {
            for (let appId in filteredReportData[date]) {
               if (!!filteredReportData[date][appId]) {
                  filteredReportData[date][appId].forEach(item => {
                     if (loadedScene === item.sceneId) {
                        if (uniquePlacements[item.placementId]) {
                           uniquePlacements[item.placementId].revenue =
                              uniquePlacements[item.placementId].revenue +
                              item.revenue;
                        } else {
                           uniquePlacements[item.placementId] = {};
                           uniquePlacements[item.placementId].revenue =
                              item.revenue;
                           uniquePlacements[item.placementId].placementId =
                              item.placementId;
                        }
                     }
                  });
               }
            }
         }
      }

      // populate arrays for chart for each unique scene
      let placementClickId = {};
      let i = 1;
      let placementLabel = "";
      for (let placement in uniquePlacements) {
         placementLabel = `Placement ${i}`;
         pieBackgroundColors.push(colors[i - 1]);
         pieLabels.push(placementLabel);
         pieData.push(uniquePlacements[placement].revenue);
         placementClickId[placementLabel] =
            uniquePlacements[placement].placementId;
         i++;
      }

      const placementsPieData = {
         labels: pieLabels,
         datasets: [
            {
               data: pieData,
               backgroundColor: pieBackgroundColors,
               hoverBackgroundColor: pieBackgroundColors
            }
         ]
      };

      const placementsPieOpts = {
         legend: false,
         placementClickId
      };

      this.setState({ placementsPieData, placementsPieOpts });
   }

   renderDropdown() {
      return (
         <div className="btn-group">
            <button type="button" className="btn btn-secondary dropdown-title">
               Revenue by placement
            </button>
            <button
               type="button"
               className="btn btn-secondary dropdown-toggle dropdown-toggle-split"
               data-toggle="dropdown"
               aria-haspopup="true"
               aria-expanded="false"
            >
               {/* <span className="sr-only">LMAO</span> */}
            </button>
            <div className="dropdown-menu">
               <a
                  className="dropdown-item"
                  // onClick={this.sceneOnClick.bind(null, scene)}
               >
                  Option 2
               </a>
            </div>
         </div>
      );
   }

   renderScenesTable() {
      const { scenesTableData } = this.state;

      return (
         <table className="table table-bordered reportTable">
            <thead>
               <tr className="st">
                  <th scope="col">Scene name</th>
                  <th scope="col">Impressions</th>
                  <th scope="col">Revenue</th>
                  <th scope="col">Uniques</th>
               </tr>
            </thead>
            <tbody>
               {scenesTableData.map(data => {
                  const { label, revenue, impression, impressionUnique } = data;
                  return (
                     <tr className="mb" key={label}>
                        <td>{label}</td>
                        <td>{this.numberWithCommas(impression)}</td>
                        <td>$ {this.numberWithCommas(revenue)}</td>
                        <td>{this.numberWithCommas(impressionUnique)}</td>
                     </tr>
                  );
               })}
            </tbody>
         </table>
      );
   }

   renderPlacementsTable() {
      const { placementsTableData } = this.state;

      return (
         <table className="table table-bordered reportTable">
            <thead>
               <tr className="st">
                  <th scope="col">Placement name</th>
                  <th scope="col">Impressions</th>
                  <th scope="col">Revenue</th>
                  <th scope="col">Uniques</th>
               </tr>
            </thead>
            <tbody>
               {placementsTableData.map(data => {
                  const {
                     sceneLabel,
                     label,
                     revenue,
                     impression,
                     impressionUnique
                  } = data;
                  return (
                     <tr className="mb" key={`${label} (${sceneLabel})`}>
                        <td>{`${label} (${sceneLabel})`}</td>
                        <td>{this.numberWithCommas(impression)}</td>
                        <td>$ {this.numberWithCommas(revenue)}</td>
                        <td>{this.numberWithCommas(impressionUnique)}</td>
                     </tr>
                  );
               })}
            </tbody>
         </table>
      );
   }

   render() {
      const { isSceneLoaded, isLoadingScene } = this.props;

      let {
         clickedAppId,
         appsPieData,
         appsPieOpts,

         sceneClicked,
         scenesPieData,
         scenesPieOpts,

         placementsPieData,
         placementsPieOpts
      } = this.state;

      let webglStyle = {};

      if (isSceneLoaded) {
         webglStyle = { background: "transparent" };
      }

      const sceneTxt = clickedAppId.length > 0 ? "Select a scene below" : "";
      const placementTxt = sceneClicked ? "Select a placement below" : "";

      return (
         <div id="performance" className="unselectable">
            <div id="performance-graphs">
               <div>
                  {/* {this.renderDropdown()} */}
                  <div className="report-title">
                     <h5 className="st">Apps revenue</h5>
                  </div>
                  <span className="st">Select an app below</span>
                  <Pie
                     data={appsPieData}
                     options={appsPieOpts}
                     onElementsClick={this.onAppElementsClick}
                  />
               </div>

               <div className="cc">
                  <div className="arrowRight" />
               </div>

               <div>
                  {/* {this.renderDropdown()} */}
                  <div className="report-title">
                     <h5 className="st">Scenes revenue</h5>
                  </div>
                  <span className="st">{sceneTxt}</span>
                  {clickedAppId.length > 0 && (
                     <Pie
                        data={scenesPieData}
                        options={scenesPieOpts}
                        onElementsClick={this.onSceneElementsClick}
                     />
                  )}
               </div>

               <div className="cc">
                  <div className="arrowRight" />
               </div>

               <div>
                  {this.renderDropdown()}
                  <span className="st">{placementTxt}</span>
                  {sceneClicked && (
                     <Pie
                        data={placementsPieData}
                        options={placementsPieOpts}
                        onElementsClick={this.onPlacementElementsClick}
                     />
                  )}
               </div>
            </div>

            <div
               id="performance-webgl"
               onMouseLeave={this.ControlsRotationToggle.bind(null, "disable")}
               onMouseEnter={this.ControlsRotationToggle.bind(null, "enable")}
               style={webglStyle}
            >
               <div id="performance-webgl-left-bar" />
               <div id="performance-webgl-right-bar" />
               <div id="performance-webgl-choose">
                  {!isSceneLoaded &&
                     !isLoadingScene && <div id="report-webgl-idle" />}
                  {isLoadingScene && (
                     <div id="report-webgl-loading">
                        <h3 className="st">Loading Scene...</h3>
                     </div>
                  )}
                  {isSceneLoaded && (
                     <div id="report-webgl-display" className="st">
                        {}
                     </div>
                  )}
               </div>
            </div>

            <div id="performance-tables">
               {this.renderScenesTable()}
               {this.renderPlacementsTable()}
               {/* <ReportTable reportData={placementsData} /> */}
            </div>
         </div>
      );
   }
}
