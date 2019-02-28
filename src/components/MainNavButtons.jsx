import React from "react";
import SVG from "./SVG";

class MainNavButtons extends React.PureComponent {
  render() {
    const { editOnClick, infoOnClick, reportOnClick } = this.props;
    return (
      <div className="app-buttons">
        <button onClick={editOnClick}>{SVG.setup}</button>
        <button onClick={infoOnClick}>{SVG.info}</button>
        <button onClick={reportOnClick}>{SVG.report}</button>
      </div>
    );
  }
}

export default MainNavButtons;
