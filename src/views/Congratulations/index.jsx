import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Redirect, NavLink } from "react-router-dom";
import { routeCodes } from "config/routes";
import PropTypes from "prop-types";

import party from "../../../assets/img/party-popper_1f389_40.png";

export default class Congratulations extends Component {
  static propTypes = {
    location: PropTypes.object
  };

  render() {
    const { location } = this.props;

    if (!location.state || location.state.from.pathname !== "/validation") {
      return (
        <Redirect
          to={{
            pathname: routeCodes.SETUP,
            state: { from: location }
          }}
        />
      );
    }

    return (
      <div className="step-container" id="congratulations">
        <div className="container simple-container">
          <h3 className="st">Congratulations!</h3>
          <div>
            <div className="emoji-container">
              <img src={party} alt="B-)" />
            </div>
            <h2 className="st">
              Your app is now starting to generate revenue.
            </h2>
            <h3 className="mb">
              You are being directed to your dashboard where you can <br />
              follow the progress of your campaign. <br />
            </h3>
            {/* <NavLink exact to="/setup" className="btn btn-dark">
                            Go to dashboard
                        </NavLink> */}
            <a href="/setup" className="btn btn-dark">
              Go to dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }
}
