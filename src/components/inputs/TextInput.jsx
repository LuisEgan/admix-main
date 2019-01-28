import React from "react";
import PropTypes from "prop-types";

class Input extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    rootstyle: PropTypes.object,
    label: PropTypes.string,
    error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    showErrors: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    this.state = {
      focused: false,
    };

    this.forceFocus = this.forceFocus.bind(this);
    this.onFocus = this.onFocus.bind(this);
  }

  shouldComponentUpdate = (nextProps, nextState) => {
    const { value, touched, type } = this.props;
    const { focused } = this.state;

    if (
      value !== nextProps.value ||
      touched !== nextProps.touched ||
      type !== nextProps.type ||
      focused !== nextState.focused
    ) {
      return true;
    }
    return false;
  };

  forceFocus() {
    this.input.focus();
  }

  onFocus() {
    const { onFocus } = this.props;
    this.setState({ focused: true }, () => {
      onFocus && onFocus();
    });
  }

  render() {
    let {
      icon,
      touched,
      error,
      guideline,
      customonchange,
      ...inputProps
    } = this.props;

    const { label, onChange } = inputProps;
    const { focused } = this.state;
    const inputStyle =
      error && touched
        ? { borderColor: "red" }
        : focused
        ? { borderColor: "#14B9BE" }
        : {};

    const guidelineStyle = touched
      ? error
        ? { color: "red" }
        : { color: "green" }
      : {};
    error = typeof error === "object" ? JSON.stringify(error) : error;

    return (
      <div className="input mb" onClick={this.forceFocus}>
        <div className="input-label">
          <span className="input-label">{label}</span>
        </div>
        <div className="input-body" style={inputStyle}>
          {icon && <div id="input-icon">{icon}</div>}
          <div>
            <input
              {...inputProps}
              onChange={e => {
                onChange(e);
                customonchange && customonchange(e);
              }}
              ref={i => {
                this.input = i;
              }}
              onFocus={this.onFocus}
            />
          </div>

          {error && touched && <span className="asyncError">{error}</span>}
        </div>
        <div className="input-guideline" style={guidelineStyle}>
          {guideline}
        </div>
      </div>
    );
  }
}

export default Input;
