import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import PropTypes from "prop-types";
import actions from "../actions";
import SVG from "./SVG";
import routeCodes from "../config/routeCodes";

const {
  selectApp,
  getReportData,
  setInitialReportApp,
  getPlacementsByAppId,
  getScenesByAppId,
} = actions;

class MainNavButtons extends React.Component {
  static propTypes = {
    appId: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      redirect: null,
      hoverEdit: false,
      hoverInfo: false,
      hoverReport: false,
    };

    this.handleMouseHover = this.handleMouseHover.bind(this);
    this.selectApp = this.selectApp.bind(this);
  }

  handleMouseHover(button) {
    const newState = this.state;
    newState[`hover${button}`] = !newState[`hover${button}`];
    this.setState(newState);
  }

  selectApp({ redirect }) {
    redirect = window.location.pathname === redirect ? null : redirect;
    if (!redirect) return;

    const { accessToken, selectApp, appId } = this.props;

    selectApp({ appId, accessToken });
    this.setState({ redirect });
  }

  getReportData() {
    const redirect =
      window.location.pathname === routeCodes.REPORT ? null : routeCodes.REPORT;
    if (!redirect) return;

    const {
      appId,
      userId,
      userData,
      accessToken,
      adminToken,
      getPlacementsByAppId,
      getScenesByAppId,
      getReportData,
      setInitialReportApp,
    } = this.props;

    const getObj = {
      appId,
      accessToken,
      publisherId: userId || userData._id,
    };

    if (adminToken) {
      getObj.adminToken = adminToken;
    }

    getPlacementsByAppId(getObj);
    getScenesByAppId(getObj);
    getReportData(getObj);
    setInitialReportApp(appId);

    this.setState({ redirect });
  }

  render() {
    const { redirect, hoverEdit, hoverInfo, hoverReport } = this.state;
    const {
      location: { pathname },
    } = window;
    const onScene = pathname === routeCodes.SCENE;
    const onInfo = pathname === routeCodes.INFO;
    const onReport = pathname === routeCodes.REPORT;

    const editTooltip = hoverEdit ? { display: "block" } : {};
    const infoTooltip = hoverInfo ? { display: "block" } : {};
    const reportTooltip = hoverReport ? { display: "block" } : {};

    if (redirect) {
      return (
        <Redirect
          to={{
            pathname: redirect,
          }}
        />
      );
    }

    return (
      <div className="app-buttons">
        <div
          onMouseEnter={() => this.handleMouseHover("Edit")}
          onMouseLeave={() => this.handleMouseHover("Edit")}
        >
          <button
            className={onScene ? "app-button-selected" : ""}
            onClick={() => this.selectApp({ redirect: routeCodes.SCENE })}
          >
            {SVG.setup}
          </button>
          <div className="admix-tooltip tooltip-left" style={editTooltip}>
            Manage your placements, filter advertisers and activate your app.
          </div>
        </div>

        <div
          onMouseEnter={() => this.handleMouseHover("Info")}
          onMouseLeave={() => this.handleMouseHover("Info")}
        >
          <button
            className={onInfo ? "app-button-selected" : ""}
            onClick={() => this.selectApp({ redirect: routeCodes.INFO })}
          >
            {SVG.info}
          </button>
          <div className="admix-tooltip" style={infoTooltip}>
            Manage your app information.
          </div>
        </div>

        <div
          onMouseEnter={() => this.handleMouseHover("Report")}
          onMouseLeave={() => this.handleMouseHover("Report")}
        >
          <button
            className={onReport ? "app-button-selected" : ""}
            onClick={() => this.getReportData()}
          >
            {SVG.report}
          </button>
          <div className="admix-tooltip tooltip-right" style={reportTooltip}>
            Check performance reports and how much revenue you've made.
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const { app, async } = state;

  return { ...app, ...async };
};

const mapDispatchToProps = dispatch => {
  return {
    selectApp: ({ appId, accessToken }) =>
      dispatch(selectApp(appId, accessToken)),

    getPlacementsByAppId: ({ appId, accessToken }) =>
      dispatch(getPlacementsByAppId({ appId, accessToken, noSetAsync: true })),
    getScenesByAppId: ({ appId, accessToken }) =>
      dispatch(getScenesByAppId({ appId, accessToken, noSetAsync: true })),
    getReportData: ({ appId, accessToken, publisherId }) =>
      dispatch(getReportData({ appId, accessToken, publisherId })),
    setInitialReportApp: appId => dispatch(setInitialReportApp(appId)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MainNavButtons);
