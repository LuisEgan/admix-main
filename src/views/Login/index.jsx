import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import {
   login,
   signup,
   resendSignUpEmail,
   forgotPass,
   resetAsync
} from "../../actions";
import { Field, reduxForm, reset } from "redux-form";

import Input from "../../components/Input";

import ToggleDisplay from "react-toggle-display";
import STR from "../../utils/strFuncs";
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faEye from "@fortawesome/fontawesome-free-solid/faEye";
import admixLogo from "../../assets/img/logo.png";

class Login extends Component {
   static propTypes = {
      asyncData: PropTypes.object,
      asyncError: PropTypes.string,
      asyncLoading: PropTypes.bool,
      counter: PropTypes.number,
      isLoggedIn: PropTypes.bool,
      // from react-redux connect
      dispatch: PropTypes.func
   };
   constructor(props) {
      super(props);

      this.state = {
         policy: false,
         consent: false,
         registerBtnDisabled: true,
         passInputType: "password",
         show: "login"
      };

      this.handleLogin = this.handleLogin.bind(this);
      this.handleforgotPass = this.handleforgotPass.bind(this);
      this.handleSignup = this.handleSignup.bind(this);
      this.resendSignUpEmail = this.resendSignUpEmail.bind(this);

      this.resetAsync = this.resetAsync.bind(this);
      this.togglePassInputType = this.togglePassInputType.bind(this);
      this.toggleView = this.toggleView.bind(this);

      this.toggleCheckbox = this.toggleCheckbox.bind(this);
      this.enableRegisterBtn = this.enableRegisterBtn.bind(this);

      this.eye = this.eye.bind(this);

      this.renderField = this.renderField.bind(this);
      this.renderFields = this.renderFields.bind(this);
   }

   componentDidMount() {
      const {
         location: { search },
         dispatch
      } = this.props;
      const show = search.split("?")[1];
      (show === "register" || show === "forgotPass") && this.setState({ show });
      dispatch(resetAsync());
      dispatch(reset("loginForm"));
   }

   resetAsync() {
      const { dispatch } = this.props;
      dispatch(resetAsync());
   }

   toggleView(show, e) {
      e.preventDefault();
      const { dispatch } = this.props;
      dispatch(resetAsync());
      this.setState({
         show,
         email: "",
         password: "",
         name: ""
      });
   }

   togglePassInputType() {
      let { passInputType } = this.state;
      passInputType = passInputType === "password" ? "text" : "password";
      this.setState({ passInputType });
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

   // ERROS HANDLING ---------------------------------------------------------

   isError({ input, asyncError }) {
      if (
         input === "emailLogin" &&
         (asyncError === "Invalid Username" ||
            asyncError === "User Not Found" ||
            asyncError === "Invalid Username or Password")
      )
         return true;
      else if (
         input === "passLogin" &&
         (asyncError === "Invalid Password" ||
            asyncError === "Invalid Username or Password")
      )
         return true;
      else if (input === "emailForgot" && asyncError === "User Not Found")
         return true;
      else if (input === "emailReg" && asyncError === "User Already Exists")
         return true;

      return false;
   }

   enableRegisterBtn() {
      const {
         reduxForm: {
            loginForm: { syncErrors, values }
         }
      } = this.props;
      const { policy, consent } = this.state;
      const { nameReg, emailReg, passReg1, passReg2 } = values;

      if (nameReg && emailReg && passReg1 && passReg2) {
         return !syncErrors && policy && consent;
      }
      return false;
   }

   // ICONS ---------------------------------------------------------

   eye() {
      return (
         <FontAwesomeIcon
            icon={faEye}
            onMouseEnter={this.togglePassInputType}
            onMouseLeave={this.togglePassInputType}
            className="password-eye"
         />
      );
   }

   // HANDLES ---------------------------------------------------------

   handleLogin(e) {
      if (e) e.preventDefault();
      let {
         reduxForm: {
            loginForm: {
               values: { emailLogin, passLogin }
            }
         },
         dispatch
      } = this.props;

      dispatch(login(emailLogin.toLowerCase(), passLogin));
   }

   handleforgotPass(e) {
      if (e) e.preventDefault();
      let {
         reduxForm: {
            loginForm: {
               values: { emailForgot }
            }
         },
         dispatch
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

   renderField(field) {
      const {
         input,
         type,
         meta: { error }
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
                  <span style={_registerGuidelineStyle("letter")}>
                     one letter
                  </span>{" "}
                  -{" "}
                  <span style={_registerGuidelineStyle("number")}>
                     one number
                  </span>
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

   renderFields(fields, asyncError) {
      return fields.map(field => {
         let type = field.type || "text";
         return (
            <div key={field.input}>
               <Field
                  name={field.input}
                  component={this.renderField}
                  type={type}
               />

               {field.icon}

               {this.isError({
                  input: field.input,
                  asyncError
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

   render() {
      let { asyncError, asyncData, asyncLoading, handleSubmit } = this.props;
      const { show, passInputType } = this.state;

      const registerBtnEnabled = this.enableRegisterBtn();
      const registerBtnStyle = registerBtnEnabled ? {} : { opacity: 0.5 };
      const registerBtnClass = registerBtnEnabled ? "" : "forbidden-cursor";

      const loginFields = [
         {
            input: "emailLogin"
         },
         {
            input: "passLogin",
            icon: this.eye(),
            type: passInputType
         }
      ];

      const forgotFields = [
         {
            input: "emailForgot"
         }
      ];

      const registerFields = [
         {
            input: "nameReg",
            guideline: "only letters"
         },
         {
            input: "emailReg",
            guideline: "valid e-mail"
         },
         {
            input: "passReg1",
            icon: this.eye(),
            type: passInputType,
            guideline: "only letters"
         },
         {
            input: "passReg2",
            icon: this.eye(),
            type: passInputType
         }
      ];

      return (
         <div id="login">
            <div>
               <div>
                  <img src={admixLogo} alt="admix" />
               </div>

               <ToggleDisplay show={show === "login"} id="login-login">
                  <form onSubmit={e => this.handleLogin(e)}>
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
                  <form onSubmit={e => this.handleforgotPass(e)}>
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

                        {/* TERMS AND CONDITIONS */}
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

                        {/* USERS CONSENT */}
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
               </ToggleDisplay>
            </div>

            <div />
         </div>
      );
   }
}

const mapStateToProps = state => {
   const initialValues = {
      emailLogin: "",
      passLogin: ""
   };

   return {
      asyncData: state.app.get("asyncData"),
      asyncError: state.app.get("asyncError"),
      asyncLoading: state.app.get("asyncLoading"),
      signupInfo: state.app.get("signupInfo"),
      isLoggedIn: state.app.get("isLoggedIn"),
      reduxForm: state.form,
      initialValues
   };
};

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

const formConfig = {
   form: "loginForm",
   validate
};

Login = reduxForm(formConfig)(Login);
Login = connect(mapStateToProps)(Login);

export default Login;
