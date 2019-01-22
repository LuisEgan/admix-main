import React from "react";
import PropTypes from "prop-types";

class Input extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    rootstyle: PropTypes.object,
    label: PropTypes.string,
    error: PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.state = {
      focused: false,
    };

    this.onFocus = this.onFocus.bind(this);
    this.forceFocus = this.forceFocus.bind(this);
  }

  shouldComponentUpdate = (nextProps, nextState) => {
    const { value, touched } = this.props;
    const { focused } = this.state;

    if (value !== nextProps.value || focused !== nextState.focused || touched !== nextState.touched ) {
      return true;
    }
    return false;
  };

  onFocus() {
    const { onFocus, onBlur } = this.props;
    const { focused } = this.state;

    onFocus && onFocus();
    onBlur && onBlur();

    this.setState({ focused: !focused });
  }

  forceFocus() {
    this.input.focus();
  }

  render() {
    const { icon, rootstyle, label, error, touched } = this.props;
    const { focused } = this.state;
    const inputStyle = focused
      ? error
        ? { borderColor: "red" }
        : { borderColor: "#14B9BE" }
      : rootstyle;

    return (
      <div className="input mb" onClick={this.forceFocus}>
        <div className="input-label">
          <span className="input-label">{label}</span>
        </div>
        <div className="input-body" style={inputStyle}>
          {icon && <div id="input-icon">{icon}</div>}
          <div>
            <input
              {...this.props}
              ref={i => {
                this.input = i;
              }}
              onFocus={this.onFocus}
              onBlur={this.onFocus}
            />
          </div>

          {error && touched !== 0 && (
            <span className="asyncError">{error}</span>
          )}
        </div>
      </div>
    );
  }
}

export default Input;
