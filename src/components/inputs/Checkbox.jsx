import React from "react";
import PropTypes from "prop-types";

class Checkbox extends React.PureComponent {
  static propTypes = {
    name: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
  };
  render() {
    const {
      customonchange,
      textComp,
      touched,
      error,
      ...inputProps
    } = this.props;

    const labelStyle = touched
      ? error
        ? { border: "solid red" }
        : { border: "solid green" }
      : {};

    return (
      <div className="checkbox-container">
        <div className="checkbox">
          <input
            {...inputProps}
            onChange={e => {
              inputProps.onChange(e);
              customonchange && customonchange(e);
            }}
            type="checkbox"
          />
          <label htmlFor={inputProps.id} style={labelStyle}/>
        </div>
        <div className="checkbox-text">{textComp}</div>
      </div>
    );
  }
}

export default Checkbox;
