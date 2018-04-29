import React, { Component } from "react";
import { connect } from "react-redux";
import ReactDOM from "react-dom";
import { Redirect, NavLink } from "react-router-dom";
import { routeCodes } from "config/routes";
import PropTypes from "prop-types";
import { updatePlacements, toggleAppStatus } from "actions/app";

import cool from "../../../assets/img/Sunglasses_Emoji_40.png";
import coolLoad from "../../../assets/img/Sunglasses_Emoji_load.png";

@connect(state => ({
  asyncError: state.app.get("asyncError"),
  asyncLoading: state.app.get("asyncLoading"),
  selectedApp: state.app.get("selectedApp"),
  savedInputs: state.app.get("savedInputs"),
  accessToken: state.app.get("accessToken")
}))
export default class Validation extends Component {
  static propTypes = {
    asyncError: PropTypes.string,
    asyncLoading: PropTypes.bool,
    selectedApp: PropTypes.object,
    savedInputs: PropTypes.array,
    accessToken: PropTypes.string,
    dispatch: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      startCampaign: false,
      emojiLoaded: false
    };

    this.updatePlacements = this.updatePlacements.bind(this);
    this.emojiLoaded = this.emojiLoaded.bind(this);
  }

  updatePlacements() {
    this.setState({ startCampaign: true });
    const { dispatch, savedInputs, accessToken, selectedApp } = this.props;
    const { _id, platformName, name } = selectedApp;
    const appDetails = {
      _id,
      platformName,
      name,
      isActive: false // false to activate it because the action takes the opposite of what's sent
    };
    dispatch(toggleAppStatus(appDetails, accessToken));

    savedInputs.forEach(input => {
      delete input.placementName;
    });

    dispatch(updatePlacements(accessToken, savedInputs));
  }

  emojiLoaded() {
    this.setState({ emojiLoaded: true });
  }

  render() {
    const { selectedApp, savedInputs, location, asyncLoading } = this.props;
    const { startCampaign, emojiLoaded } = this.state;
    const loadingIcon = <p>Loading...</p>;

    if (savedInputs.length === 0) {
      const route = startCampaign ? "CONGRATULATIONS" : "SETUP";
      return (
        <Redirect
          to={{
            pathname: routeCodes[route],
            state: { from: location }
          }}
        />
      );
    }

    return (
      <div className="step-container" id="validation">
        <div className="container simple-container">
          <h3 className="st">Validate</h3>
          <div>
            <div className="emoji-container">
              {!emojiLoaded && (
                <img
                  src={coolLoad}
                  alt="B-)"
                  onLoad={this.emojiLoaded}
                  className="loading-img"
                />
              )}
              <img src={cool} alt="B-)" onLoad={this.emojiLoaded} />
            </div>
            <h2 className="st">
              Your are one step away from generating revenue
            </h2>
            <h3 className="mb">
              Have you targeted the right advertisers for your content? <br />
              If not, go back to editing stage. Otherwise <br />
            </h3>

            {asyncLoading && loadingIcon}

            {!asyncLoading && (
              <button
                className="btn btn-primary"
                onClick={this.updatePlacements}
              >
                Start campaign
              </button>
            )}

            {/* <NavLink exact to="/congratulations" className="btn btn-primary">
                            Start campaign
                        </NavLink> */}
          </div>
        </div>
      </div>
    );
  }
}

{
  /* <div className="container">
    <div className="validate-section">

        <div className="validate">
            <h2>Validate and start monetizing your content.</h2>
        </div>

        <div className="unity">
            <ul>                        
                <li><a href="#">App: Escape Room VR</a></li>
                <li><a href="#">Setup: Public</a></li>
                <li><a href="#">Sources: Advertising</a></li>
                <li><a href="#">Setting: Outdoor games</a></li>
                <li><a href="#">Inventory: OK</a></li>
                <li><a href="#">Add-on: CognitiveVR</a></li>            
            </ul>
         </div>
        <div className="clearfix">  
            <div className="vali validate-outer">
                <div className="vali-in">
                    <a href="#">Validate</a>
                    <h5>Run Until </h5>
                    <input type="text" id="datepicker" />
                    <img src="images/calender-validity.png" />
                </div> 
            </div> 
        </div>  
    </div>
</div> */
}
