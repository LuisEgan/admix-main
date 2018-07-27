import React, { Component } from "react";
import PropTypes from "prop-types";
import { Pie } from "react-chartjs-2";
import { selectApp, getPlacementsByApp } from "../../../actions";
import ReactTable from "react-table";
import "react-table/react-table.css";

import AdmixLoading from "../../../components/SVG/AdmixLoading";

import { colors } from "../../../assets/data/colorsArr";

const initialGeneralState = {
   selectedAppsLength: 0,
   loadedScene: "",
   selectedPlacement: "",
   sceneClicked: false
};

const initialAppsState = {
   lastClickedAppId: "",
   clickedAppId: "",
   appsPieData: {},
   appsPieOpts: {},
   appsTableData: []
};

const initialScenesState = {
   scenesPieData: {},
   scenesPieOpts: {},
   scenesTableData: []
};

const initialPlacementsState = {
   placementNamesUpdate: true,
   placementsNamesById: {},
   placementsPieData: {},
   placementsPieOpts: {},
   placementsTableData: []
};

const initialState = {
   ...initialGeneralState,
   ...initialAppsState,
   ...initialScenesState,
   ...initialPlacementsState
};

export default class Performance extends Component {
   static propTypes = {
      dispatch: PropTypes.func
   };

   constructor(props) {
      super(props);

      this.state = initialState;

      this.pieColorsAssigned = false;

      this.onAppElementsClick = this.onAppElementsClick.bind(this);
      this.onSceneElementsClick = this.onSceneElementsClick.bind(this);
      this.onPlacementElementsClick = this.onPlacementElementsClick.bind(this);

      this.ControlsRotationToggle = this.ControlsRotationToggle.bind(this);
      this.addEventListeners = this.addEventListeners.bind(this);
      this.disposeEventListeners = this.disposeEventListeners.bind(this);

      // this.setScenesData = this.setScenesData.bind(this);
      // this.setPlacementsData = this.setPlacementsData.bind(this);
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

   static getDerivedStateFromProps(nextProps, prevSate) {
      const {
         selectedAppsLength,
         clickedAppId,
         lastClickedAppId,
         placementNamesUpdate
      } = prevSate;
      const { filteredReportData, selectedApps, isLoadingScene } = nextProps;

      let newState = null;

      if (!isLoadingScene) {
         // if the selected apps (on the left panel) changed
         if (
            selectedAppsLength !== Object.keys(selectedApps).length &&
            Object.keys(filteredReportData).length > 0
         ) {
            newState = {
               ...initialState,
               selectedAppsLength: Object.keys(selectedApps).length,
               ...Performance.setAppsData(filteredReportData, selectedApps)
            };
            nextProps.TJSclear();
         }

         // if the clicked app (on the Apps pie chart) changed
         // reset only the placements data since onAppElementsClick will set the scene's data
         else if (clickedAppId !== lastClickedAppId) {
            newState = {
               ...initialPlacementsState,
               lastClickedAppId: clickedAppId
            };
         }

         if (
            Object.keys(nextProps.placementsByApp).length > 0 &&
            placementNamesUpdate
         ) {
            newState = newState ? newState : {};

            const placementsNamesById = {};

            nextProps.placementsByApp.forEach(placement => {
               placementsNamesById[placement._id] = placement.placementName;
            });

            newState = {
               ...newState,
               placementNamesUpdate: false,
               ...Performance.setScenesData(
                  filteredReportData,
                  clickedAppId,
                  placementsNamesById
               )
            };
         }
      }

      return newState;
   }

   // SET DATA ---------------------------------------------

   static setAppsData(filteredReportData, selectedApps) {
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
                  if (item.revenue) {
                     uniqueApps[appId].revenue =
                        uniqueApps[appId].revenue + item.revenue;
                  }

                  // this is for all the apps table
                  uniqueApps[appId].impression =
                     uniqueApps[appId].impression + item.impression;

                  uniqueApps[appId].impressionUnique =
                     uniqueApps[appId].impressionUnique + item.impressionUnique;
               } else {
                  uniqueApps[appId] = {};
                  uniqueApps[appId].revenue = item.revenue ? item.revenue : 0;

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
         pieData.push(uniqueApps[appId].revenue.toFixed(4));

         // to know what app was clicked to load its scenes
         appClickId[appLabel] = appId;

         // for apps table
         appsTableDataItem.label = appLabel;
         appsTableDataItem.appId = appId;
         appsTableDataItem.revenue = uniqueApps[appId].revenue.toFixed(4);
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

      return {
         appsPieData,
         appsPieOpts,
         appsTableData
      };
   }

   // this also sets placementsTableData
   static setScenesData(
      filteredReportData,
      clickedAppId,
      placementsNamesById = {}
   ) {
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

                  if (uniqueScenes[item.keys.sceid]) {
                     if (item.revenue) {
                        uniqueScenes[item.keys.sceid].revenue =
                           uniqueScenes[item.keys.sceid].revenue + item.revenue;
                     }

                     // this is for all the scenes table
                     uniqueScenes[item.keys.sceid].impression =
                        uniqueScenes[item.keys.sceid].impression +
                        item.impression;

                     uniqueScenes[item.keys.sceid].impressionUnique =
                        uniqueScenes[item.keys.sceid].impressionUnique +
                        item.impressionUnique;
                  } else {
                     uniqueScenes[item.keys.sceid] = {};
                     uniqueScenes[item.keys.sceid].revenue = item.revenue
                        ? item.revenue
                        : 0;
                     uniqueScenes[item.keys.sceid].sceneId = item.keys.sceid;

                     // this is for all the tables
                     uniqueScenes[item.keys.sceid].impression = item.impression;
                     uniqueScenes[item.keys.sceid].impressionUnique =
                        item.impressionUnique;
                  }

                  // ========
                  // PLACEMENTS SUMS
                  // ========

                  if (uniquePlacements[item.keys.plaid]) {
                     if (item.revenue) {
                        uniquePlacements[item.keys.plaid].revenue =
                           uniquePlacements[item.keys.plaid].revenue +
                           item.revenue;
                     }

                     uniquePlacements[item.keys.plaid].impression =
                        uniquePlacements[item.keys.plaid].impression +
                        item.impression;

                     uniquePlacements[item.keys.plaid].impressionUnique =
                        uniquePlacements[item.keys.plaid].impressionUnique +
                        item.impressionUnique;
                  } else {
                     uniquePlacements[item.keys.plaid] = {};

                     uniquePlacements[item.keys.plaid].sceneId =
                        item.keys.sceid;

                     uniquePlacements[item.keys.plaid].placementId =
                        item.keys.plaid;

                     uniquePlacements[item.keys.plaid].revenue = item.revenue
                        ? item.revenue
                        : 0;

                     uniquePlacements[item.keys.plaid].impression =
                        item.impression;

                     uniquePlacements[item.keys.plaid].impressionUnique =
                        item.impressionUnique;

                     uniquePlacements[item.keys.plaid].placementName =
                        placementsNamesById[item.keys.plaid];
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
         pieData.push(uniqueScenes[scene].revenue.toFixed(4));

         // to know what scene was clicked to load its placements
         sceneClickId[sceneLabel] = uniqueScenes[scene].sceneId;

         // for scenes table
         scenesTableDataItem.label = sceneLabel;
         scenesTableDataItem.sceneId = uniqueScenes[scene].sceneId;
         scenesTableDataItem.revenue = uniqueScenes[scene].revenue.toFixed(4);
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

      if (Object.keys(placementsNamesById).length > 0) {
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
               uniquePlacements[placement].placementName;
            placementsTableDataItem.revenue = uniquePlacements[
               placement
            ].revenue.toFixed(4);
            placementsTableDataItem.impression =
               uniquePlacements[placement].impression;
            placementsTableDataItem.impressionUnique =
               uniquePlacements[placement].impressionUnique;

            placementsTableData[
               placementsTableData.length
            ] = placementsTableDataItem;
         }
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

      return {
         scenesPieData,
         scenesPieOpts,
         scenesTableData,
         placementsTableData
      };
   }

   static setPlacementsData(filteredReportData, loadedScene) {
      // const { loadedScene } = this.state;

      const pieBackgroundColors = [];
      const pieLabels = [];
      const pieData = [];

      let uniquePlacements = {};

      // group data by scene
      for (let date in filteredReportData) {
         if (filteredReportData[date]) {
            for (let appId in filteredReportData[date]) {
               if (filteredReportData[date][appId]) {
                  filteredReportData[date][appId].forEach(item => {
                     if (loadedScene === item.keys.sceid) {
                        if (uniquePlacements[item.keys.plaid]) {
                           if (item.revenue) {
                              uniquePlacements[item.keys.plaid].revenue =
                                 uniquePlacements[item.keys.plaid].revenue +
                                 item.revenue;
                           }
                        } else {
                           uniquePlacements[item.keys.plaid] = {};
                           uniquePlacements[
                              item.keys.plaid
                           ].revenue = item.revenue ? item.revenue : 0;
                           uniquePlacements[item.keys.plaid].placementId =
                              item.keys.plaid;
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
         pieData.push(uniquePlacements[placement].revenue.toFixed(4));
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

      return { placementsPieData, placementsPieOpts };

      // this.setState({ placementsPieData, placementsPieOpts });
   }

   // ON CHART CLICK ---------------------------------------------

   onAppElementsClick(e) {
      const { filteredReportData, dispatch, accessToken } = this.props;
      const { clickedAppId } = this.state;

      if (e[0]) {
         const {
            _model: { label },
            _chart: {
               options: { appClickId }
            }
         } = e[0];
         if (appClickId[label] !== clickedAppId) {
            dispatch(selectApp(appClickId[label], accessToken));
            dispatch(getPlacementsByApp(appClickId[label], accessToken));
            this.setState({
               clickedAppId: appClickId[label],
               placementNamesUpdate: true,
               ...Performance.setScenesData(
                  filteredReportData,
                  appClickId[label]
               )
            });
         }
      }
   }

   onSceneElementsClick(e) {
      const { selectedApp, doLoadScene, filteredReportData } = this.props;
      const { loadedScene } = this.state;
      let selectedScene = {};

      if (Object.keys(selectedApp).length > 0) {
         if (e[0]) {
            const {
               _model: { label },
               _chart: {
                  options: { sceneClickId }
               }
            } = e[0];
            if (sceneClickId[label] !== loadedScene) {
               selectedApp.scenes.some(scene => {
                  if (sceneClickId[label] === scene._id) {
                     selectedScene = scene;
                     return true;
                  }
                  return false;
               });
               doLoadScene(selectedScene);
               document.body.style.cursor = "alias";

               this.setState({
                  loadedScene: sceneClickId[label],
                  sceneClicked: true,
                  ...Performance.setPlacementsData(
                     filteredReportData,
                     sceneClickId[label]
                  )
               });
            }
         }
      }
   }

   onPlacementElementsClick(e) {
      const { selectedPlacement } = this.state;

      if (e[0]) {
         const {
            _model: { label },
            _chart: {
               options: { placementClickId }
            }
         } = e[0];
         //    moveCamera("__advirObj__banner2");
         if (placementClickId[label] !== selectedPlacement) {
            // moveCamera(label);
            this.setState({ selectedPlacement: placementClickId[label] });
         }
      }
   }

   // CONTROLS ---------------------------------------------

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

   addEventListeners() {
      const { addEventListeners, isSceneLoaded, isLoadingScene } = this.props;

      if (isSceneLoaded || isLoadingScene) {
         addEventListeners();

         document.body.style.cursor = "alias";
      }
   }

   disposeEventListeners() {
      const {
         disposeEventListeners,
         isSceneLoaded,
         isLoadingScene
      } = this.props;

      if (isSceneLoaded || isLoadingScene) {
         disposeEventListeners();
         document.body.style.cursor = "default";
      }
   }

   // RENDER ---------------------------------------------

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
      const { asyncLoading, selectedApp } = this.props;

      const { scenesTableData } = this.state;

      const Header = selectedApp.name
         ? `${selectedApp.name}'s Scenes`
         : "Your App's Scenes";

      return (
         <ReactTable
            data={scenesTableData}
            noDataText={asyncLoading ? "Loading..." : "No scenes here"}
            columns={[
               {
                  Header,
                  columns: [
                     {
                        Header: "Scene Name",
                        accessor: "label",
                        minWidth: 150
                     },
                     {
                        Header: "Impressions",
                        accessor: "impression",
                        sortMethod: (a, b) => {
                           return a > b ? -1 : 1;
                        }
                     },
                     {
                        Header: "Revenue",
                        accessor: "revenue",
                        sortMethod: (a, b) => {
                           return a > b ? -1 : 1;
                        }
                     },
                     {
                        Header: "Uniques",
                        accessor: "impressionUnique",
                        minWidth: 40,
                        sortMethod: (a, b) => {
                           return a > b ? -1 : 1;
                        }
                     }
                  ]
               }
            ]}
            defaultPageSize={5}
            className="-striped -highlight"
         />
      );
   }

   renderPlacementsTable() {
      const { asyncLoading, selectedApp } = this.props;
      const { placementsTableData } = this.state;

      const Header = selectedApp.name
         ? `${selectedApp.name}'s Placements`
         : "Your App's placements";

      return (
         <ReactTable
            data={placementsTableData}
            noDataText={asyncLoading ? "Loading..." : "No placements here"}
            columns={[
               {
                  Header,
                  columns: [
                     {
                        Header: "Placement Name",
                        accessor: "label",
                        minWidth: 150
                     },
                     {
                        Header: "Scene",
                        accessor: "sceneLabel",
                        minWidth: 50
                     },
                     {
                        Header: "Impressions",
                        accessor: "impression",
                        sortMethod: (a, b) => {
                           return a > b ? -1 : 1;
                        }
                     },
                     {
                        Header: "Revenue",
                        accessor: "revenue",
                        sortMethod: (a, b) => {
                           return a > b ? -1 : 1;
                        }
                     },
                     {
                        Header: "Uniques",
                        accessor: "impressionUnique",
                        minWidth: 40,
                        sortMethod: (a, b) => {
                           return a > b ? -1 : 1;
                        }
                     }
                  ]
               }
            ]}
            defaultPageSize={10}
            className="-striped -highlight"
         />
      );
   }

   render() {
      const {
         isSceneLoaded,
         isLoadingScene,
         progressLoadingScene
      } = this.props;

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
                     <h5 className="sst">Apps revenue</h5>
                  </div>
                  <span className="mb">Select an app below</span>
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
                     <h5 className="sst">Scenes revenue</h5>
                  </div>
                  <span className="mb">{sceneTxt}</span>
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
                  {/* {this.renderDropdown()} */}
                  <div className="report-title">
                     <h5 className="sst">Placements revenue</h5>
                  </div>
                  <span className="mb">{placementTxt}</span>
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
               onMouseLeave={this.disposeEventListeners}
               onMouseEnter={this.addEventListeners}
               style={webglStyle}
            >
               <div id="performance-webgl-left-bar" />
               <div id="performance-webgl-right-bar" />
               <div id="performance-webgl-choose">
                  {!isSceneLoaded && (
                     <div id="report-webgl-idle" className="cc mb">
                        {!isLoadingScene && (
                           <React.Fragment>
                              <span id="tv" role="img" aria-label="tv">
                                 📺
                              </span>
                              <br />
                              <span>Your scene will load here</span>
                           </React.Fragment>
                        )}
                        {isLoadingScene && (
                           <div id="report-webgl-loading">
                              {<AdmixLoading loadingText="Loading" />}
                              <h3 className="st">{progressLoadingScene}%</h3>
                           </div>
                        )}
                     </div>
                  )}
                  {isSceneLoaded && (
                     <div id="report-webgl-display" className="st" />
                  )}
               </div>
            </div>

            <div id="performance-tables">
               {this.renderScenesTable()}
               {this.renderPlacementsTable()}
            </div>
         </div>
      );
   }
}
