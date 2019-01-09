import React from "react";

class Popup extends React.PureComponent {
  render() {
    const { children } = this.props;
    return (
      <div className="popup">
        <div className="popup-inner">{children}</div>
      </div>
    );
  }
}

export default Popup;
