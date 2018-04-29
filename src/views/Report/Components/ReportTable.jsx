import React, { Component } from "react";
import PropTypes from "prop-types";

export default class WebGLScene extends Component {
  static propTypes = {
    dispatch: PropTypes.func
  };

  constructor(props) {
    super(props);
  }

  numberWithCommas = x => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  parseGrowth = val => {
    val = val === "Infinity" ? 100 : val;
    return val === Infinity || !val || val === "NaN" || val === NaN
      ? "-"
      : val + "%";
  };

  // growth class
  gc = growth => {
    if (growth > 0) {
      return "pos";
    } else if (growth < 0) {
      return "neg";
    }

    return "neut";
  };

  render() {
    const { reportData } = this.props;

    return (
      <table className="table table-bordered reportTable">
        <thead>
          <tr className="st">
            <th scope="col">Previous periods</th>
            <th scope="col">Impressions</th>
            <th scope="col">Revenue</th>
            <th scope="col">Impressions</th>
          </tr>
        </thead>
        <tbody>
          {reportData.map(data => {
            const { previousPeriods, impressions, revenue } = data;
            const impGrowthClass = impressions.growth > 0;
            return (
              <tr className="mb" key={previousPeriods}>
                <td>{previousPeriods}</td>
                <td>
                  {this.numberWithCommas(impressions.value)}
                  <span className={`perc ${this.gc(impressions.growth)}`}>
                    {this.parseGrowth(impressions.growth)}
                  </span>
                </td>
                <td>
                  $ {this.numberWithCommas(revenue.value)}
                  <span className={`perc ${this.gc(revenue.growth)}`}>
                    {this.parseGrowth(revenue.growth)}
                  </span>
                </td>
                <td>
                  {this.numberWithCommas(impressions.value)}
                  <span className={`perc ${this.gc(impressions.growth)}`}>
                    {this.parseGrowth(impressions.growth)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }
}
