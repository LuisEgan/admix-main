import React, { Component } from "react";

import OK from "../../assets/img/Thumbs_Up_Hand_Sign_Emoji.png";

export default class Congratulations extends Component {
  static propTypes = {};

  render() {
    return (
      <div className="step-container" id="congratulations">
        <noscript>
          <img
            src="https://www.facebook.com/tr?id=2233658986869535&ev=PageView"
            height="1"
            width="1"
            style={{ display: "none" }}
          />
        </noscript>
        <div className="container simple-container">
          <h3 className="st">Verified!</h3>
          <div>
            <div className="emoji-container">
              <img src={OK} alt="B-)" />
            </div>
            <h2 className="st">Success! You can log in now!</h2>
            <h3 className="mb">
              Right this way <br />
            </h3>
            <a href="/login" className="btn btn-dark">
              Log in
            </a>
          </div>
        </div>
      </div>
    );
  }
}
