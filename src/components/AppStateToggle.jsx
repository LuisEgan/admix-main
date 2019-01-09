import React from "react";
import PropTypes from "prop-types";
import { toggleAppStatus } from "../actions";

import _a from "../utils/analytics";
import C from "../utils/constants";
import STR from "../utils/strFuncs";

const { ga } = _a;

class AppStateToggle extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      oninactive: false,
      onsandbox: false,
      onlive: false
    };

    this.handleMouseHover = this.handleMouseHover.bind(this);
    this.handleAppStateClick = this.handleAppStateClick.bind(this);
  }

  handleMouseHover(appState) {
    const newState = this.state;
    newState[`on${appState}`] = !newState[`on${appState}`];
    this.setState(newState);
  }

  handleAppStateClick(app, newAppState) {
    const {
      dispatch,
      accessToken,
      onClick,
      onInactive,
      onSandbox,
      onLive,
      onPending
    } = this.props;

    let { _id, platformName, name, reviewed } = app;

    _a.track(ga.actions.apps.toggleAppState, {
      category: ga.categories.apps,
      label: ga.labels.toggleAppState.onMyapps,
      value: STR.appStateToNumber(newAppState)
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
      return;
    }

    // const appDetails = {
    //   _id,
    //   platformName,
    //   name,
    //   isActive: newAppState === C.APP_STATES.live,
    //   appState: newAppState
    // };

    const appDetails = {
      appId: _id,
      newData: {
        isActive: newAppState === C.APP_STATES.live,
        appState: newAppState
      }
    };

    dispatch(toggleAppStatus(appDetails, accessToken));
  }

  liveText(appState) {
    const text =
      appState === C.APP_STATES.pending
        ? {
            title: "Pending",
            tooltip: "In PENDING mode, your app is being reviewed."
          }
        : {
            title: STR.capitalizeFirstLetter(C.APP_STATES.live),
            tooltip: "In LIVE mode, ads are delivering and generating revenue."
          };
    return text;
  }

  render() {
    let { app, displayTooltip } = this.props;
    const { appState } = app;

    if (displayTooltip === undefined) displayTooltip = true;

    const { oninactive, onsandbox, onlive } = this.state;

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
      <div className="appStateToggle">
        <div
          className={appState}
          style={offStyle}
          onClick={this.handleAppStateClick.bind(
            null,
            app,
            C.APP_STATES.inactive
          )}
          onMouseEnter={this.handleMouseHover.bind(null, C.APP_STATES.inactive)}
          onMouseLeave={this.handleMouseHover.bind(null, C.APP_STATES.inactive)}
        >
          <span>Off</span>
          {displayTooltip && (
            <div className="admix-tooltip" style={offTooltip}>
              In Off mode, ads are not delivering and appear transparent.
            </div>
          )}
        </div>
        <div
          className={appState}
          style={sandboxStyle}
          onClick={this.handleAppStateClick.bind(
            null,
            app,
            C.APP_STATES.sandbox
          )}
          onMouseEnter={this.handleMouseHover.bind(null, C.APP_STATES.sandbox)}
          onMouseLeave={this.handleMouseHover.bind(null, C.APP_STATES.sandbox)}
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
          onClick={this.handleAppStateClick.bind(null, app, C.APP_STATES.live)}
          onMouseEnter={this.handleMouseHover.bind(null, C.APP_STATES.live)}
          onMouseLeave={this.handleMouseHover.bind(null, C.APP_STATES.live)}
        >
          <span id="AppStateToggle-liveText">{this.liveText(appState).title}</span>
          {displayTooltip && (
            <div className="admix-tooltip" style={liveTooltip}>
              {this.liveText(appState).tooltip}
            </div>
          )}
        </div>
      </div>
    );
  }
}

AppStateToggle.propTypes = {
  app: PropTypes.object.isRequired,
  displayTooltip: PropTypes.bool
};

AppStateToggle.defaultProps = {
  app: {}
};

export default AppStateToggle;
