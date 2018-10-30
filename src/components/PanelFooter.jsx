import React from "react";
import AppsStateToggle from "./AppStateToggle";
import C from "../utils/constants";

class PanelFooter extends React.Component {
   render() {
      const { app } = this.props;
      const { appState, isActive, storeurl } = app;

      let footerMssg =
         appState === C.APP_STATES.pending ||
         appState === C.APP_STATES.inactive ||
         !isActive ? (
            <span>
               Your app isn’t generating <br /> revenue yet
            </span>
         ) : (
            <span>
               Your app is starting to <br /> generate revenue
            </span>
         );

      let footerActiveMssg =
         appState !== undefined
            ? appState
            : storeurl !== undefined || storeurl !== ""
               ? C.APP_STATES.inactive
               : C.APP_STATES.pending;

      let footerStyle;

      switch (footerActiveMssg) {
         case C.APP_STATES.inactive:
            footerStyle = { background: "#F5F7FA" };
            break;
         case C.APP_STATES.pending:
            footerStyle = { background: "#ffebcc" };
            break;
         default:
            footerStyle = { background: "#e6f5ff" };
      }

      return (
         <div className="mb panel-footer" style={footerStyle}>
            <div>
               <AppsStateToggle
                  app={app}
                  {...this.props}
                  displayTooltip={false}
               />
            </div>
            <div>{footerMssg}</div>
         </div>
      );
   }
}

export default PanelFooter;
