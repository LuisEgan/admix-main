import React, { Component } from "react";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";

import ReportTable from "./ReportTable";

export default class Overview extends Component {
  static propTypes = {
    dispatch: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      impressionsInfoBox: false,
      revenueInfoBox: false,
      rateInfoBox: false,
      uniquesInfoBox: false,
      rpmInfoBox: false
    };

    this.calcSumOf = this.calcSumOf.bind(this);
    this.calcFillRate = this.calcFillRate.bind(this);
    this.calcERPM = this.calcERPM.bind(this);
    this.previousPeriodsTableData = this.previousPeriodsTableData.bind(this);
    this.toggleInfoBox = this.toggleInfoBox.bind(this);
    this.renderQicon = this.renderQicon.bind(this);
    this.renderGraph = this.renderGraph.bind(this);
  }

  toggleInfoBox(input) {
    switch (input) {
      case "impressions":
        const impressionsInfoBox = !this.state.impressionsInfoBox;
        this.setState({ impressionsInfoBox });
        break;
      case "revenue":
        const revenueInfoBox = !this.state.revenueInfoBox;
        this.setState({ revenueInfoBox });
        break;
      case "rate":
        const rateInfoBox = !this.state.rateInfoBox;
        this.setState({ rateInfoBox });
        break;
      case "uniques":
        const uniquesInfoBox = !this.state.uniquesInfoBox;
        this.setState({ uniquesInfoBox });
        break;
      case "rpm":
        const rpmInfoBox = !this.state.rpmInfoBox;
        this.setState({ rpmInfoBox });
        break;
    }
  }

  formatDate(date) {
    return date.slice(date.indexOf("-") + 1);
  }

  numberWithCommas = x => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  calcGrowth(oldest, newest) {
    return ((newest - oldest) * 100 / oldest).toFixed(2);
  }

  calcSumOf(attr) {
    const { filteredReportData } = this.props;
    let sum = 0;
    for (let date in filteredReportData) {
      if (!!filteredReportData[date]) {
        for (let appId in filteredReportData[date]) {
          if (!!filteredReportData[date][appId]) {
            filteredReportData[date][appId].forEach(item => {
              sum += item[attr];
            });
          }
        }
      }
    }
    sum = sum ? sum : 0;
    return sum;
  }

  calcFillRate() {
    const { calcSumOf } = this;
    let fillRate = (calcSumOf("impression") / calcSumOf("request")).toFixed(2);
    fillRate = isNaN(fillRate) ? 0 : fillRate;
    return fillRate;
  }

  calcERPM() {
    const { calcSumOf } = this;
    let ERPM = (calcSumOf("revenue") / calcSumOf("impression") * 1000).toFixed(
      2
    );

    ERPM = isNaN(ERPM) ? 0 : ERPM;
    return ERPM;
  }

  previousPeriodsTableData() {
    const { previousPeriods } = this.props;
    let tableData = [];

    let tableDataItemCounter = 0;
    previousPeriods.forEach(period => {
      const periodLength = Object.keys(period).length;
      let tableDataItem = {};

      let previousPeriods = "";
      let datesCounter = 0;
      let fromPeriod = "";
      let toPeriod = "";
      let rDateSum = 0;
      let iDateSum = 0;
      for (let date in period) {
        if (datesCounter === 0) {
          fromPeriod = this.formatDate(date);
          toPeriod = this.formatDate(date);
          previousPeriods = fromPeriod + " to " + toPeriod;
        } else if (datesCounter === periodLength - 1) {
          toPeriod = this.formatDate(date);
          previousPeriods = fromPeriod + " to " + toPeriod;
        }

        // if there's data of that date
        if (!!period[date]) {
          for (let appId in period[date]) {
            period[date][appId].forEach(item => {
              // get the sum of all revenues of that date
              rDateSum += item["revenue"];

              // get the sum of all impressions of that date
              iDateSum += item["impression"];
            });
          }
        }

        datesCounter++;
      }

      tableDataItem = {
        previousPeriods,
        impressions: {
          value: iDateSum,
          growth: 0
        },
        revenue: {
          value: rDateSum,
          growth: 0
        }
      };

      tableData.push(tableDataItem);

      // set growths
      if (tableDataItemCounter > 0) {
        tableData[
          tableDataItemCounter - 1
        ].impressions.growth = this.calcGrowth(
          iDateSum,
          tableData[tableDataItemCounter - 1].impressions.value
        );

        tableData[tableDataItemCounter - 1].revenue.growth = this.calcGrowth(
          rDateSum,
          tableData[tableDataItemCounter - 1].revenue.value
        );
      }

      tableDataItemCounter++;
    });

    return tableData;
  }

  renderQicon(input) {
    const style = !this.state[`${input}InfoBox`]
      ? { display: "none" }
      : { display: "block" };

    const infoBoxesTexts = {
      impressions: "impressions",
      revenue: "revenue",
      rate: "rate",
      uniques: "uniques",
      rpm: "rpm"
    };

    return (
      <div className="question-icon">
        <div className="info-box" style={style} id={`${input}-info-box`}>
          {infoBoxesTexts[input]}
        </div>
        <i
          className="fa fa-question-circle"
          aria-hidden="true"
          onMouseEnter={this.toggleInfoBox.bind(null, input)}
          onMouseLeave={this.toggleInfoBox.bind(null, input)}
        />
      </div>
    );
  }

  renderGraph() {
    const { filteredReportData } = this.props;
    let labels = [];
    let revenueData = [];
    let impressionsData = [];

    for (let date in filteredReportData) {
      labels.push(this.formatDate(date));

      // if there's data of that date
      let rDateSum = 0;
      let iDateSum = 0;

      if (!!filteredReportData[date]) {
        for (let appId in filteredReportData[date]) {
          if (!!filteredReportData[date][appId]) {
            filteredReportData[date][appId].forEach(item => {
              // get the sum of all revenues of that date
              rDateSum += item["revenue"];

              // get the sum of all impressions of that date
              iDateSum += item["impression"];
            });
          }
        }
      }

      revenueData.push(rDateSum);
      impressionsData.push(iDateSum);
    }

    const data = {
      labels,
      datasets: [
        {
          label: "Revenues",
          data: revenueData,
          yAxisID: "A",
          backgroundColor: "rgba(255, 255, 255, 0)",
          borderColor: "rgba(0, 0, 0, 1)",
          borderWidth: 1,
          steppedLine: false
        },
        {
          label: "Impressions",
          data: impressionsData,
          yAxisID: "B",
          backgroundColor: "rgba(255, 255, 255, 0)",
          borderColor: "rgb(21, 124, 193)",
          borderWidth: 1,
          steppedLine: false
        }
      ]
    };

    const options = {
      scales: {
        xAxes: [
          {
            gridLines: {
              display: false
            }
          }
        ],
        yAxes: [
          {
            borderColor: "rgba(15, 15, 15, 0)",
            gridLines: { display: false },
            id: "A",
            position: "left",
            scaleLabel: {
              display: true,
              fontColor: "rgba(0, 0, 0, .5)",
              labelString: "$ revenue"
            },
            ticks: { fontColor: "rgba(15, 15, 15, 1)" }
          },
          {
            borderColor: "rgba(15, 15, 15, 0)",
            gridLines: { display: false },
            id: "B",
            position: "right",
            scaleLabel: {
              display: true,
              fontColor: "rgba(0, 0, 0, .5)",
              labelString: "impressions"
            },
            ticks: { fontColor: "rgba(15, 15, 15, 1)" }
          }
        ]
      }
    };

    return <Line data={data} options={options} />;
  }

  render() {
    const { numberWithCommas, calcSumOf } = this;
    const { tableData } = this.props;

    return (
      <div id="overview">
        <div id="overview-top">
          {/* TOP LINE */}
          <div id="overview-topLine">
            <div className="report-title">
              <h5 className="st">Top line</h5>
            </div>
            <div>
              {/* BOXES */}
              <div>
                <div>
                  <h3 className="st">
                    {this.numberWithCommas(calcSumOf("impression"))}
                  </h3>
                  <h6 className="mb">impressions</h6>
                  {this.renderQicon("impressions")}
                </div>
                <div>
                  <h3 className="st">
                    ${this.numberWithCommas(calcSumOf("revenue"))}
                  </h3>
                  <h6 className="mb">net revenue</h6>
                  {this.renderQicon("revenue")}
                </div>
              </div>

              {/* STATISTICS */}
              <div>
                <div>
                  <h3 className="st">{this.calcFillRate()}%</h3>
                  <h6 className="mb">fill rate</h6>
                  {this.renderQicon("rate")}
                </div>
                <div>
                  <h3 className="st">
                    {this.numberWithCommas(calcSumOf("impressionUnique"))}
                  </h3>
                  <h6 className="mb">uniques</h6>
                  {this.renderQicon("uniques")}
                </div>
                <div>
                  <h3 className="st">{this.calcERPM()}</h3>
                  <h6 className="mb">RPM</h6>
                  {this.renderQicon("rpm")}
                </div>
              </div>
            </div>
          </div>

          {/* PLOT */}
          <div id="overview-plot">
            <div className="report-title">
              <h5 className="st">Plot</h5>
            </div>

            {/* GRAPH */}
            <div id="graph">{this.renderGraph()}</div>
          </div>
        </div>

        <div id="overview-bot">
          <ReportTable reportData={this.previousPeriodsTableData()} />
        </div>
      </div>
    );
  }
}
