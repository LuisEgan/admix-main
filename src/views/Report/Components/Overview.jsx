import React, { Component } from "react";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
import ReactTable from "react-table";

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
      this.renderPreviousPeriodsTable = this.renderPreviousPeriodsTable.bind(
         this
      );
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
         default:
      }
   }

   formatDate(date) {
      return date.slice(date.indexOf("-") + 1);
   }

   numberWithCommas = x => {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
   };

   calcGrowth(oldest, newest) {
      return (((newest - oldest) * 100) / oldest).toFixed(4);
   }

   calcSumOf(attr) {
      const { filteredReportData } = this.props;
      let sum = 0;
      for (let date in filteredReportData) {
         if (filteredReportData[date]) {
            for (let appId in filteredReportData[date]) {
               if (filteredReportData[date][appId]) {
                  for (
                     let i = 0;
                     i < filteredReportData[date][appId].length;
                     i++
                  ) {
                     sum = filteredReportData[date][appId][i][attr]
                        ? filteredReportData[date][appId][i][attr] + sum
                        : sum;
                  }
               }
            }
         }
      }
      sum = sum ? sum : 0;
      return Number.isInteger(sum) ? Math.round(sum) : sum.toFixed(4);
   }

   calcFillRate() {
      const { calcSumOf } = this;
      let fillRate = (
         calcSumOf("impression") / calcSumOf("bidRequest")
      ).toFixed(4);
      fillRate = isNaN(fillRate) || fillRate === Infinity ? 0 : fillRate;
      return fillRate;
   }

   calcERPM() {
      const { calcSumOf } = this;
      let ERPM = (
         ((calcSumOf("revenue")/1000) / calcSumOf("impression")) *
         1000
      ).toFixed(4);

      ERPM = isNaN(ERPM) ? 0 : ERPM;
      return ERPM;
   }

   previousPeriodsTableData() {
      const { previousPeriods } = this.props;
      // console.log("previousPeriods: ", previousPeriods);
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
            if (period[date]) {
               for (let appId in period[date]) {
                  for (let i = 0; i < period[date][appId].length; i++) {
                     // get the sum of all revenues of that date
                     rDateSum = period[date][appId][i]["revenue"]
                        ? period[date][appId][i]["revenue"] + rDateSum
                        : rDateSum;

                     // get the sum of all impressions of that date
                     iDateSum = period[date][appId][i]["impression"]
                        ? period[date][appId][i]["impression"] + iDateSum
                        : iDateSum;
                  }
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
               value: Number(rDateSum).toFixed(4),
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

            tableData[
               tableDataItemCounter - 1
            ].revenue.growth = this.calcGrowth(
               rDateSum,
               tableData[tableDataItemCounter - 1].revenue.value
            );
         }

         tableDataItemCounter++;
      });

      return tableData;
   }

   renderPreviousPeriodsTable() {
      const { asyncLoading } = this.props;
      let reportData = this.previousPeriodsTableData();

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

      reportData = reportData.map(item => {
         const impressions = (
            <div className="perc">
               {item.impressions.value}
               <span className={`${gc(item.impressions.growth)}`}>
                  {parseGrowth(item.impressions.growth)}
               </span>
            </div>
         );

         const newItem = {
            ...item,
            impressions
         };

         return newItem;
      });

      return (
         <ReactTable
            data={reportData}
            noDataText={asyncLoading ? "Loading..." : "No data here"}
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
                        accessor: "impressions",
                        sortMethod: (a, b) => {
                           return a > b ? -1 : 1;
                        }
                     },
                     {
                        Header: "Revenue",
                        accessor: "revenue.value",
                        sortMethod: (a, b) => {
                           return a > b ? -1 : 1;
                        }
                     }
                  ]
               }
            ]}
            defaultPageSize={7}
            className="-striped -highlight"
         />
      );

      // return (
      //    <table className="table table-bordered reportTable">
      //       <thead>
      //          <tr className="sst">
      //             <th scope="col">Previous periods</th>
      //             <th scope="col">Impressions</th>
      //             <th scope="col">Revenue</th>
      //             <th scope="col">Impressions</th>
      //          </tr>
      //       </thead>
      //       <tbody>
      //          {reportData.map(data => {
      //             const { previousPeriods, impressions, revenue } = data;
      //             return (
      //                <tr className="mb" key={previousPeriods}>
      //                   <td>{previousPeriods}</td>
      //                   <td>
      //                      {impressions.value}
      //                      <span className={`perc ${gc(impressions.growth)}`}>
      //                         {parseGrowth(impressions.growth)}
      //                      </span>
      //                   </td>
      //                   <td>
      //                      $ {revenue.value}
      //                      <span className={`perc ${gc(revenue.growth)}`}>
      //                         {parseGrowth(revenue.growth)}
      //                      </span>
      //                   </td>
      //                   <td>
      //                      {impressions.value}
      //                      <span className={`perc ${gc(impressions.growth)}`}>
      //                         {parseGrowth(impressions.growth)}
      //                      </span>
      //                   </td>
      //                </tr>
      //             );
      //          })}
      //       </tbody>
      //    </table>
      // );
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

         let rDateSum = 0;
         let iDateSum = 0;

         // if there's data of that date
         if (filteredReportData[date]) {
            for (let appId in filteredReportData[date]) {
               if (filteredReportData[date][appId]) {
                  for (
                     let i = 0;
                     i < filteredReportData[date][appId].length;
                     i++
                  ) {
                     // get the sum of all revenues of that date
                     rDateSum = filteredReportData[date][appId][i]["revenue"]
                        ? filteredReportData[date][appId][i]["revenue"] +
                          rDateSum
                        : rDateSum;

                     // get the sum of all impressions of that date
                     iDateSum = filteredReportData[date][appId][i]["impression"]
                        ? filteredReportData[date][appId][i]["impression"] +
                          iDateSum
                        : iDateSum;
                  }
               }
            }
         }

         revenueData.push(rDateSum.toFixed(4));
         impressionsData.push(iDateSum.toFixed(4));
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
      const { calcSumOf } = this;
      const { quickFilter } = this.props;

      return (
         <div id="overview">
            <div id="overview-top">
               {/* TOP LINE */}
               <div id="overview-topLine">
                  <div className="report-title">
                     <h5 className="sst">Top line</h5>
                  </div>
                  <div>
                     {/* BOXES */}
                     <div>
                        <div>
                           <h3 className="st">{calcSumOf("impression")}</h3>
                           <h6 className="mb">impressions</h6>
                           {this.renderQicon("impressions")}
                        </div>
                        <div>
                           <h3 className="st">{(calcSumOf("revenue")/1000).toFixed(4)} €</h3>
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
                              {calcSumOf("impressionUnique")}
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
                     <h5 className="sst">Plot</h5>
                  </div>

                  {/* GRAPH */}
                  <div id="graph">{this.renderGraph()}</div>
               </div>
            </div>

            <div id="overview-bot">
               {quickFilter !== "a" && this.renderPreviousPeriodsTable()}
            </div>
         </div>
      );
   }
}
