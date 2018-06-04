import React, { Component } from "react";
import { connect } from "react-redux";
import { setNewPass, resetAsync } from "../../actions";
import STR from "../../utils/strFuncs";
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faEye from "@fortawesome/fontawesome-free-solid/faEye";

class ForgotPass extends Component {
   constructor(props) {
      super(props);
      this.state = {
         password: "",
         passInputType: "password",
         confirmPassword: "",
         regValidation: {
            is8: "",
            hasLetter: "",
            hasNumber: "",
            arePassSame: ""
         },
         registerBtnDisabled: true
      };

      this.handleKeyPress = this.handleKeyPress.bind(this);
      this.handleInputChange = this.handleInputChange.bind(this);
      this.handleFocus = this.handleFocus.bind(this);
      this.hardFocus = this.hardFocus.bind(this);
      this.togglePassInputType = this.togglePassInputType.bind(this);
      this.handleChangePass = this.handleChangePass.bind(this);
   }

   handleKeyPress(e) {
      if (e.key === "Enter") {
         this.handleChangePass();
      }
   }

   handleInputChange(input, e) {
      const state = this.state;
      const inputValue = e.target.value;

      const inputParsed = input.replace("Reg", "");
      state[inputParsed] = inputValue;
      state.registerBtnDisabled = false;

      if (input === "passwordReg") {
         state.regValidation.is8 = STR.isAtleast(inputValue, 8);
         state.regValidation.hasLetter = STR.hasLetter(inputValue);
         state.regValidation.hasNumber = STR.hasNumber(inputValue);
         state.regValidation.arePassSame = state.confirmPassword === inputValue;
      } else if (input === "confirmPasswordReg") {
         state.regValidation.arePassSame = state.password === inputValue;
      }

      for (let validation in state.regValidation) {
         if (!state.regValidation[validation]) {
            state.registerBtnDisabled = true;
         }
      }

      this.setState(state);
   }

   handleFocus(e) {
      const { asyncError, dispatch } = this.props;

      if (asyncError !== "") {
         dispatch(resetAsync());
      }
   }

   hardFocus(input) {
      this[input].focus();
   }

   togglePassInputType() {
      let { passInputType } = this.state;
      passInputType = passInputType === "password" ? "text" : "password";
      this.setState({ passInputType });
   }

   handleChangePass() {
      let {
         dispatch,
         location: { search }
      } = this.props;

      const { password } = this.state;

      search = search.split("?")[1];
      const token = search
         .split("token=")[1]
         .slice(0, search.indexOf("&uid") - 6);
      const userId = search.split("uid=")[1];

      dispatch(setNewPass({ token, userId, newPass: password }));
   }

   render() {
      const { asyncData, asyncError, asyncLoading } = this.props;

      const {
         passInputType,
         regValidation: { is8, hasLetter, hasNumber, arePassSame },
         registerBtnDisabled
      } = this.state;

      const loadingIcon = <p>Loading...</p>;

      // for register validation
      const goodStyle = { color: "green" };
      const badStyle = { color: "red" };

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
            <span>
               <div className="inputs-container">
                  <div className="inputs-header">
                     <h3 className="st">Change your password</h3>
                  </div>

                  <div className="inputs">
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
                              onClick={this.handleChangePass}
                              disabled={registerBtnDisabled}
                           >
                              Set new password
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
   isLoggedIn: state.app.get("isLoggedIn")
});

export default connect(mapStateToProps)(ForgotPass);
