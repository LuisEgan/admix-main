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

class MainNavButtons extends React.PureComponent {
  static propTypes = {
    appId: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = { redirect: null };

    this.selectApp = this.selectApp.bind(this);
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
    const { redirect } = this.state;

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
        <button onClick={() => this.selectApp({ redirect: routeCodes.SCENE })}>
          {SVG.setup}
        </button>
        <button onClick={() => this.selectApp({ redirect: routeCodes.INFO })}>
          {SVG.info}
        </button>
        <button onClick={() => this.getReportData()}>{SVG.report}</button>
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
