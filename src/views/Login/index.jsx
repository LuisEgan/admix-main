import React, { Component } from "react";
import { connect } from "react-redux";
import { Field } from "redux-form";
import ReactSVG from "react-svg";
import PropTypes from "prop-types";
import { signup, resendSignUpEmail, forgotPass } from "../../actions";
import _a from "../../utils/analytics";

import Input from "../../components/inputs/TextInput";

import STR from "../../utils/strFuncs";
import admixLogo from "../../assets/img/logo.png";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ForgotPassForm from "./ForgotPassForm";

import logoUnity from "../../assets/svg/logo-unity.svg";
import logoUE from "../../assets/svg/logo-unreal.svg";

const { ga } = _a;

const Forms = {
  Login: ram => <LoginForm renderAsyncMessage={ram} />,
  "Forgot Password": ram => <RegisterForm renderAsyncMessage={ram} />,
  Register: ram => <ForgotPassForm renderAsyncMessage={ram} />,
};

class Login extends Component {
  static propTypes = {
    asyncData: PropTypes.object,
    asyncError: PropTypes.string,
    asyncLoading: PropTypes.bool,
    counter: PropTypes.number,
    dispatch: PropTypes.func,
  };
  constructor(props) {
    super(props);

    this.state = {
      policy: false,
      consent: false,
      registerBtnDisabled: true,
      passInputType: "password",
      show: "Login",
    };

    this.handleforgotPass = this.handleforgotPass.bind(this);
    this.handleSignup = this.handleSignup.bind(this);
    this.resendSignUpEmail = this.resendSignUpEmail.bind(this);

    this.toggleView = this.toggleView.bind(this);

    this.toggleCheckbox = this.toggleCheckbox.bind(this);

    this.renderFields = this.renderFields.bind(this);
    this.buttonStyle = this.buttonStyle.bind(this);
    this.renderAsyncMessage = this.renderAsyncMessage.bind(this);
  }

  toggleView(show) {
    this.setState({ show });
  }

  resendSignUpEmail() {
    const { dispatch, signupInfo } = this.props;
    dispatch(resendSignUpEmail(signupInfo));
  }

  toggleCheckbox(checkbox) {
    const newState = this.state;
    newState[checkbox] = !newState[checkbox];
    this.setState(newState);
  }

  // HANDLES ---------------------------------------------------------

  handleforgotPass(e) {
    _a.track(ga.actions.account.passwordChangeRequest, {
      category: ga.categories.account,
    });

    if (e) e.preventDefault();
    let {
      reduxForm: {
        loginForm: {
          values: { emailForgot },
        },
      },
      dispatch,
    } = this.props;

    dispatch(forgotPass(emailForgot));
  }

  handleSignup(values) {
    const { dispatch } = this.props;
    const { nameReg, emailReg, passReg1 } = values;

    if (nameReg && emailReg && passReg1) {
      dispatch(signup(nameReg, emailReg, passReg1));
    }
  }

  // RENDER ---------------------------------------------------------

  renderFields(fields, asyncError) {
    const renderField = field => {
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
              -{" "}
              <span style={_registerGuidelineStyle("letter")}>one letter</span>{" "}
              -{" "}
              <span style={_registerGuidelineStyle("number")}>one number</span>
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
          <Input {...input} type={type} className="mb" id={input.name} />
          <span className="login-guidelines" style={guidelineStyle}>
            {guideline}
          </span>
        </div>
      );
    };

    return fields.map(field => {
      let type = field.type || "text";
      return (
        <div key={field.input}>
          <Field name={field.input} component={renderField} type={type} />

          {field.icon}

          {this.isError({
            input: field.input,
            asyncError,
          }) && (
            <span
              role="img"
              aria-label="thumb"
              className="login-feedback-thumb"
            >
              👍
            </span>
          )}
        </div>
      );
    });
  }

  buttonStyle(button) {
    const { show } = this.state;
    return show === button ? { color: "#14b9be" } : {};
  }

  renderAsyncMessage() {
    const { asyncError, asyncLoading } = this.props;

    if (asyncLoading) {
      return <div className="login-asyncMessage animate fadeIn">Loading...</div>;
    }

    return (
      <React.Fragment>
        {asyncError && (
          <div className="login-asyncMessage asyncError animate fadeIn">
            {asyncError}
          </div>
        )}
      </React.Fragment>
    );
  }

  render() {
    const { show } = this.state;

    return (
      <div id="login">
        <div>
          <div id="login-header">
            <img src={admixLogo} alt="admix" />
          </div>

          <div id="login-title" className="st">
            <div>{show}</div>
          </div>

          <div id="login-forms">{Forms[show](this.renderAsyncMessage)}</div>

          <div id="login-nav">
            <div>
              <span
                onClick={() => this.toggleView("Login")}
                style={this.buttonStyle("Login")}
              >
                Login
              </span>
              <ReactSVG src={logoUnity} />
              <span
                onClick={() => this.toggleView("Register")}
                style={this.buttonStyle("Register")}
              >
                Register
              </span>
              <ReactSVG src={logoUE} />
              <span
                onClick={() => this.toggleView("Forgot Password")}
                style={this.buttonStyle("Forgot Password")}
              >
                Forgot Password
              </span>
            </div>
          </div>
        </div>

        {/* Big right image */}
        <div />
      </div>
    );
  }
}

const validate = values => {
  const errors = {};
  const { nameReg, emailReg, passReg1, passReg2 } = values;

  if (!nameReg || !STR.hasOnlyLetters(nameReg)) {
    errors.nameReg = true;
  }

  if (!emailReg || !STR.isValidEmail(emailReg)) {
    errors.emailReg = true;
  }

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

const mapStateToProps = state => {
  const {
    app: { signupInfo },
    async: { asyncData, asyncError, asyncLoading },
  } = state;

  return {
    asyncData,
    asyncError,
    asyncLoading,
    signupInfo,
  };
};

Login = connect(mapStateToProps)(Login);

export default Login;

// {
/* <ToggleDisplay show={show === "login"} id="login-login">
                  <form onSubmit={handleSubmit(this.handleLogin)}>
                     <div className="st">Login</div>
                     <div>
                        {this.renderFields(loginFields, asyncError)}
                        <div className="login-btn-container">
                           {asyncError && (
                              <span className="asyncMssg asyncError">
                                 {asyncError}
                              </span>
                           )}
                           <button type="submit" className="gradient-btn">
                              Login
                           </button>
                        </div>
                     </div>
                     <div>
                        <div>
                           <a
                              onClick={this.toggleView.bind(null, "forgotPass")}
                           >
                              Lost password?
                           </a>
                        </div>
                        <div>
                           No account yet?{" "}
                           <a onClick={this.toggleView.bind(null, "register")}>
                              Register
                           </a>
                        </div>
                     </div>
                  </form>
               </ToggleDisplay>

               <ToggleDisplay show={show === "forgotPass"} id="login-forgot">
                  <form onSubmit={handleSubmit(this.handleforgotPass)}>
                     <div className="st">Forgot Password</div>
                     <div>
                        {this.renderFields(forgotFields, asyncError)}
                        <div className="login-btn-container">
                           {asyncError && (
                              <span className="asyncMssg asyncError">
                                 {asyncError}
                              </span>
                           )}
                           {asyncData && (
                              <span className="asyncMssg asyncData">
                                 {asyncData.mssg}
                              </span>
                           )}
                           {asyncLoading && (
                              <span className="asyncMssg asyncData">
                                 Loading...
                              </span>
                           )}
                           <button type="submit" className="gradient-btn">
                              Help me!
                           </button>
                        </div>
                     </div>
                     <div>
                        <div>
                           <a onClick={this.toggleView.bind(null, "login")}>
                              Login
                           </a>
                        </div>
                        <div>
                           No account yet?{" "}
                           <a onClick={this.toggleView.bind(null, "register")}>
                              Register
                           </a>
                        </div>
                     </div>
                  </form>
               </ToggleDisplay>

               <ToggleDisplay show={show === "register"} id="login-register">
                  <form onSubmit={handleSubmit(this.handleSignup)}>
                     <div className="st">Register</div>

                     <div>
                        {this.renderFields(registerFields, asyncError)}

                        <div className="registerCheckbox">
                           <div>
                              <div className="checkbox">
                                 <input
                                    type="checkbox"
                                    id="policy"
                                    onChange={this.toggleCheckbox.bind(
                                       null,
                                       "policy"
                                    )}
                                 />
                                 <label htmlFor="policy" />
                              </div>
                           </div>
                           <div>
                              I have read to Admix’s &nbsp;
                              <a
                                 href="https://admix.in/wp-content/uploads/2018/08/terms-1.pdf"
                                 target="_blank"
                                 rel="noopener noreferrer"
                              >
                                 T&Cs
                              </a>
                              &nbsp; and &nbsp;
                              <a
                                 href="https://admix.in/wp-content/uploads/2018/08/privacy-1.pdf"
                                 target="_blank"
                                 rel="noopener noreferrer"
                              >
                                 privacy policy
                              </a>
                           </div>
                        </div>

                        <div className="registerCheckbox">
                           <div>
                              <div className="checkbox">
                                 <input
                                    type="checkbox"
                                    id="consent"
                                    onChange={this.toggleCheckbox.bind(
                                       null,
                                       "consent"
                                    )}
                                 />
                                 <label htmlFor="consent" />
                              </div>
                           </div>
                           <div>
                              I confirm that I have consent from my users to
                              process some of their data, such as device ID or
                              location, to serve more relevant ads.
                           </div>
                        </div>
                        <div className="login-btn-container">
                           {asyncError && (
                              <span className="asyncMssg asyncError">
                                 {asyncError}
                              </span>
                           )}
                           {asyncData &&
                              !asyncError && (
                                 <span className="asyncMssg asyncData">
                                    {asyncData.mssg}
                                 </span>
                              )}
                           {asyncLoading && (
                              <span className="asyncMssg asyncData">
                                 Loading...
                              </span>
                           )}
                           <button
                              type="submit"
                              className={`gradient-btn ${registerBtnClass}`}
                              style={registerBtnStyle}
                              disabled={!registerBtnEnabled}
                           >
                              Register
                           </button>
                        </div>
                     </div>

                     <div>
                        <div>
                           <a onClick={this.toggleView.bind(null, "login")}>
                              Login
                           </a>
                        </div>
                     </div>
                  </form>
               </ToggleDisplay> */
// }
