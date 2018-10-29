import React from "react";
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
         onpending: false,
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

   handleAppStateClick(app, appState) {
      const { dispatch, accessToken } = this.props;

      let { _id, platformName, name } = app;

      _a.track(ga.actions.apps.toggleAppState, {
         category: ga.categories.apps,
         label: ga.labels.toggleAppState.onMyapps,
         value: STR.appStateToNumber(appState)
      });

      const appDetails = {
         _id,
         platformName,
         name,
         isActive: appState === C.APP_STATES.live,
         appState
      };
      console.log('appDetails: ', appDetails);
      dispatch(toggleAppStatus(appDetails, accessToken));
   }

   liveText(app) {
      return {
         title: STR.capitalizeFirstLetter(C.APP_STATES.live),
         tooltip: "In LIVE mode, ads are delivering and generating revenue."
      };
   }

   render() {
      const { app } = this.props;
      const { appState } = app;

      const { oninactive, onpending, onlive } = this.state;

      const offStyle =
         appState === C.APP_STATES.inactive
            ? { backgroundColor: "#d9d9d9", color: "white" }
            : {};
      const sandboxStyle =
         appState === C.APP_STATES.pending
            ? { backgroundColor: "orange", color: "white" }
            : {};
      const liveStyle =
         appState === C.APP_STATES.live
            ? { backgroundColor: "#0066ff", color: "white" }
            : {};

      const offTooltip = oninactive ? { display: "block" } : {};
      const sandboxTooltip = onpending ? { display: "block" } : {};
      const liveTooltip = onlive ? { display: "block" } : {};

      return (
         <div className="appStateToggle">
            <div
               className={appState}
               style={offStyle}
               onClick={this.handleAppStateClick.bind(null, app, C.APP_STATES.inactive)}
               onMouseEnter={this.handleMouseHover.bind(
                  null,
                  C.APP_STATES.inactive
               )}
               onMouseLeave={this.handleMouseHover.bind(
                  null,
                  C.APP_STATES.inactive
               )}
            >
               <span>Off</span>
               <div className="admix-tooltip" style={offTooltip}>
                  In Off mode, ads are not delivering and appear transparent.
               </div>
            </div>
            <div
               className={appState}
               style={sandboxStyle}
               onClick={this.handleAppStateClick.bind(null, app, C.APP_STATES.pending)}
               onMouseEnter={this.handleMouseHover.bind(
                  null,
                  C.APP_STATES.pending
               )}
               onMouseLeave={this.handleMouseHover.bind(
                  null,
                  C.APP_STATES.pending
               )}
            >
               <span>Sandbox</span>
               <div className="admix-tooltip" style={sandboxTooltip}>
                  In SANDBOX mode, placeholder ads are delivered for testing
                  purposes but not generating revenue.
               </div>
            </div>
            <div
               className={appState}
               style={liveStyle}
               onClick={this.handleAppStateClick.bind(null, app, C.APP_STATES.live)}
               onMouseEnter={this.handleMouseHover.bind(
                  null,
                  C.APP_STATES.live
               )}
               onMouseLeave={this.handleMouseHover.bind(
                  null,
                  C.APP_STATES.live
               )}
            >
               <span>{this.liveText(appState).title}</span>
               <div className="admix-tooltip" style={liveTooltip}>
                  {this.liveText(appState).tooltip}
               </div>
            </div>
         </div>
      );
   }
}

export default AppStateToggle;
