import React, { Component } from "react";
import _a from "../../utils/analytics";
import { connect } from "react-redux";
import { reduxForm, reset } from "redux-form";
import { NavLink } from "react-router-dom";
import actions from "../../actions";

import FormTextInput from "../../components/formInputs/FormTextInput";

import STR from "../../utils/strFuncs";
import admixLogo from "../../assets/img/logo.png";
import FontAwesomeIcon from "@fortawesome/react-fontawesome";

const { ga } = _a;

const { setNewPass, logout } = actions;

class ForgotPass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      passInputType: "password",
      registerBtnDisabled: true,
      passStyles: {
        limit: null,
        letter: null,
        number: null,
      },
    };

    this.enableRegisterBtn = this.enableRegisterBtn.bind(this);
    this.togglePassInputType = this.togglePassInputType.bind(this);
    this.passGuideline = this.passGuideline.bind(this);
    this.setPassGuidelineStyle = this.setPassGuidelineStyle.bind(this);
    this.handleChangePass = this.handleChangePass.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(logout());
    dispatch(reset("forgotPassForm"));
  }

  togglePassInputType() {
    let { passInputType } = this.state;
    passInputType = passInputType === "password" ? "text" : "password";
    this.setState({ passInputType });
  }

  passGuideline() {
    const { passStyles } = this.state;
    return (
      <React.Fragment>
        <span style={passStyles.limit}>min 8 characters</span> -{" "}
        <span style={passStyles.letter}>one letter</span> -{" "}
        <span style={passStyles.number}>one number</span>
      </React.Fragment>
    );
  }

  setPassGuidelineStyle(e) {
    const {
      target: { value },
    } = e;
    const passStyles = {};

    const goodStyle = { color: "green" };
    const badStyle = { color: "red" };

    passStyles.limit = STR.isAtleast(value, 8) ? goodStyle : badStyle;
    passStyles.letter = STR.hasLetter(value) ? goodStyle : badStyle;
    passStyles.number = STR.hasNumber(value) ? goodStyle : badStyle;

    this.setState({ passStyles });
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
      />
    );
  }

  // RENDER ---------------------------------------------------------

  renderFields(fields) {
    return fields.map(field => {
      let type = field.type || "text";
      return (
        <div key={field.input}>
          <FormTextInput
            name={field.input}
            label={field.label}
            type={type}
            icon={field.icon}
            guideline={ field.input === "passReg1" ? this.passGuideline() : `both password match`}
            customonchange={this.setPassGuidelineStyle}
          />
        </div>
      );
    });
  }

  render() {
    const {
      asyncMessage,
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
        label: "Please enter new password",
        icon: this.eye(),
        type: passInputType,
        guideline: "only letters",
      },
      {
        input: "passReg2",
        label: "Please repeat new password",
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
                  {asyncMessage && !asyncError && (
                    <span className="asyncMssg asyncData">
                      {asyncMessage}
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
  const { app, async } = state;

  const initialValues = {
    passReg1: "",
    passReg2: "",
  };

  return {
    ...app,
    ...async,
    reduxForm: state.form,
    initialValues,
  };
};

const validate = values => {
  const errors = {};
  const { passReg1, passReg2 } = values;

  if (!passReg1 || !STR.isAtleast(passReg1, 8)) {
    errors.passReg1 = true;
    errors.passwordGuideline = errors.passwordGuideline || "";
    errors.passwordGuideline += "limit";
  }

  if (!passReg1 || !STR.hasLetter(passReg1)) {
    errors.passReg1 = true;
    errors.passwordGuideline = errors.passwordGuideline || "";
    errors.passwordGuideline += "letter";
  }

  if (!passReg1 || !STR.hasNumber(passReg1)) {
    errors.passReg1 = true;
    errors.passwordGuideline = errors.passwordGuideline || "";
    errors.passwordGuideline += "number";
  }

  if (!passReg2) {
    errors.passwordCheck = true;
  }

  if (passReg1 !== passReg2) {
    errors.passwordCheck = true;
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
