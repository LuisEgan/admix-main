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

    this.forceFocus = this.forceFocus.bind(this);
    this.onFocus = this.onFocus.bind(this);
  }

  shouldComponentUpdate = (nextProps, nextState) => {
    const { value, touched, type } = this.props;
    const { focused } = this.state;

    // console.warn("name", this.props.name);
    // console.log('value !== nextProps.value: ', value !== nextProps.value);
    // console.log('focused !== nextState.focused: ', focused !== nextState.focused);
    // console.log('type !== nextState.type: ', type !== nextState.type);
    // console.log('touched !== nextProps.touched: ', touched !== nextProps.touched);

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
    const { icon, touched, error, ...inputProps } = this.props;
    const { label } = inputProps;
    const { focused } = this.state;
    const inputStyle =
      error && touched
        ? { borderColor: "red" }
        : focused
        ? { borderColor: "#14B9BE" }
        : {};

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
              ref={i => {
                this.input = i;
              }}
              onFocus={this.onFocus}
            />
          </div>

          {error && touched && <span className="asyncError">{error}</span>}
        </div>
      </div>
    );
  }
}

export default Input;
