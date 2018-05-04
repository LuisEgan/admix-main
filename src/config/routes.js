import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";

import Login from "../views/Login";
import Setup from "../views/Setup";
import Scene from "../views/Scene";
import Validation from "../views/Validation";
import Congratulations from "../views/Congratulations";
import Report from "../views/Report";
import Profile from "../views/Profile";
import NotFound from "../views/NotFound";

const publicPath = "/";

export const routeCodes = {
   LOGIN: `${publicPath}login`,
   SETUP: `${publicPath}setup`,
   SCENE: `${publicPath}scene`,
   VALIDATION: `${publicPath}validation`,
   CONGRATULATIONS: `${publicPath}congratulations`,
   REPORT: `${publicPath}report`,
   PROFILE: `${publicPath}profile`
};

const PrivateRoute = ({ component: Component, isLoggedIn, ...rest }) => (
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

const LoginRoute = ({ component: Component, isLoggedIn, ...rest }) => (
   <Route
      {...rest}
      render={props => {
         return isLoggedIn ? (
            <Redirect
               to={{
                  pathname: "/setup",
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
            component={Setup}
            isLoggedIn={isLoggedIn}
         />
         <PrivateRoute
            path={routeCodes.SETUP}
            component={Setup}
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
