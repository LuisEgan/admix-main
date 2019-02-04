import React from "react";
import AppsStateToggle from "./AppStateToggle";
import C from "../utils/constants";

class PanelFooter extends React.Component {
  render() {
    const { app, hideInner } = this.props;
    const { appState, isActive } = app;

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

    let footerStyle = { background: C.COLORS[`light${appState}`] };

    let classInner;
    if (hideInner) {
      classInner = "fadeOut";

      footerStyle = { background: "#b3b3b3" };
    }

    return (
      <div className="mb panel-footer" style={footerStyle}>
        <div className={classInner}>
          {!hideInner && (
            <AppsStateToggle app={app} {...this.props} displayTooltip={false} />
          )}
        </div>
        <div className={classInner}>{footerMssg}</div>
      </div>
    );
  }
}

export default PanelFooter;
