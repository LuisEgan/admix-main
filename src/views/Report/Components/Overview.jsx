import React, { Component } from "react";
import { routeCodes } from "../../../config/routes";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
import ReactTable from "react-table";
import Breadcrumbs from "../../../components/Breadcrumbs";
import SVG from "../../../components/SVG";
import { isEqual, cloneDeep } from "lodash";

export default class Overview extends Component {
   static propTypes = {
      dispatch: PropTypes.func
   };

   constructor(props) {
      super(props);

      this.state = {
         selectedApps: {},
         overviewData: {
            revenue: 0,
            impression: 0,
            bidRequest: 0,
            bidResponse: 0,
            gaze: 0,
            gazeUnique: 0,
            impressionUnique: 0,
            RPM: 0,
            fillRate: 0
         }
      };

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
            title: "Overview",
            route: "#"
         }
      ];

      this.previousPeriodsTableData = this.previousPeriodsTableData.bind(this);
      this.renderPreviousPeriodsTable = this.renderPreviousPeriodsTable.bind(
         this
      );
      this.renderGraph = this.renderGraph.bind(this);
   }

   static getDerivedStateFromProps(nextProps, prevState) {
      const { selectedApps } = nextProps;

      if (!isEqual(selectedApps, prevState.selectedApps)) {
         const overviewData = {
            revenue: Overview.calcSumOf({ selectedApps, attr: "revenue" }),
            impression: Overview.calcSumOf({
               selectedApps,
               attr: "impression"
            }),
            bidRequest: Overview.calcSumOf({
               selectedApps,
               attr: "bidRequest"
            }),
            bidResponse: Overview.calcSumOf({
               selectedApps,
               attr: "bidResponse"
            }),
            gaze: Overview.calcSumOf({ selectedApps, attr: "gaze" }),
            gazeUnique: Overview.calcSumOf({
               selectedApps,
               attr: "gazeUnique"
            }),
            impressionUnique: Overview.calcSumOf({
               selectedApps,
               attr: "impressionUnique"
            }),
            RPM: Overview.calcSumOf({ selectedApps, attr: "RPM" }),
            fillRate: Overview.calcSumOf({ selectedApps, attr: "fillRate" })
         };
         return { selectedApps: cloneDeep(selectedApps), overviewData };
      }

      return null;
   }

   static calcSumOf({ selectedApps, attr }) {
      let sum = 0;

      for (let appId in selectedApps) {
         if (selectedApps[appId].reportData[attr]) {
            sum = selectedApps[appId].reportData[attr] + sum;
         }
      }

      return Number.isInteger(sum) ? Math.round(sum) : +sum.toFixed(2);
   }

   formatDate(date) {
      return date.split("/")[0] + "/" + date.split("/")[1];
   }

   numberWithCommas = x => {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
   };

   calcGrowth(oldest, newest) {
      return (((newest - oldest) * 100) / oldest).toFixed(2);
   }

   previousPeriodsTableData() {
      const { previousPeriods } = this.props;
      let tableData = [];

      let tableDataItemCounter = 0;
      let from, to, pperiod;
      let appReportItem;
      previousPeriods.forEach(period => {
         from = `${period.from.getMonth() + 1}-${period.from.getDate()}`;
         to = `${period.to.getMonth() + 1}-${period.to.getDate()}`;
         pperiod = `${from} to ${to}`;

         const totals = {
            revenue: 0,
            impression: 0
         };
         const tableDataItem = {};

         for (let appId in period.data) {
            for (let total in totals) {
               appReportItem = period.data[appId][total];
               totals[total] = appReportItem
                  ? totals[total] + appReportItem
                  : totals[total];
            }
         }

         for (let total in totals) {
            tableDataItem.previousPeriods = pperiod;

            tableDataItem[total] = {
               value: +totals[total],
               growth: 0
            };
         }

         tableData.push(tableDataItem);

         if (tableDataItemCounter > 0) {
            for (let total in totals) {
               tableData[tableDataItemCounter - 1][
                  total
               ].growth = this.calcGrowth(
                  tableData[tableDataItemCounter][total].value,
                  tableData[tableDataItemCounter - 1][total].value
               );
            }
         }

         tableDataItemCounter++;
      });

      return tableData;
   }

   renderPreviousPeriodsTable() {
      const { asyncLoading, quickFilter } = this.props;
      let reportData = this.previousPeriodsTableData();

      let previousPeriodsStr;
      reportData = reportData.map(data => {
         previousPeriodsStr = data.previousPeriods;
         previousPeriodsStr = previousPeriodsStr.split("to");
         data.previousPeriods = (
            <React.Fragment>
               {previousPeriodsStr[0]}
               &nbsp;
               <span style={{ color: "##0A1F44", opacity: 0.3 }}>to</span>
               &nbsp;
               {previousPeriodsStr[1]}
            </React.Fragment>
         );
         return data;
      });

      if (reportData[0].previousPeriods === "") return null;

      const parseGrowth = val => {
         val = val === "Infinity" ? 100 : val;
         return val === Infinity || !val || val === "NaN" || isNaN(val)
            ? "-"
            : val + "%";
      };

      // growth class
      const gc = growth => {
         if (growth > 0) {
            return "pos";
         } else if (growth < 0) {
            return "neg";
         }

         return "neut";
      };

      reportData =
         quickFilter === "a"
            ? []
            : reportData.map(item => {
                 item.impression = (
                    <div className="perc">
                       {item.impression.value}
                       <span className={`${gc(item.impression.growth)}`}>
                          {parseGrowth(item.impression.growth)}
                       </span>
                    </div>
                 );

                 item.revenue = (
                    <div className="perc">
                       {item.revenue.value}
                       <span className={`${gc(item.revenue.growth)}`}>
                          {parseGrowth(item.revenue.growth)}
                       </span>
                    </div>
                 );
                 return item;
              });

      const paginationPrevious = props => {
         const { disabled } = props;

         return disabled ? (
            <button {...props}>{SVG.paginationDisabled}</button>
         ) : (
            <button {...props} className="hundred80">
               {SVG.paginationEnabled}
            </button>
         );
      };

      const paginationNext = props => {
         const { disabled } = props;

         return disabled ? (
            <button {...props} className="hundred80">
               {SVG.paginationDisabled}
            </button>
         ) : (
            <button {...props}>{SVG.paginationEnabled}</button>
         );
      };

      return (
         <div className="rawDataTable">
            <ReactTable
               data={reportData}
               noDataText={asyncLoading ? "Loading..." : "No previous periods"}
               columns={[
                  {
                     Header: "Previous Periods",
                     columns: [
                        {
                           Header: "Periods",
                           accessor: "previousPeriods",
                           minWidth: 50,
                           sortable: false
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
                        }
                     ]
                  }
               ]}
               defaultPageSize={5}
               className="-striped -highlight"
               PreviousComponent={paginationPrevious}
               NextComponent={paginationNext}
            />
         </div>
      );
   }

   renderGraph() {
      const { selectedApps } = this.state;

      const totalByDate = {
         revenue: {},
         impression: {}
      };

      const uniqueDates = {};

      let byDatedata;
      for (let appId in selectedApps) {
         for (let date in selectedApps[appId].reportData.byDate) {
            uniqueDates[date] = date;
            byDatedata = selectedApps[appId].reportData.byDate[date];
            for (let totalKey in totalByDate) {
               totalByDate[totalKey][date] = totalByDate[totalKey][date]
                  ? totalByDate[totalKey][date] + byDatedata[totalKey]
                  : byDatedata[totalKey];
            }
         }
      }

      const labels = [];
      const revenueData = [];
      const impressionData = [];

      const uniqueDatesArr = [];
      for (let date in uniqueDates) {
         uniqueDatesArr.push(date);
      }

      uniqueDatesArr.sort().forEach(date => {
         labels.push(this.formatDate(date));

         if (totalByDate.revenue[date]) {
            totalByDate.revenue[date] = (
               totalByDate.revenue[date] / 1000
            ).toFixed(2);
            revenueData.push(totalByDate.revenue[date]);
         }
         impressionData.push(totalByDate.impression[date] || 0);
      });

      const data = {
         labels: labels,
         datasets: [
            {
               label: "Revenues",
               data: revenueData,
               yAxisID: "A",
               backgroundColor: "rgb(51, 255, 255)",
               fill: false,
               borderWidth: 1,
               borderColor: ["rgb(51, 255, 255)"]
            },
            {
               label: "Impressions",
               data: impressionData,
               yAxisID: "B",
               backgroundColor: "rgb(0, 143, 204)",
               fill: false,
               borderWidth: 1,
               borderColor: ["rgb(0, 143, 204)"]
            }
         ]
      };

      const options = {
         defaultFontFamily: "'Montserrat'",
         layout: {
            padding: {
               left: 30,
               right: 30,
               top: 30,
               bottom: 30
            }
         },
         legend: {
            labels: {
               fontColor: "rgba(10, 31, 68, 1)",
               fontStyle: "bold"
            }
         },
         scales: {
            xAxes: [
               {
                  offset: true,
                  gridLines: {
                     //  display: false
                     //  offsetGridLines: true
                  },
                  ticks: {
                     fontColor: "rgba(10, 31, 68, 1)",
                     fontStyle: "bold",
                     autoSkip: false
                  }
               }
            ],
            yAxes: [
               {
                  borderColor: "rgba(15, 15, 15, 0)",
                  // gridLines: { display: false },
                  id: "A",
                  position: "left",
                  scaleLabel: {
                     display: true,
                     fontColor: "rgb(51, 255, 255)",
                     labelString: "€ Revenue",
                     fontStyle: "bold"
                  },
                  ticks: { fontColor: "rgba(10, 31, 68, 1)", fontStyle: "bold" }
               },
               {
                  borderColor: "rgba(15, 15, 15, 0)",
                  gridLines: { display: false },
                  id: "B",
                  position: "right",
                  scaleLabel: {
                     display: true,
                     fontColor: "rgb(0, 143, 204)",
                     labelString: "Impressions",
                     fontStyle: "bold"
                  },
                  ticks: { fontColor: "rgba(10, 31, 68, 1)", fontStyle: "bold" }
               }
            ]
         }
      };

      return <Line ref="chart" data={data} options={options} />;
   }

   render() {
      const { overviewData } = this.state;

      return (
         <div id="overview" className="mb">
            <Breadcrumbs breadcrumbs={this.breadcrumbs} />
            <div className="step-title">
               <span className="st">Overview</span>
            </div>

            <div id="overview-data">
               <div>
                  <div>{overviewData.impression}</div>
                  <span>Impressions</span>
               </div>
               <div>
                  <div>€ {overviewData.revenue}</div>
                  <span>Net Revenue</span>
               </div>
               <div>
                  <div>{overviewData.impressionUnique}</div>
                  <span>Uniques</span>
               </div>
               <div>
                  <div>{overviewData.fillRate}%</div>
                  <span>Fill rate</span>
               </div>
               <div>
                  <div>€ {overviewData.RPM}</div>
                  <span>RPM</span>
               </div>
            </div>

            <div id="overview-graph">
               <div className="graph">{this.renderGraph()}</div>
            </div>

            <div id="overview-table">{this.renderPreviousPeriodsTable()}</div>
         </div>
      );
   }
}
