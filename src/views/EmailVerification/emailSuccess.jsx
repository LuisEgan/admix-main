import React, { Component } from "react";
import { Redirect } from "react-router-dom"
import routeCodes from "../../config/routeCodes";

// import OK from "../../assets/img/Thumbs_Up_Hand_Sign_Emoji.png";

export default class Congratulations extends Component {
  static propTypes = {};

  render() {
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

        <Redirect
          to={{
            pathname: routeCodes.LOGIN,
            state: { from: routeCodes.EMAIL_SUCCESS },
          }}
        />
      </React.Fragment>
    );
  }
}