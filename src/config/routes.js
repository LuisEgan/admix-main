import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";

import Home from "views/Home";
import Login from "views/Login";
import Setup from "views/Setup";
import Placement from "views/Placement";
import Scene from "views/Scene";
import Validation from "views/Validation";
import Congratulations from "views/Congratulations";
import Report from "views/Report";
import Profile from "views/Profile";
import Dashboard from "views/Dashboard";
import NotFound from "views/NotFound";
import Auth from "utils/auth";

const publicPath = "/";

export const routeCodes = {
  HOME: publicPath,
  LOGIN: `${publicPath}login`,
  SETUP: `${publicPath}setup`,
  PLACEMENT: `${publicPath}placement`,
  DASHBOARD: `${publicPath}dashboard`,
  SCENE: `${publicPath}scene`,
  VALIDATION: `${publicPath}validation`,
  CONGRATULATIONS: `${publicPath}congratulations`,
  REPORT: `${publicPath}report`,
  PROFILE: `${publicPath}profile`
};

const PrivateRoute = ({
  component: Component,
  isLoggedIn: isLoggedIn,
  ...rest
}) => (
  <Route
    {...rest}
    render={props => {
      return isLoggedIn ? (
        <Component {...props} {...rest.customFuncs} />
      ) : (
        <Redirect
          to={{
            pathname: "/login",
            state: { from: props.location }
          }}
        />
      );
    }}
  />
);

const LoginRoute = ({
  component: Component,
  isLoggedIn: isLoggedIn,
  ...rest
}) => (
  <Route
    {...rest}
    render={props => {
      return isLoggedIn ? (
        <Redirect
          to={{
            pathname: "/",
            state: { from: props.location }
          }}
        />
      ) : (
        <Component {...props} />
      );
    }}
  />
);

export default props => {
  const { isLoggedIn, location, updateMenuImg } = props;

  return (
    <Switch>
      <LoginRoute
        exact
        path={routeCodes.LOGIN}
        component={Login}
        isLoggedIn={isLoggedIn}
      />
      <PrivateRoute
        exact
        path={publicPath}
        component={Home}
        isLoggedIn={isLoggedIn}
      />
      <PrivateRoute
        path={routeCodes.SETUP}
        component={Setup}
        isLoggedIn={isLoggedIn}
      />
      <PrivateRoute
        path={routeCodes.PLACEMENT}
        component={Placement}
        isLoggedIn={isLoggedIn}
      />
      <PrivateRoute
        path={routeCodes.DASHBOARD}
        component={Dashboard}
        isLoggedIn={isLoggedIn}
      />
      <PrivateRoute
        path={routeCodes.SCENE}
        component={Scene}
        isLoggedIn={isLoggedIn}
      />
      <PrivateRoute
        path={routeCodes.VALIDATION}
        component={Validation}
        isLoggedIn={isLoggedIn}
        location={location}
      />
      <PrivateRoute
        path={routeCodes.CONGRATULATIONS}
        component={Congratulations}
        isLoggedIn={isLoggedIn}
        location={location}
      />
      <PrivateRoute
        path={routeCodes.REPORT}
        component={Report}
        isLoggedIn={isLoggedIn}
        location={location}
      />
      <PrivateRoute
        path={routeCodes.profile}
        component={Profile}
        isLoggedIn={isLoggedIn}
        location={location}
        customFuncs={{ updateMenuImg }}
      />
      <Route path="*" component={NotFound} isLoggedIn={isLoggedIn} />
    </Switch>
  );
};
