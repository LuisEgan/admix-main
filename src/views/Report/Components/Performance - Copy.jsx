import React, { Component } from "react";
import PropTypes from "prop-types";
import { routeCodes } from "../../../config/routes";
import { Pie } from "react-chartjs-2";
import { selectApp, getPlacementsByApp } from "../../../actions";
import ReactTable from "react-table";
import Breadcrumbs from "../../../components/Breadcrumbs";
import SVG from "../../../components/SVG";

import AdmixLoading from "../../../components/SVG/AdmixLoading";

import { colors } from "../../../assets/data/colorsArr";

import { Bar } from "react-chartjs-2";

const data = {
   labels: ["January", "February", "March", "April", "May", "June", "July"],
   datasets: [
      {
         label: "My First dataset",
         backgroundColor: "rgba(255,99,132,0.2)",
         borderColor: "rgba(255,99,132,1)",
         borderWidth: 1,
         hoverBackgroundColor: "rgba(255,99,132,0.4)",
         hoverBorderColor: "rgba(255,99,132,1)",
         data: [65, 59, 80, 81, 56, 55, 40]
      }
   ]
};

const initialGeneralState = {
   selectedAppsLength: 0,
   loadedScene: "",
   selectedPlacement: "",
   sceneClicked: false
};

const initialAppsState = {
   lastClickedAppId: "",
   clickedAppId: "",
   appsgraphData: {},
   appsPieOpts: {},
   appsTableData: []
};

const initialScenesState = {
   scenesgraphData: {},
   scenesPieOpts: {},
   scenesTableData: []
};

const initialPlacementsState = {
   placementNamesUpdate: true,
   placementsNamesById: {},
   placementsgraphData: {},
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

      this.state = {...initialState,
            dataToShow: "Revenue"};

      this.pieColorsAssigned = false;

      this.breadcrumbs = [
         {
            title: "My apps",
            route: routeCodes.MYAPPS
         },
         {
            title: "Reporting",
            route: routeCodes.REPORT
         },
         {
            title: "Performance",
            route: "#"
         }
      ];

      this.dataToggles = ["Revenue", "Impressions", "RPM", "Fill rate"];

      this.toggleData = this.toggleData.bind(this);

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
      console.log('filteredReportData: ', filteredReportData);

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
      const graphBackgroundColors = [];
      const graphLabels = [];
      const graphData = [];

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
         graphBackgroundColors.push(colors[i - 1 + 6]);
         graphLabels.push(appLabel);
         graphData.push(uniqueApps[appId].revenue.toFixed(4));

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

      const appsgraphData = {
         labels: graphLabels,
         datasets: [
            {
               data: graphData,
               backgroundColor: graphBackgroundColors,
               hoverBackgroundColor: graphBackgroundColors
            }
         ]
      };

      const appsPieOpts = {
         legend: false,
         appClickId
      };

      return {
         appsgraphData,
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
      const graphBackgroundColors = [];
      const graphLabels = [];
      const graphData = [];

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
         graphBackgroundColors.push(colors[i - 1]);
         graphLabels.push(sceneLabel);
         graphData.push(uniqueScenes[scene].revenue.toFixed(4));

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

      const scenesgraphData = {
         labels: graphLabels,
         datasets: [
            {
               data: graphData,
               backgroundColor: graphBackgroundColors,
               hoverBackgroundColor: graphBackgroundColors
            }
         ]
      };

      const scenesPieOpts = {
         legend: false,
         sceneClickId
      };

      return {
         scenesgraphData,
         scenesPieOpts,
         scenesTableData,
         placementsTableData
      };
   }

   static setPlacementsData(filteredReportData, loadedScene) {
      // const { loadedScene } = this.state;

      const graphBackgroundColors = [];
      const graphLabels = [];
      const graphData = [];

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
         graphBackgroundColors.push(colors[i - 1]);
         graphLabels.push(placementLabel);
         graphData.push(uniquePlacements[placement].revenue.toFixed(4));
         placementClickId[placementLabel] =
            uniquePlacements[placement].placementId;
         i++;
      }

      const placementsgraphData = {
         labels: graphLabels,
         datasets: [
            {
               data: graphData,
               backgroundColor: graphBackgroundColors,
               hoverBackgroundColor: graphBackgroundColors
            }
         ]
      };

      const placementsPieOpts = {
         legend: false,
         placementClickId
      };

      return { placementsgraphData, placementsPieOpts };

      // this.setState({ placementsgraphData, placementsPieOpts });
   }

   toggleData(dataToShow) {
      this.setState({ dataToShow });
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
         dataToShow,

         clickedAppId,
         appsgraphData,
         appsPieOpts,

         sceneClicked,
         scenesgraphData,
         scenesPieOpts,

         placementsgraphData,
         placementsPieOpts
      } = this.state;

      let webglStyle = {};

      if (isSceneLoaded) {
         webglStyle = { background: "transparent" };
      }

      const sceneTxt = clickedAppId.length > 0 ? "Select a scene below" : "";
      const placementTxt = sceneClicked ? "Select a placement below" : "";

      let dataToggleStyle;

      return (
         <div id="performance" className="unselectable mb">
            <Breadcrumbs breadcrumbs={this.breadcrumbs} />
            <div className="step-title">
               <span className="st">Performance</span>
               <div id="performance-toggles">
                  {this.dataToggles.map(dt => {
                     dataToggleStyle =
                        dt === dataToShow
                           ? {
                                backgroundColor: "rgba(20, 185, 190, 0.05)",
                                border: "2px solid #14B9BE"
                             }
                           : {};
                     return (
                        <div
                           key={dt}
                           style={dataToggleStyle}
                           onClick={this.toggleData.bind(null, dt)}
                        >
                           {dt}
                        </div>
                     );
                  })}
               </div>
            </div>

            <div id="performance-graphs">
               <div className="graph">
                  <div className="sst graph-title">Apps selected</div>
                  <Bar
                     data={data}
                     width={100}
                     height={60}
                  />
               </div>
               <div className="graph">
                  <Bar
                     data={data}
                     width={150}
                     height={50}
                  />
               </div>
               <div className="graph">
                  <Bar
                     data={data}
                     width={50}
                     height={50}
                  />
               </div>
            </div>
         </div>
      );
   }
}

{
   /* <div id="performance-graphs">
   <div>
      <div className="report-title">
         <h5 className="sst">Apps revenue</h5>
      </div>
      <span className="mb">Select an app below</span>
      <Pie
         data={appsgraphData}
         options={appsPieOpts}
         onElementsClick={this.onAppElementsClick}
      />
   </div>

   <div className="cc">
      <div className="arrowRight" />
   </div>

   <div>
      <div className="report-title">
         <h5 className="sst">Scenes revenue</h5>
      </div>
      <span className="mb">{sceneTxt}</span>
      {clickedAppId.length > 0 && (
         <Pie
            data={scenesgraphData}
            options={scenesPieOpts}
            onElementsClick={this.onSceneElementsClick}
         />
      )}
   </div>

   <div className="cc">
      <div className="arrowRight" />
   </div>

   <div>
      <div className="report-title">
         <h5 className="sst">Placements revenue</h5>
      </div>
      <span className="mb">{placementTxt}</span>
      {sceneClicked && (
         <Pie
            data={placementsgraphData}
            options={placementsPieOpts}
            onElementsClick={this.onPlacementElementsClick}
         />
      )}
   </div>
</div> */
}

{
   /* <div
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
</div> */
}