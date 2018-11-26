import React from "react";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import FontAwesomeIcon from "@fortawesome/react-fontawesome";

export default class ExpPanel extends React.Component {
  render() {
    const { headerIcon, headerTitle, contentId, children } = this.props;
    return (
      <ExpansionPanel
        defaultExpanded={true}
        classes={{ root: "mui-expansionPanel-root" }}
      >
        <ExpansionPanelSummary expandIcon={<FontAwesomeIcon icon="angle-up" />}>
          <div className="cc">
            {headerIcon}
            <span>{headerTitle}</span>
          </div>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <div className="expansionPanelDetails-container" id={contentId}>
            {children}
          </div>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}
