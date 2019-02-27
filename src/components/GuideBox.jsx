import React from "react";
import PropTypes from "prop-types";
import FontAwesomeIcon from "@fortawesome/react-fontawesome";

class GuideBox extends React.PureComponent {
  render() {
    const { text } = this.props;
    return (
      <div className="guide-box mbs">
        <div className="guide-box-icon">
          <FontAwesomeIcon icon="info-circle" />
        </div>
        <div className="guide-box-text">{text}</div>
      </div>
    );
  }
}

GuideBox.propTypes = {
  text: PropTypes.string,
};

export default GuideBox;
