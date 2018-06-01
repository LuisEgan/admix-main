import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { login, signup, forgotPass, resetAsync } from "../../actions";
import ToggleDisplay from "react-toggle-display";
import STR from "../../utils/strFuncs";
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faEye from "@fortawesome/fontawesome-free-solid/faEye";

// @connect(state => ({
//    asyncData: state.app.get("asyncData"),
//    asyncError: state.app.get("asy      ncError"),
//    asyncLoading: state.app.get("asyncLoading"),
//    counter: state.app.get("counter"),
//    isLoggedIn: state.app.get("isLoggedIn")
// }))
class Login extends Component {
   static propTypes = {
      asyncData: PropTypes.object,
      asyncError: PropTypes.string,
      asyncLoading: PropTypes.bool,
      counter: PropTypes.number,
      animate: PropTypes.bool,
      isLoggedIn: PropTypes.bool,
      // from react-redux connect
      dispatch: PropTypes.func
   };
   constructor(props) {
      super(props);
      this.state = {
         email: "",
         password: "",
         passInputType: "password",
         confirmPassword: "",
         regValidation: {
            isValidName: "",
            isValidEmail: "",
            is8: "",
            hasLetter: "",
            hasNumber: "",
            arePassSame: "",
            policy: false,
            consent: false
         },
         registerBtnDisabled: true,
         name: "",
         show: "login",
         animate: false
      };
      this.handleClick = this.handleClick.bind(this);
      this.handleLogin = this.handleLogin.bind(this);
      this.handleSignup = this.handleSignup.bind(this);

      this.handleInputChange = this.handleInputChange.bind(this);
      this.handleforgotPass = this.handleforgotPass.bind(this);
      this.togglePassInputType = this.togglePassInputType.bind(this);
      this.toggleView = this.toggleView.bind(this);
      this.handleFocus = this.handleFocus.bind(this);
      this.handleKeyPress = this.handleKeyPress.bind(this);
      this.hardFocus = this.hardFocus.bind(this);
   }

   componentDidMount() {
      const {
         location: { search }
      } = this.props;
      const show = search.split("?")[1];
      (show === "register" || show === "forgotPass") && this.setState({ show });
   }

   handleClick() {
      this.setState({
         show: !this.state.show,
         email: "",
         password: "",
         name: ""
      });
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

   handleLogin() {
      const { dispatch } = this.props;
      const { email, password } = this.state;
      dispatch(login(email, password));
   }

   handleSignup() {
      const { dispatch } = this.props;
      const { name, email, password } = this.state;
      dispatch(signup(name, email, password));
   }

   handleforgotPass() {
      const { dispatch } = this.props;
      const { email } = this.state;
      dispatch(forgotPass(email));
   }

   handleInputChange(input, e) {
      const state = this.state;
      const inputValue = e.target.value;

      const inputParsed = input.replace("Reg", "");
      state[inputParsed] = inputValue;
      state.registerBtnDisabled = false;

      if (input === "nameReg") {
         state.regValidation.isValidName = STR.hasOnlyLetters(inputValue);
      } else if (input === "emailReg") {
         state.regValidation.isValidEmail = STR.isValidEmail(inputValue);
      } else if (input === "passwordReg") {
         state.regValidation.is8 = STR.isAtleast(inputValue, 8);
         state.regValidation.hasLetter = STR.hasLetter(inputValue);
         state.regValidation.hasNumber = STR.hasNumber(inputValue);
         state.regValidation.arePassSame = state.confirmPassword === inputValue;
      } else if (input === "confirmPasswordReg") {
         state.regValidation.arePassSame = state.password === inputValue;
      } else {
         // for policy and consent
         state.regValidation[input] = !state.regValidation[input];
      }

      for (let validation in state.regValidation) {
         if (!state.regValidation[validation]) {
            state.registerBtnDisabled = true;
         }
      }

      if (state.name === "") state.registerBtnDisabled = true;

      this.setState(state);
   }

   handleFocus(e) {
      const { asyncError, dispatch } = this.props;

      if (asyncError !== "") {
         dispatch(resetAsync());
      }
   }

   handleKeyPress(e) {
      if (e.key === "Enter") {
         this.handleLogin();
      }
   }

   hardFocus(input) {
      this[input].focus();
   }

   render() {
      const { asyncData, asyncError, asyncLoading } = this.props;

      const {
         show,
         passInputType,
         regValidation: {
            isValidName,
            isValidEmail,
            is8,
            hasLetter,
            hasNumber,
            arePassSame
         },
         registerBtnDisabled
      } = this.state;

      // const loading = <i className="fa fa-cog fa-spin"></i>;
      const loadingIcon = <p>Loading...</p>;

      const showLogin = show === "login";
      const showLostPast = show === "forgotPass";
      const showRegister = show === "register";

      // for register validation
      const goodStyle = { color: "green" };
      const badStyle = { color: "red" };

      // name
      const isValidNameStyle =
         isValidName === "" ? {} : isValidName ? goodStyle : badStyle;

      // email
      const isValidEmailStyle =
         isValidEmail === "" ? {} : isValidEmail ? goodStyle : badStyle;

      // password
      const is8Style = is8 === "" ? {} : is8 ? goodStyle : badStyle;
      const hasLetterStyle =
         hasLetter === "" ? {} : hasLetter ? goodStyle : badStyle;
      const hasNumberStyle =
         hasNumber === "" ? {} : hasNumber ? goodStyle : badStyle;

      // password confirm
      const arePassSameStyle =
         arePassSame === "" ? {} : arePassSame ? goodStyle : badStyle;

      return (
         <div id="login" onKeyPress={this.handleKeyPress}>
            <ToggleDisplay show={showLogin}>
               <div className="inputs-container">
                  <div className="inputs-header">
                     <h3 className="st">Log in</h3>
                  </div>

                  <div className="inputs">
                     <input
                        type="text"
                        className="form-control"
                        placeholder="Email"
                        onChange={this.handleInputChange.bind(null, "email")}
                        onFocus={this.handleFocus}
                        ref={input => {
                           this.nameInput = input;
                        }}
                        onClick={this.hardFocus.bind(null, "nameInput")}
                     />

                     <div className="userPass">
                        <input
                           type={passInputType}
                           className="form-control"
                           placeholder="Password"
                           onChange={this.handleInputChange.bind(
                              null,
                              "password"
                           )}
                           onFocus={this.handleFocus}
                           ref={input => {
                              this.passInput = input;
                           }}
                           onClick={this.hardFocus.bind(null, "passInput")}
                        />
                        <FontAwesomeIcon
                           icon={faEye}
                           onMouseEnter={this.togglePassInputType}
                           onMouseLeave={this.togglePassInputType}
                        />
                     </div>
                  </div>

                  <div className="login-btn cc">
                     {asyncLoading && loadingIcon}
                     {asyncError && <p>Error: {asyncError}</p>}
                     {!asyncLoading &&
                        !asyncError && (
                           <button
                              className="btn btn-dark"
                              onClick={this.handleLogin}
                           >
                              Log in
                           </button>
                        )}
                  </div>

                  <div id="lost-pass-text">
                     <a onClick={this.toggleView.bind(null, "forgotPass")}>
                        Lost password?
                     </a>
                  </div>

                  <div className="separator-container">
                     <div className="separator" />
                  </div>

                  <div className="register">
                     <a onClick={this.toggleView.bind(null, "register")}>
                        No account yet? Register
                     </a>
                  </div>
               </div>
            </ToggleDisplay>

            <ToggleDisplay show={showLostPast}>
               <div className="inputs-container">
                  <div className="inputs-header">
                     <h3 className="st">Lost Password</h3>
                  </div>

                  <div className="inputs">
                     <input
                        type="text"
                        className="form-control"
                        placeholder="Email"
                        onChange={this.handleInputChange.bind(null, "email")}
                        ref={input => {
                           this.emailInput = input;
                        }}
                        onClick={this.hardFocus.bind(null, "emailInput")}
                     />
                  </div>

                  <div className="login-btn cc">
                     {asyncLoading && loadingIcon}
                     {asyncError && <p>Error: {asyncError}</p>}
                     {asyncData !== null && <p>{asyncData.mssg}</p>}
                     {!asyncLoading &&
                        !asyncError &&
                        !asyncData && (
                           <button
                              className="btn btn-dark"
                              onClick={this.handleforgotPass}
                           >
                              Reset Password
                           </button>
                        )}
                  </div>

                  <div id="lost-pass-text">
                     <a onClick={this.toggleView.bind(null, "login")}>Back</a>
                  </div>

                  <div className="separator-container">
                     <div className="separator" />
                  </div>

                  <div className="register">
                     <a onClick={this.toggleView.bind(null, "register")}>
                        No account yet? Register
                     </a>
                  </div>
               </div>
            </ToggleDisplay>

            <ToggleDisplay show={showRegister}>
               <div className="inputs-container">
                  <div className="inputs-header">
                     <h3 className="st">Register</h3>
                  </div>

                  <div className="inputs">
                     {/* NAME */}
                     <div>
                        <input
                           type="text"
                           className="form-control"
                           placeholder="Name"
                           onChange={this.handleInputChange.bind(
                              null,
                              "nameReg"
                           )}
                           onFocus={this.handleFocus}
                           ref={input => {
                              this.registerNameInput = input;
                           }}
                           onClick={this.hardFocus.bind(
                              null,
                              "registerNameInput"
                           )}
                        />
                     </div>
                     <div className="registerRules">
                        <span style={isValidNameStyle}>only letters</span>
                     </div>
                     {/* EMAIL */}
                     <div>
                        <input
                           type="text"
                           className="form-control"
                           placeholder="Email"
                           onChange={this.handleInputChange.bind(
                              null,
                              "emailReg"
                           )}
                           onFocus={this.handleFocus}
                           ref={input => {
                              this.registerEmailInput = input;
                           }}
                           onClick={this.hardFocus.bind(
                              null,
                              "registerEmailInput"
                           )}
                        />
                     </div>
                     <div className="registerRules">
                        <span style={isValidEmailStyle}>valid e-mail</span>
                     </div>
                     {/* PASSWORD */}
                     <div>
                        <input
                           type={passInputType}
                           className="form-control"
                           placeholder="Password"
                           onChange={this.handleInputChange.bind(
                              null,
                              "passwordReg"
                           )}
                           onFocus={this.handleFocus}
                           ref={input => {
                              this.registerPassInput = input;
                           }}
                           onClick={this.hardFocus.bind(
                              null,
                              "registerPassInput"
                           )}
                        />
                        <FontAwesomeIcon
                           icon={faEye}
                           onMouseEnter={this.togglePassInputType}
                           onMouseLeave={this.togglePassInputType}
                        />
                     </div>
                     <div className="registerRules">
                        <span style={is8Style}>min 8 characters - </span>
                        <span style={hasLetterStyle}>one letter - </span>
                        <span style={hasNumberStyle}>one number</span>
                     </div>
                     {/* PASSWORD CONFIRM */}
                     <div>
                        <input
                           type={passInputType}
                           className="form-control"
                           placeholder="Confirm Password"
                           onChange={this.handleInputChange.bind(
                              null,
                              "confirmPasswordReg"
                           )}
                           onFocus={this.handleFocus}
                           ref={input => {
                              this.registerConfirmPassInput = input;
                           }}
                           onClick={this.hardFocus.bind(
                              null,
                              "registerConfirmPassInput"
                           )}
                        />
                        <FontAwesomeIcon
                           icon={faEye}
                           onMouseEnter={this.togglePassInputType}
                           onMouseLeave={this.togglePassInputType}
                        />
                     </div>
                     <div className="registerRules">
                        <span style={arePassSameStyle}>
                           both passwords match
                        </span>
                     </div>
                     {/* TERMS AND CONDITIONS */}
                     <div className="registerCheckbox">
                        <div>
                           <div className="checkbox">
                              <input
                                 type="checkbox"
                                 id="policy"
                                 onChange={this.handleInputChange.bind(
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
                              href="http://admix.in/pdf/terms.pdf"
                              target="_blank"
                              rel="noopener noreferrer"
                           >
                              T&Cs
                           </a>
                           &nbsp; and &nbsp;
                           <a
                              href="http://admix.in/pdf/privacy.pdf"
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
                                 onChange={this.handleInputChange.bind(
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
                  </div>

                  {/* BUTTON */}
                  <div className="login-btn cc">
                     {asyncLoading && loadingIcon}
                     {asyncError && <p>Error: {asyncError}</p>}
                     {asyncData !== null && <p>{asyncData.mssg}</p>}
                     {!asyncLoading &&
                        !asyncError &&
                        !asyncData && (
                           <button
                              className="btn btn-dark"
                              onClick={this.handleSignup}
                              disabled={registerBtnDisabled}
                           >
                              Register
                           </button>
                        )}
                  </div>

                  <div id="lost-pass-text">
                     <a onClick={this.toggleView.bind(null, "login")}>
                        Go back
                     </a>
                  </div>

                  <div className="separator-container">
                     <div className="separator" />
                  </div>
               </div>
            </ToggleDisplay>
         </div>
      );
   }
}

const mapStateToProps = state => ({
   asyncData: state.app.get("asyncData"),
   asyncError: state.app.get("asyncError"),
   asyncLoading: state.app.get("asyncLoading"),
   counter: state.app.get("counter"),
   isLoggedIn: state.app.get("isLoggedIn")
});

export default connect(mapStateToProps)(Login);
