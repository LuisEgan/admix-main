import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";

import Login from "../views/Login";
import MyApps from "../views/MyApps";
import Info from "../views/Info";
import Scene from "../views/Scene";
import Validation from "../views/Validation";
import Congratulations from "../views/Congratulations";
import Report from "../views/Report";
import Profile from "../views/Profile";
import Download from "../views/Download";
import ForgotPass from "../views/ForgotPass";
import EmailSuccess from "../views/EmailVerification/emailSuccess";
import EmailFailure from "../views/EmailVerification/emailFailure";
// import NotFound from "../views/NotFound";
import ChangeEmail from "../views/ChangeEmail";

const publicPath = "/";

export const routeCodes = {
   LOGIN: `${publicPath}login`,
   MYAPPS: `${publicPath}myapps`,
   INFO: `${publicPath}info`,
   SCENE: `${publicPath}scene`,
   VALIDATION: `${publicPath}validation`,
   CONGRATULATIONS: `${publicPath}congratulations`,
   REPORT: `${publicPath}report`,
   PROFILE: `${publicPath}profile`,
   DOWNLOAD: `${publicPath}download`,
   FORGOT_PASS: `${publicPath}forgotPass`,
   CHANGE_EMAIL: `${publicPath}changeEmail`,
   EMAIL_SUCCESS: `${publicPath}emailSuccess`,
   EMAIL_FAILURE: `${publicPath}emailFailure`
};

const PrivateRoute = ({ component: Component, isLoggedIn, ...rest }) => (
   <Route
      {...rest}
      render={props => {
         return isLoggedIn ? (
            props.match.path !== "*" ? (
               <Component {...props} {...rest.customFuncs} />
            ) : (
               <Redirect
                  to={{
                     pathname: "/myapps",
                     state: { from: props.location }
                  }}
               />
            )
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
                  pathname: "/myapps",
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
         {/* <PrivateRoute
            exact
            path={publicPath}
            component={MyApps}
            isLoggedIn={isLoggedIn}
         /> */}
         <PrivateRoute
            path={routeCodes.MYAPPS}
            component={MyApps}
            isLoggedIn={isLoggedIn}
         />
         <PrivateRoute
            path={routeCodes.INFO}
            component={Info}
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
            path={routeCodes.PROFILE}
            component={Profile}
            isLoggedIn={isLoggedIn}
            location={location}
            customFuncs={{ updateMenuImg }}
         />
         <Route path={routeCodes.DOWNLOAD} component={Download} exact />
         <Route path={routeCodes.FORGOT_PASS} component={ForgotPass} exact />
         <Route path={routeCodes.CHANGE_EMAIL} component={ChangeEmail} exact />
         <Route
            path={routeCodes.EMAIL_SUCCESS}
            component={EmailSuccess}
            exact
         />
         <Route
            path={routeCodes.EMAIL_FAILURE}
            component={EmailFailure}
            exact
         />
         <PrivateRoute
            path="*"
            component={MyApps}
            isLoggedIn={isLoggedIn}
            location={location}
         />
      </Switch>
   );
};
