import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import qs from "qs";
import api from "../../api";
import C from "../../utils/constants";
import routeCodes from "../../config/routeCodes";

class AppActivation extends React.Component {
  constructor(props) {
    super(props);
    const { location } = props;

    const appId = qs.parse(location.search)["?id"];

    this.state = {
      appId,
      loading: true,
      appDetails: null,
      redirect: false,
    };
  }

  componentDidMount = () => {
    this.activateApp();
  };

  activateApp = async () => {
    const { accessToken, adminToken } = this.props;
    const { appId } = this.state;
    let newState = { loading: false };

    if (!accessToken) {
      newState.message = "Please login first!";
    } else if (!adminToken) {
      newState.redirect = true;
    } else {
      const data = {
        appId,
        newData: {
          appState: C.APP_STATES.live,
          isActive: true,
          reviewed: true,
        },
      };
      const res = await api.updateApp(accessToken, data);

      if (res.status) {
        newState.message = "App activated!";
        newState.appDetails = res.data;
      } else {
        newState.message = `Error: ${res.statusMessage}`;
      }
    }

    this.setState(newState);
  };

  render() {
    const { redirect, loading, message, appDetails } = this.state;

    if (redirect) {
      return (
        <Redirect
          to={{
            pathname: routeCodes.LOGIN,
            state: { from: this.props.location },
          }}
        />
      );
    }

    return (
      <div className="mb" style={{ width: "70%", margin: "5vh auto" }}>
        {loading && <div>Loading....</div>}
        {!loading && <div>{message}</div>}
        <br />
        {appDetails && (
          <div>
            <code>
              <ul>
                {Object.keys(appDetails).map(key => {
                  return <li key={key}>{`${key} : ${appDetails[key]}`}</li>;
                })}
              </ul>
            </code>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  const {
    app: { accessToken, adminToken },
  } = state;

  return { accessToken, adminToken };
};

AppActivation = connect(mapStateToProps)(AppActivation);

export default AppActivation;
