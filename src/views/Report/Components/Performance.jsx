import React, { Component } from "react";
import _a from "../../../utils/analytics";
import PropTypes from "prop-types";
import routeCodes from "../../../config/routeCodes";
import Breadcrumbs from "../../../components/Breadcrumbs";
import { isEqual, cloneDeep } from "lodash";
import STR from "../../../utils/strFuncs";
import CSS from "../../../utils/InLineCSS";

import Input from "@material-ui/core/Input";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemText from "@material-ui/core/ListItemText";
import Select from "@material-ui/core/Select";
import Checkbox from "@material-ui/core/Checkbox";
import { KeyboardArrowDown } from "@material-ui/icons";

import { colors } from "../../../utils/colorsArr";

import BarGraph from "../../../components/BarGraph";

const { ga } = _a;

const generateColor = () => {
  //    return "#" + (((1 << 24) * Math.random()) | 0).toString(16);
  return colors[Math.floor(Math.random() * colors.length)];
};

const emptyGraph = {
  labels: [],
  datasets: [
    {
      data: [],
    },
  ],
};

export default class Performance extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      updateGraphData: false,
      appsGraphData: emptyGraph,
      scenesGraphData: emptyGraph,
      pcsGraphData: emptyGraph,
      filteredReportData: {},
      selectedApps: {},
      selectedAppsScenes: [],
      scenesById: {},
      dataToShow: "revenue",
      selectedScenes: [],
      AllScenesArr: [],
      bgColorsById: {},
    };

    this.breadcrumbs = [
      {
        title: "My apps",
        route: routeCodes.MYAPPS,
      },
      {
        title: "Reporting",
        route: routeCodes.REPORT,
      },
      {
        title: "Performance",
        route: "#",
      },
    ];

    this.dataToggles = ["revenue", "impressions", "RPM", "fillRate"];

    this.graphOptions = {
      defaultFontFamily: "'Montserrat'",
      layout: {
        padding: {
          left: 30,
          right: 30,
          top: 30,
          bottom: 30,
        },
      },
      legend: false,
      tooltips: {
        callbacks: {
          title: function(tooltipItem, data) {
            const label = data.virginLabels ? data.virginLabels : data.labels;
            return label[tooltipItem[0].index];
          },
        },
      },
      scales: {
        xAxes: [
          {
            ticks: {
              fontColor: "rgba(10, 31, 68, 1)",
              fontStyle: "bold",
              fontSize: 10,
              autoSkip: false,
            },
          },
        ],
        yAxes: [
          {
            ticks: {
              fontColor: "rgba(10, 31, 68, 1)",
              fontStyle: "bold",
              beginAtZero: true,
            },
            scaleLabel: {
              display: true,
              fontColor: "rgba(10, 31, 68, .3)",
              fontStyle: "bold",
              labelString: "€ Revenue",
            },
          },
        ],
      },
    };

    this.handleSceneSelection = this.handleSceneSelection.bind(this);
    this.setGraphsData = this.setGraphsData.bind(this);
    this.toggleData = this.toggleData.bind(this);
    this.renderGraph = this.renderGraph.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    const { dataToShow, updateGraphData } = this.state;
    if (dataToShow !== prevState.dataToShow || updateGraphData) {
      this.setGraphsData();
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { placementsByAppId, selectedApps } = nextProps;
    let newState = null;

    if (
      !isEqual(selectedApps, prevState.selectedApps) ||
      !isEqual(placementsByAppId, prevState.placementsByAppId)
    ) {
      const scenesById = {};
      const scenesByAppId = {};
      const selectedScenes = [];
      const selectedAppsScenesById = {};
      const selectedAppsScenes = [];

      let pcData;

      for (let placementId in placementsByAppId) {
        pcData = { ...placementsByAppId[placementId] };

        scenesById[pcData.sceneId._id] = cloneDeep(pcData.sceneId);

        scenesByAppId[pcData.appId] = scenesByAppId[pcData.appId] || [];
        scenesByAppId[pcData.appId].push(cloneDeep(pcData.sceneId));

        selectedScenes.indexOf(pcData.sceneName) < 0 &&
          selectedScenes.push(pcData.sceneName);
      }
      const AllScenesArr = cloneDeep(selectedScenes);

      for (let appId in scenesByAppId) {
        if (selectedApps[appId]) {
          for (let i = 0; i < scenesByAppId[appId].length; i++) {
            selectedAppsScenesById[scenesByAppId[appId][i]._id] = cloneDeep(
              scenesByAppId[appId][i],
            );
          }
        }
      }

      for (let scene in selectedAppsScenesById) {
        selectedAppsScenes.push(selectedAppsScenesById[scene]);
      }

      newState = {
        selectedApps: cloneDeep(nextProps.selectedApps),
        placementsByAppId: cloneDeep(nextProps.placementsByAppId),
        updateGraphData: true,
        scenesById,
        selectedScenes,
        AllScenesArr,
        selectedAppsScenes,
      };
    }

    return newState;
  }

  // SET DATA ---------------------------------------------

  toggleData(dataToShow) {
    _a.track(ga.actions.report.changePerformanceGraphData, {
      category: ga.categories.report,
      label: ga.labels.changePerformanceGraphData[dataToShow],
    });

    this.setState({ dataToShow });
  }

  handleSceneSelection(event) {
    const {
      target: { value },
    } = event;
    let { AllScenesArr, selectedScenes } = this.state;
    selectedScenes =
      value.indexOf("all") >= 0
        ? selectedScenes.length === AllScenesArr.length
          ? []
          : AllScenesArr
        : value;
    this.setState({ selectedScenes }, () => {
      this.setGraphsData();
    });
  }

  setGraphsData() {
    const { placementsByAppId } = this.props;
    let {
      dataToShow,
      scenesById,
      selectedScenes,
      bgColorsById,
      selectedApps,
    } = this.state;

    let appsBgColors = [];
    let appsLabels = [];
    let appsData = [];

    let scenesBgColors = [];
    let scenesLabels = [];
    let scenesData = [];

    let pcsBgColors = [];
    let pcsLabels = [];
    let pcsData = [];

    const reportKeys = ["bySceneId", "byPlacementId"];

    const totals = {
      bySceneId: {},
      byPlacementId: {},
    };

    let reportDataByKey, byItemValue, reportKey;
    let appsCounter = 0;

    for (let appId in selectedApps) {
      appsCounter++;
      for (let i = 0; i < reportKeys.length; i++) {
        reportKey = reportKeys[i];
        reportDataByKey = selectedApps[appId].reportData[reportKey];
        for (let byItemId in reportDataByKey) {
          for (let byItemKey in reportDataByKey[byItemId]) {
            byItemValue = reportDataByKey[byItemId][byItemKey];

            totals[reportKey][byItemId] = totals[reportKey][byItemId] || {};

            totals[reportKey][byItemId][byItemKey] = totals[reportKey][
              byItemId
            ][byItemKey]
              ? totals[reportKey][byItemId] + byItemValue
              : byItemValue;
          }
        }
      }
    }

    let valueToPush, bgColor, pcLabel;
    const appsVirginLabels = [];
    const scenesVirginLabels = [];
    const pcsVirginLabels = [];

    for (let byId in totals) {
      for (let id in totals[byId]) {
        totals[byId][id].revenue = (totals[byId][id].revenue / 1000).toFixed(2);

        dataToShow = dataToShow === "impressions" ? "impression" : dataToShow;

        valueToPush = totals[byId][id][dataToShow];

        if (bgColorsById[id]) {
          bgColor = bgColorsById[id];
        } else {
          bgColor = generateColor();
          bgColorsById[id] = bgColor;
        }

        switch (dataToShow) {
          case "RPM":
            valueToPush = (
              ((totals[byId][id].revenue / totals[byId][id].impression) *
                1000) /
              appsCounter
            ).toFixed(2);
            break;
          case "fillRate":
            valueToPush = (
              ((totals[byId][id].impression / totals[byId][id].bidRequest) *
                100) /
              appsCounter
            ).toFixed(2);
            break;
          default:
        }

        switch (byId) {
          case "bySceneId":
            scenesData.push(valueToPush);
            if (scenesById[id]) {
              scenesLabels.push(scenesById[id].name);
              scenesVirginLabels.push(scenesById[id].name);
            } else {
              scenesLabels.push("loading..");
            }
            scenesBgColors.push(bgColor);
            break;

          case "byPlacementId":
            if (
              placementsByAppId[id] &&
              selectedScenes.indexOf(placementsByAppId[id].sceneName) > -1
            ) {
              pcsData.push(valueToPush);
              pcsBgColors.push(bgColor);

              pcLabel = STR.withoutPrefix(placementsByAppId[id].placementName);
              pcsVirginLabels.push(pcLabel);

              pcLabel =
                pcLabel.split("_-_")[0] +
                " " +
                pcLabel.substring(pcLabel.length / 1.25);
              pcsLabels.push(pcLabel);
            }
            break;

          default:
        }
      }
    }

    const scenesGraphData = {
      labels: scenesLabels,
      datasets: [
        {
          data: scenesData,
          backgroundColor: scenesBgColors,
          hoverBackgroundColor: scenesBgColors,
          label: "Scenes",
        },
      ],
      virginLabels: scenesVirginLabels,
    };

    const pcsGraphData = {
      labels: pcsLabels,
      datasets: [
        {
          data: pcsData,
          backgroundColor: pcsBgColors,
          hoverBackgroundColor: pcsBgColors,
          label: "Placements",
        },
      ],
      virginLabels: pcsVirginLabels,
    };

    // APPS --------------

    for (let appId in selectedApps) {
      appsLabels.push(selectedApps[appId].name);
      appsVirginLabels.push(selectedApps[appId].name);
      appsData.push(selectedApps[appId].reportData[dataToShow]);

      if (bgColorsById[appId]) {
        bgColor = bgColorsById[appId];
      } else {
        bgColor = generateColor();
        bgColorsById[appId] = bgColor;
      }

      appsBgColors.push(bgColor);
    }

    const appsGraphData = {
      labels: appsLabels,
      datasets: [
        {
          data: appsData,
          backgroundColor: appsBgColors,
          hoverBackgroundColor: appsBgColors,
          label: "Apps",
        },
      ],
      virginLabels: appsVirginLabels,
    };

    this.setState({
      appsGraphData,
      scenesGraphData,
      pcsGraphData,
      bgColorsById,
      updateGraphData: false,
    });
  }

  renderGraph(graphData, graphTitle) {
    let { dataToShow } = this.state;

    this.graphOptions.scales.yAxes[0].scaleLabel.labelString =
      dataToShow === "RPM"
        ? dataToShow
        : STR.capitalizeFirstLetter(dataToShow)
            .replace(/([A-Z])/g, " $1")
            .trim();

    switch (dataToShow) {
      case "revenue":
      case "RPM":
        this.graphOptions.scales.yAxes[0].scaleLabel.labelString += " (€)";
        break;

      case "fillRate":
        this.graphOptions.scales.yAxes[0].scaleLabel.labelString += " (%)";
        break;
      default:
    }

    const options = { ...this.graphOptions };
    return (
      <BarGraph
        data={graphData}
        graphTitle={graphTitle}
        graphProps={{
          width: 100,
          height: 50,
          options,
        }}
      />
    );
  }

  render() {
    let {
      dataToShow,
      appsGraphData,
      scenesGraphData,
      pcsGraphData,
      selectedScenes,
      AllScenesArr,
      selectedAppsScenes,
    } = this.state;

    let dataToggleStyle;

    const appsComp = <div className="sst graph-title">{"Apps selected"}</div>;
    const scenesComp = <div className="sst graph-title">{"Scenes"}</div>;
    const pcsComp = (
      <div className="graph-title-cont">
        <div className="sst graph-title">Placements from </div>
        <div>
          <Select
            classes={{ root: "mui-select-root" }}
            disableUnderline={true}
            IconComponent={KeyboardArrowDown}
            style={CSS.mb}
            multiple
            value={selectedScenes}
            onChange={this.handleSceneSelection}
            input={<Input id="select-multiple-checkbox" />}
            renderValue={() => "Select scenes "}
          >
            <MenuItem key={"all"} value={"all"}>
              <Checkbox
                checked={selectedScenes.length === AllScenesArr.length}
              />
              <ListItemText primary={"Select all scenes"} />
            </MenuItem>
            {selectedAppsScenes.map(scene => (
              <MenuItem key={scene.name} value={scene.name}>
                <Checkbox checked={selectedScenes.indexOf(scene.name) > -1} />
                <ListItemText primary={scene.name} />
              </MenuItem>
            ))}
          </Select>
        </div>
      </div>
    );

    return (
      <div id="performance" className="unselectable mb">
        <Breadcrumbs breadcrumbs={this.breadcrumbs} />
        <div className="step-title">
          <span className="st">Performance</span>
          <div id="performance-toggles">
            {this.dataToggles.map((dt, i) => {
              dataToggleStyle =
                dt === dataToShow
                  ? {
                      backgroundColor: "rgba(20, 185, 190, 0.05)",
                      border: "2px solid #14B9BE",
                      borderLeft:
                        dataToShow === "revenue" ? "2px solid #14B9BE" : "none",
                    }
                  : this.dataToggles[i + 1] === dataToShow
                  ? { borderRight: "2px solid #14B9BE" }
                  : {};
              return (
                <div
                  key={dt}
                  style={dataToggleStyle}
                  onClick={this.toggleData.bind(null, dt)}
                >
                  {dt !== "RPM" &&
                    STR.capitalizeFirstLetter(dt)
                      .replace(/([A-Z])/g, " $1")
                      .trim()}
                  {dt === "RPM" && dt}
                </div>
              );
            })}
          </div>
        </div>

        <div id="performance-graphs">
          {this.renderGraph(appsGraphData, appsComp)}
          {this.renderGraph(scenesGraphData, scenesComp)}
          {this.renderGraph(pcsGraphData, pcsComp)}
        </div>
      </div>
    );
  }
}
