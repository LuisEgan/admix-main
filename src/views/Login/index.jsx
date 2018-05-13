import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { login, signup, forgotPass, resetAsync } from "../../actions";
import ToggleDisplay from "react-toggle-display";
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
         passValidation: {
            focused: false,
            is8: false,
            hasLetter: false,
            hasNumber: false
         },
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
      state[input] = e.target.value;

      this.setState(state);
   }

   handleFocus(input, e) {
      console.log("input: ", input);
      const { asyncError, dispatch } = this.props;
      const { passValidation } = this.state;

      if (asyncError !== "") {
         dispatch(resetAsync());
      }

      if (input === "password") {
         passValidation.focused = true;
         this.setState({ passValidation });
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

   is8(str) {
      return str.length > 7;
   }

   hasLetter(str) {
      return /[a-z]/i.test(str);
   }

   hasNumber(str) {
      return /\d/.test(str);
   }

   render() {
      const { asyncData, asyncError, asyncLoading } = this.props;

      const {
         show,
         passInputType,
         password,
         passValidation: { focused }
      } = this.state;

      // const loading = <i className="fa fa-cog fa-spin"></i>;
      const loadingIcon = <p>Loading...</p>;

      const showLogin = show === "login";
      const showLostPast = show === "forgotPass";
      const showRegister = show === "register";

      // for password register
      let is8Style, hasLetterStyle, hasNumberStyle;
      if (focused) {
         is8Style = this.is8(password) ? { color: "green" } : { color: "red" };
         hasLetterStyle = this.hasLetter(password)
            ? { color: "green" }
            : { color: "red" };
         hasNumberStyle = this.hasNumber(password)
            ? { color: "green" }
            : { color: "red" };
      }

      return (
         <div id="login" onKeyPress={this.handleKeyPress}>
            <ToggleDisplay show={showLogin}>
               <div className="inputs-container">
                  <div className="inputs-header">
                     <h3 className="st">Login</h3>
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
                              Login
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
                     <input
                        type="text"
                        className="form-control"
                        placeholder="Name"
                        onChange={this.handleInputChange.bind(null, "name")}
                        onFocus={this.handleFocus}
                        ref={input => {
                           this.registerNameInput = input;
                        }}
                        onClick={this.hardFocus.bind(null, "registerNameInput")}
                     />
                     <input
                        type="text"
                        className="form-control"
                        placeholder="Email"
                        onChange={this.handleInputChange.bind(null, "email")}
                        onFocus={this.handleFocus}
                        ref={input => {
                           this.registerEmailInput = input;
                        }}
                        onClick={this.hardFocus.bind(
                           null,
                           "registerEmailInput"
                        )}
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
                           onFocus={this.handleFocus.bind(null, "password")}
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
                     <div id="passRules">
                        <span style={is8Style}>min 8 characters - </span>
                        <span style={hasLetterStyle}>one letter - </span>
                        <span style={hasNumberStyle}>one number</span>
                     </div>
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
                              onClick={this.handleSignup}
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
