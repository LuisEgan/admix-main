import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withLastLocation } from "react-router-last-location";
import { connect } from "react-redux";
import { logout } from "../../actions";

import Routes from "../../config/routes";
import Menu from "../.Global/Menu";
import SideMenu from "../.Global/SideMenu";
import Snackbar from "../.Global/SnackBar";

import _a from "../../utils/analytics";
import STR from "../../utils/strFuncs";

class App extends Component {
  constructor(props) {
    super(props);

    this.updateMenuImg = this.updateMenuImg.bind(this);
  }

  componentDidMount() {
    const {
      history: {
        location: { pathname },
      },
    } = this.props;

    _a.load();

    const pageName = STR.parsePathName(pathname);
    _a.page(pageName, {
      referrer: document.referrer,
    });
  }

  updateMenuImg() {
    this.menu.updateMenuImg();
  }

  forceLogout() {
    const { dispatch } = this.props;
    dispatch(logout());
  }

  render() {
    const {
      isLoggedIn,
      location,
      history,
      lastLocation,
      logoutCount,
    } = this.props;

    if (logoutCount !== 2) {
      this.forceLogout();
      return null;
    }

    if (history.action === "PUSH" || history.action === "REPLACE") {
      const pageName = STR.parsePathName(history.location.pathname);
      _a.page(pageName, {
        referrer: lastLocation.pathname,
      });
    }

    const contentStyle = !isLoggedIn ? { width: "100%" } : {};

    return (
      <div className="App">
        <Menu
          isLoggedIn={isLoggedIn}
          location={location}
          history={history}
          onRef={ref => (this.menu = ref)}
        />
        <div id="Page">
          <SideMenu location={location} history={history} />
          <div id="content" style={contentStyle}>
            <Routes
              isLoggedIn={isLoggedIn}
              location={location}
              updateMenuImg={this.updateMenuImg}
            />
          </div>
        </div>
        <Snackbar />
      </div>
    );
  }
}

const mapStateToProps = state => {
  const {
    app: { isLoggedIn, logoutCount },
  } = state;
  return {
    isLoggedIn,
    logoutCount,
  };
};

export default withLastLocation(withRouter(connect(mapStateToProps)(App)));
