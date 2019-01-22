import React, { Component } from "react";
import _a from "../../utils/analytics";
import { connect } from "react-redux";
import { setNewEmail } from "../../actions";
import STR from "../../utils/strFuncs";

const { ga } = _a;

class ChangeEmail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      isValidEmail: false,
    };

    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.hardFocus = this.hardFocus.bind(this);
    this.handleChangeEmail = this.handleChangeEmail.bind(this);
  }

  handleKeyPress(e) {
    if (e.key === "Enter") {
      this.handleChangeEmail();
    }
  }

  handleInputChange(e) {
    const inputValue = e.target.value;

    this.setState({
      isValidEmail: STR.isValidEmail(inputValue),
      email: inputValue,
    });
  }

  hardFocus(input) {
    this[input].focus();
  }

  handleChangeEmail() {
    _a.track(ga.actions.account.emailChange, {
      category: ga.categories.account,
    });

    let {
      dispatch,
      location: { search },
    } = this.props;

    const { email } = this.state;

    search = search.split("?")[1];
    const token = search
      .split("token=")[1]
      .slice(0, search.indexOf("&uid") - 6);
    const userId = search.split("uid=")[1];

    dispatch(setNewEmail({ token, userId, newEmail: email }));
  }

  render() {
    const { asyncData, asyncError, asyncLoading } = this.props;

    const { isValidEmail } = this.state;

    const loadingIcon = <p>Loading...</p>;

    // for register validation
    const goodStyle = { color: "green" };
    const badStyle = { color: "red" };

    const isValidEmailStyle = isValidEmail ? goodStyle : badStyle;

    return (
      <div id="login" onKeyPress={this.handleKeyPress}>
        <span>
          <div className="inputs-container">
            <div className="inputs-header">
              <h3 className="st">Change your email</h3>
            </div>

            <div className="inputs">
              <div>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Email"
                  onChange={this.handleInputChange}
                  onFocus={this.handleFocus}
                  ref={input => {
                    this.registerEmailInput = input;
                  }}
                  onClick={this.hardFocus.bind(null, "registerEmailInput")}
                />
              </div>
              <div className="registerRules">
                <span style={isValidEmailStyle}>valid e-mail</span>
              </div>
            </div>

            {/* BUTTON */}
            <div className="login-btn cc">
              {asyncLoading && loadingIcon}
              {asyncError && <p>Error: {asyncError}</p>}
              {asyncData !== null && <p>{asyncData.mssg}</p>}
              {!asyncLoading && !asyncError && !asyncData && (
                <button
                  className="btn btn-dark"
                  onClick={this.handleChangeEmail}
                  disabled={!isValidEmail}
                >
                  Set new email
                </button>
              )}
            </div>

            <div className="separator-container">
              <div className="separator" />
            </div>
          </div>
        </span>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  asyncData: state.app.get("asyncData"),
  asyncError: state.app.get("asyncError"),
  asyncLoading: state.app.get("asyncLoading"),
  counter: state.app.get("counter"),
  isLoggedIn: state.app.get("isLoggedIn"),
});

export default connect(mapStateToProps)(ChangeEmail);
