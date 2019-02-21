import React from "react";
import AppsStateToggle from "./AppStateToggle";
import C from "../utils/constants";

class PanelFooter extends React.Component {
  render() {
    let { children, app, hideInner, footerMssg } = this.props;
    let footerStyle, classInner;

    if (app) {
      const { appState, isActive } = app;
      footerMssg =
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

      footerStyle = { background: C.COLORS[`light${appState}`] };
      if (hideInner) {
        classInner = "fadeOut";

        footerStyle = { background: "#b3b3b3" };
      }
    } else {
      footerStyle = {
        background: C.COLORS[`light${C.APP_STATES.live}`],
        color: "#006bb3",
        padding: "10px",
        fontWeight: "normal",
        textAlign: "left",
      };
    }

    return (
      <div className="mb panel-footer" style={footerStyle}>
        {!children && (
          <React.Fragment>
            <div className={classInner}>
              {!hideInner && (
                <AppsStateToggle
                  app={app}
                  {...this.props}
                  displayTooltip={false}
                />
              )}
            </div>
            <div className={classInner}>{footerMssg}</div>
          </React.Fragment>
        )}
        {children}
      </div>
    );
  }
}

export default PanelFooter;
