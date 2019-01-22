import React, { Component } from "react";
import _a from "../../utils/analytics";
import { connect } from "react-redux";
import { Field, reduxForm, reset } from "redux-form";
import { NavLink } from "react-router-dom";
import { setNewPass } from "../../actions";

import Input from "../../components/inputs/TextInput";

import STR from "../../utils/strFuncs";
import admixLogo from "../../assets/img/logo.png";
import FontAwesomeIcon from "@fortawesome/react-fontawesome";

const { ga } = _a;

class ForgotPass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      passInputType: "password",
      registerBtnDisabled: true,
    };

    this.enableRegisterBtn = this.enableRegisterBtn.bind(this);
    this.togglePassInputType = this.togglePassInputType.bind(this);
    this.handleChangePass = this.handleChangePass.bind(this);
    this.renderField = this.renderField.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(reset("forgotPassForm"));
  }

  togglePassInputType() {
    let { passInputType } = this.state;
    passInputType = passInputType === "password" ? "text" : "password";
    this.setState({ passInputType });
  }

  handleChangePass(values) {
    _a.track(ga.actions.account.passwordChange, {
      category: ga.categories.account,
    });

    let {
      dispatch,
      location: { search },
    } = this.props;
    const { passReg1 } = values;
    const urlParams = new URLSearchParams(search);

    const token = urlParams.get("token");
    const userId = urlParams.get("uid");

    dispatch(setNewPass({ token, userId, newPass: passReg1 }));
  }

  // ERROS HANDLING ---------------------------------------------------------

  enableRegisterBtn() {
    const { reduxForm } = this.props;

    if (reduxForm.forgotPassForm) {
      const { syncErrors, values } = reduxForm.forgotPassForm;
      const { passReg1, passReg2 } = values;
      if (passReg1 && passReg2) {
        return !syncErrors;
      }
    }

    return false;
  }

  // ICONS ---------------------------------------------------------

  eye() {
    return (
      <FontAwesomeIcon
        icon="eye"
        onMouseEnter={this.togglePassInputType}
        onMouseLeave={this.togglePassInputType}
        className="password-eye"
      />
    );
  }

  // RENDER ---------------------------------------------------------

  renderField(field) {
    const {
      input,
      type,
      meta: { error },
    } = field;
    let label, guideline;
    let guidelineStyle = {};

    const goodStyle = { color: "green" };
    const badStyle = { color: "red" };

    const _registerGuidelineStyle = guideline => {
      if (error && input.value.length > 0) {
        return error.indexOf(guideline) > -1 ? badStyle : goodStyle;
      } else {
        return input.value.length > 0 ? goodStyle : {};
      }
    };

    switch (input.name) {
      case "emailLogin":
        label = "Email";
        break;
      case "passLogin":
        label = "Password";
        break;
      case "emailForgot":
        label = "Email";
        break;
      case "nameReg":
        label = "Name";
        guideline = "only letters";
        break;
      case "emailReg":
        label = "Email";
        guideline = "valid e-mail";
        break;
      case "passReg1":
        label = "Password";
        guideline = (
          <React.Fragment>
            <span style={_registerGuidelineStyle("limit")}>
              min 8 characters
            </span>{" "}
            - <span style={_registerGuidelineStyle("letter")}>one letter</span>{" "}
            - <span style={_registerGuidelineStyle("number")}>one number</span>
          </React.Fragment>
        );
        break;
      case "passReg2":
        label = "Confirm Password";
        guideline = "both passwords match";
        break;
      default:
    }

    if (input.value.length > 0 && input.name !== "passReg1") {
      guidelineStyle = error ? { color: "red" } : { color: "green" };
    }

    return (
      <div>
        <span className="input-label">{label}</span>
        <Input
          {...input}
          type={type}
          className="mb"
          id={input.name}
          onFocus={this.resetAsync}
        />
        <span className="login-guidelines" style={guidelineStyle}>
          {guideline}
        </span>
      </div>
    );
  }

  renderFields(fields) {
    return fields.map(field => {
      let type = field.type || "text";
      return (
        <div key={field.input}>
          <Field name={field.input} component={this.renderField} type={type} />

          {field.icon}
        </div>
      );
    });
  }

  render() {
    const {
      asyncData,
      asyncError,
      asyncLoading,
      handleSubmit,
      location: { search },
    } = this.props;
    const { passInputType } = this.state;

    const urlParams = new URLSearchParams(search);
    const timestamp = urlParams.get("t");
    const ONE_HOUR = 60 * 60 * 1000; /* ms */
    const moreThanHourChecker = new Date().getTime();
    const isTokeValid = moreThanHourChecker - timestamp <= ONE_HOUR;

    const registerBtnEnabled = this.enableRegisterBtn();
    const registerBtnStyle = registerBtnEnabled ? {} : { opacity: 0.5 };
    const registerBtnClass = registerBtnEnabled ? "" : "forbidden-cursor";

    const fields = [
      {
        input: "passReg1",
        icon: this.eye(),
        type: passInputType,
        guideline: "only letters",
      },
      {
        input: "passReg2",
        icon: this.eye(),
        type: passInputType,
      },
    ];

    return (
      <div id="login" onKeyPress={this.handleKeyPress}>
        <div>
          <div>
            <img src={admixLogo} alt="admix" />
          </div>
          <span id="forgotPass">
            <form onSubmit={handleSubmit(this.handleChangePass)}>
              <div className="st">Change your password</div>
              <div>
                {this.renderFields(fields)}
                <div className="login-btn-container">
                  {asyncError && (
                    <span className="asyncMssg asyncError">{asyncError}</span>
                  )}
                  {asyncData && !asyncError && (
                    <span className="asyncMssg asyncData">
                      {asyncData.mssg}
                    </span>
                  )}
                  {asyncLoading && (
                    <span className="asyncMssg asyncData">Loading...</span>
                  )}

                  {isTokeValid && (
                    <button
                      type="submit"
                      className={`gradient-btn ${registerBtnClass}`}
                      style={registerBtnStyle}
                      disabled={!registerBtnEnabled}
                    >
                      Set new password
                    </button>
                  )}

                  {!isTokeValid && (
                    <span className="asyncMssg asyncData">
                      Password reset link has been outdated. Please request a
                      new one
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div>
                  <NavLink to="/login">Login</NavLink>
                </div>
              </div>
            </form>
          </span>
        </div>
        <div />
      </div>
    );
  }
}

const mapStateToProps = state => {
  const initialValues = {
    passReg1: "",
    passReg2: "",
  };

  return {
    asyncData: state.app.get("asyncData"),
    asyncError: state.app.get("asyncError"),
    asyncLoading: state.app.get("asyncLoading"),
    counter: state.app.get("counter"),
    isLoggedIn: state.app.get("isLoggedIn"),
    reduxForm: state.form,
    initialValues,
  };
};

const validate = values => {
  const errors = {};
  const { passReg1, passReg2 } = values;

  if (!passReg1 || !STR.isAtleast(passReg1, 8)) {
    errors.passReg1 = errors.passReg1 || "";
    errors.passReg1 += "limit";
  }

  if (!passReg1 || !STR.hasLetter(passReg1)) {
    errors.passReg1 = errors.passReg1 || "";
    errors.passReg1 += "letter";
  }

  if (!passReg1 || !STR.hasNumber(passReg1)) {
    errors.passReg1 = errors.passReg1 || "";
    errors.passReg1 += "number";
  }

  if (passReg1 !== passReg2) {
    errors.passReg2 = true;
  }

  return errors;
};

const formConfig = {
  form: "forgotPassForm",
  validate,
};

ForgotPass = reduxForm(formConfig)(ForgotPass);
ForgotPass = connect(mapStateToProps)(ForgotPass);

export default ForgotPass;
