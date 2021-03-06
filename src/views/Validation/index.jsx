import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import routeCodes from "../../config/routeCodes";
import PropTypes from "prop-types";
import actions from "../../actions";
import C from "../../utils/constants";

import cool from "../../assets/img/Sunglasses_Emoji_40.png";
import coolLoad from "../../assets/img/Sunglasses_Emoji_load.png";

const { updatePlacements, toggleAppStatus } = actions;

class Validation extends Component {
  static propTypes = {
    asyncError: PropTypes.string,
    asyncLoading: PropTypes.bool,
    selectedApp: PropTypes.object,
    savedInputs: PropTypes.array,
    accessToken: PropTypes.string,
    dispatch: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      startCampaign: false,
      emojiLoaded: false,
    };

    this.updatePlacements = this.updatePlacements.bind(this);
    this.emojiLoaded = this.emojiLoaded.bind(this);
  }

  updatePlacements() {
    const { dispatch, savedInputs, accessToken, selectedApp } = this.props;
    const { _id, platformName, name } = selectedApp;
    const appDetails = {
      _id,
      platformName,
      name,
      isActive: false,
    };
    dispatch(toggleAppStatus(appDetails, accessToken));

    const parsedInputs = savedInputs.map(input => {
      if (input.addedPrefix) {
        input.placementName = input.placementName.replace(
          C.ADMIX_OBJ_PREFIX,
          "",
        );
      }

      return input;
    });

    savedInputs.length !== 0 &&
      dispatch(updatePlacements(accessToken, parsedInputs));

    this.setState({ startCampaign: true });
  }

  emojiLoaded() {
    this.setState({ emojiLoaded: true });
  }

  render() {
    const { savedInputs, location, asyncLoading } = this.props;
    const { startCampaign, emojiLoaded } = this.state;
    const loadingIcon = <p>Loading...</p>;

    if (savedInputs.length === 0 && startCampaign) {
      //  const route = startCampaign ? "CONGRATULATIONS" : "SETUP";
      const route = "CONGRATULATIONS";
      return (
        <Redirect
          to={{
            pathname: routeCodes[route],
            state: { from: location },
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

const mapStateToProps = state => ({ ...state });

export default connect(mapStateToProps)(Validation);
