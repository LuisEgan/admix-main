import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Popup from "./Popup";
import actions from "../actions";

import _a from "../utils/analytics";
import C from "../utils/constants";
import STR from "../utils/strFuncs";

const { ga } = _a;

const { toggleAppStatus, updateUser } = actions;

class AppStateToggle extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      oninactive: false,
      onsandbox: false,
      onlive: false,
      reviewClicked: false,
      showPopup: false,
    };

    this.togglePopup = this.togglePopup.bind(this);
    this.handleSubmitForReview = this.handleSubmitForReview.bind(this);
    this.handleMouseHover = this.handleMouseHover.bind(this);
    this.handleAppStateClick = this.handleAppStateClick.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { asyncLoading } = nextProps;
    let newState = {};
    if (prevState.reviewClicked && !asyncLoading) {
      newState.showPopup = false;
    }

    return Object.keys(newState).length ? newState : null;
  }

  togglePopup() {
    const { showPopup } = this.state;
    this.setState({ showPopup: !showPopup });
  }

  handleSubmitForReview() {
    const {
      accessToken,
      userData,
      toggleAppStatus,
      updateUserStatus,
      app: { _id },
    } = this.props;

    const appDetails = {
      appId: _id,
      newData: {
        isActive: false,
        appState: C.APP_STATES.pending,
      },
    };

    this.setState({ reviewClicked: true }, () => {
      toggleAppStatus(appDetails, accessToken);
      updateUserStatus(userData._id, accessToken);
    });
  }

  handleMouseHover(appState) {
    const newState = this.state;
    newState[`on${appState}`] = !newState[`on${appState}`];
    this.setState(newState);
  }

  handleAppStateClick(app, newAppState) {
    const {
      toggleAppStatus,
      accessToken,
      onClick,
      onInactive,
      onSandbox,
      onLive,
      onPending,
    } = this.props;

    let { _id, reviewed, appState } = app;

    if (appState === "pending") return;

    _a.track(ga.actions.apps.toggleAppState, {
      category: ga.categories.apps,
      label: ga.labels.toggleAppState.onMyapps,
      value: STR.appStateToNumber(newAppState),
    });

    onClick && onClick();

    if (newAppState === C.APP_STATES.inactive && onInactive) {
      onInactive();
    } else if (newAppState === C.APP_STATES.sandbox && onSandbox) {
      onSandbox();
    } else if (newAppState === C.APP_STATES.live && onLive) {
      onLive();
    } else if (newAppState === C.APP_STATES.pending && onPending) {
      onPending();
    }

    if (newAppState === "live" && !reviewed) {
      this.setState({ showPopup: true });
      return;
    }

    const appDetails = {
      appId: _id,
      newData: {
        isActive: newAppState === C.APP_STATES.live,
        appState: newAppState,
      },
    };

    toggleAppStatus(appDetails, accessToken);
  }

  liveText(appState) {
    const text =
      appState === C.APP_STATES.pending
        ? {
            title: "Pending",
            tooltip: "In PENDING mode, your app is being reviewed, and you cannot toggle its status in the meantime.",
          }
        : {
            title: STR.capitalizeFirstLetter(C.APP_STATES.live),
            tooltip: "In LIVE mode, ads are delivering and generating revenue.",
          };
    return text;
  }

  render() {
    let { app, asyncLoading, displayTooltip } = this.props;
    const { showPopup, oninactive, onsandbox, onlive } = this.state;
    const { appState } = app;

    if (displayTooltip === undefined) displayTooltip = true;

    const disabledClass =
      appState === C.APP_STATES.pending ? " disabled-btn" : "";

    const offStyle =
      appState === C.APP_STATES.inactive
        ? { backgroundColor: "#d9d9d9", color: "white" }
        : {};
    const sandboxStyle =
      appState === C.APP_STATES.sandbox
        ? { backgroundColor: "orange", color: "white" }
        : {};
    const liveStyle =
      appState === C.APP_STATES.live
        ? { backgroundColor: "#0066ff", color: "white" }
        : appState === C.APP_STATES.pending
        ? { backgroundColor: "#4d4d4d", color: "white" }
        : {};

    const offTooltip = oninactive ? { display: "block" } : {};
    const sandboxTooltip = onsandbox ? { display: "block" } : {};
    const liveTooltip = onlive ? { display: "block" } : {};

    return (
      <React.Fragment>
        <Popup
          id="appStateTogglePopup"
          showPopup={showPopup}
          togglePopup={this.togglePopup}
        >
          <AppStateTogglePopup
            asyncLoading={asyncLoading}
            handleSubmitForReview={this.handleSubmitForReview}
            togglePopup={this.togglePopup}
          />
        </Popup>
        <div className="appStateToggle">
          <div
            className={`${appState}${disabledClass}`}
            style={offStyle}
            onClick={this.handleAppStateClick.bind(
              null,
              app,
              C.APP_STATES.inactive,
            )}
            onMouseEnter={this.handleMouseHover.bind(
              null,
              C.APP_STATES.inactive,
            )}
            onMouseLeave={this.handleMouseHover.bind(
              null,
              C.APP_STATES.inactive,
            )}
          >
            <span>Off</span>
            {displayTooltip && (
              <div className="admix-tooltip" style={offTooltip}>
                In Off mode, ads are not delivering and appear transparent.
              </div>
            )}
          </div>
          <div
            className={`${appState}${disabledClass}`}
            style={sandboxStyle}
            onClick={this.handleAppStateClick.bind(
              null,
              app,
              C.APP_STATES.sandbox,
            )}
            onMouseEnter={this.handleMouseHover.bind(
              null,
              C.APP_STATES.sandbox,
            )}
            onMouseLeave={this.handleMouseHover.bind(
              null,
              C.APP_STATES.sandbox,
            )}
          >
            <span>Sandbox</span>
            {displayTooltip && (
              <div className="admix-tooltip" style={sandboxTooltip}>
                In SANDBOX mode, placeholder ads are delivered for testing
                purposes but not generating revenue.
              </div>
            )}
          </div>
          <div
            className={appState}
            style={liveStyle}
            onClick={this.handleAppStateClick.bind(
              null,
              app,
              C.APP_STATES.live,
            )}
            onMouseEnter={this.handleMouseHover.bind(null, C.APP_STATES.live)}
            onMouseLeave={this.handleMouseHover.bind(null, C.APP_STATES.live)}
          >
            <span id="AppStateToggle-liveText">
              {this.liveText(appState).title}
            </span>
            {displayTooltip && (
              <div className="admix-tooltip" style={liveTooltip}>
                {this.liveText(appState).tooltip}
              </div>
            )}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const AppStateTogglePopup = ({
  asyncLoading,
  handleSubmitForReview,
  togglePopup,
}) => {
  return (
    <React.Fragment>
      <span className="popup-title">Ready to go live?</span>
      <br />
      <br />
      <span className="popup-text">
        Your app will be submitted for review to make sure all is ok. This can
        take 1 to 2h. After that, you'll start to make revenue.
      </span>
      <br />
      <br />
      <span className="popup-btns">
        {asyncLoading && (
          <button className="btn" id="review-btn" type="button">
            Loading...
          </button>
        )}

        {!asyncLoading && (
          <button
            className="btn"
            id="review-btn"
            onClick={handleSubmitForReview}
          >
            Submit for review
          </button>
        )}

        <button className="cancel-btn mb" id="cancel-btn" onClick={togglePopup}>
          Cancel
        </button>
      </span>
    </React.Fragment>
  );
};

AppStateToggle.propTypes = {
  app: PropTypes.object.isRequired,
  displayTooltip: PropTypes.bool,
};

AppStateToggle.defaultProps = {
  app: {},
};

const mapStateToProps = state => {
  const {
    async: { asyncMessage, asyncError, asyncLoading },
  } = state;

  return {
    asyncMessage,
    asyncError,
    asyncLoading,
  };
};

const mapDispatchToProps = dispacth => {
  return {
    toggleAppStatus: (appDetails, accessToken) =>
      dispacth(toggleAppStatus(appDetails, accessToken)),
    updateUserStatus: (userId, accessToken) =>
      dispacth(updateUser(userId, { status: 4 }, accessToken)),
  };
};

AppStateToggle = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AppStateToggle);

export default AppStateToggle;
