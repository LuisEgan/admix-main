import React, { Component } from "react";
import admixLogo from "../../assets/img/logo.png";
import routeCodes from "../../config/routeCodes";

export default class Congratulations extends Component {
  static propTypes = {};

  render() {
    const { history } = this.props;
    return (
      <React.Fragment>
        <noscript>
          <img
            src="https://www.facebook.com/tr?id=2233658986869535&ev=PageView"
            height="1"
            width="1"
            style={{ display: "none" }}
            alt="fb"
          />
        </noscript>

        <div id="login">
          <div>
            <div id="login-header">
              <img src={admixLogo} alt="admix" />
            </div>

            <div id="login-title" className="st">
              <div>Success!</div>
            </div>

            <div
              id="login-forms"
              style={{ justifyContent: "normal", paddingTop: "15px" }}
            >
              <div className="" style={{ color: "#14b9be", padding: "10px 0" }}>
                Your email has been confirmed
              </div>
              <button
                className="gradient-btn"
                style={{ width: "50%", marginTop: "15px" }}
                onClick={() => history.push(routeCodes.LOGIN)}
              >
                Go to <b>Login</b>
              </button>
            </div>
          </div>

          {/* Big right image */}
          <div />
        </div>
      </React.Fragment>
    );
  }
}
