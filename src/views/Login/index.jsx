import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import actions from "../../actions";

import admixLogo from "../../assets/img/logo.png";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ForgotPassForm from "./ForgotPassForm";

const { resendSignUpEmail } = actions;

const views = {
  login: "Login",
  forgot: "Forgot Password",
  register: "Register",
};

const Forms = {
  [views.login]: ram => <LoginForm renderAsyncMessage={ram} />,
  [views.register]: ram => <RegisterForm renderAsyncMessage={ram} />,
  [views.forgot]: ram => <ForgotPassForm renderAsyncMessage={ram} />,
};

class Login extends Component {
  static propTypes = {
    asyncData: PropTypes.object,
    asyncError: PropTypes.string,
    asyncLoading: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  };
  constructor(props) {
    super(props);

    this.state = {
      policy: false,
      consent: false,
      registerBtnDisabled: true,
      passInputType: "password",
      show: views.login,
    };

    this.resendSignUpEmail = this.resendSignUpEmail.bind(this);

    this.toggleView = this.toggleView.bind(this);
    this.renderAsyncMessage = this.renderAsyncMessage.bind(this);
    this.renderNav = this.renderNav.bind(this);
  }

  toggleView(show) {
    this.setState({ show });
  }

  resendSignUpEmail() {
    const { dispatch, signupInfo } = this.props;
    dispatch(resendSignUpEmail(signupInfo));
  }

  // RENDER ---------------------------------------------------------

  renderAsyncMessage() {
    const { asyncError, asyncLoading, asyncMessage } = this.props;

    let message;

    if (asyncError) {
      message = (
        <div className="login-asyncMessage asyncError animate fadeIn">
          {asyncError}
        </div>
      );
    } else {
      message = (
        <div className="login-asyncMessage animate fadeIn">
          {asyncLoading ? "Loading..." : asyncMessage}
        </div>
      );
    }

    return message;
  }

  renderNav() {
    const { show } = this.state;
    let top, topShow, bottom, bottomShow;
    if (show === views.login) {
      topShow = views.forgot;
      top = "Forgot password?";

      bottomShow = views.register;
      bottom = "Register";
    } else if (show === views.forgot) {
      topShow = views.login;
      top = "Login";

      bottomShow = views.register;
      bottom = "Register";
    } else {
      topShow = views.login;
      top = "Login";
    }

    return (
      <React.Fragment>
        <div>
          <span onClick={() => this.toggleView(topShow)}>{top}</span>
        </div>

        {bottomShow && (
          <div>
            <span onClick={() => this.toggleView(bottomShow)}>{bottom}</span>
          </div>
        )}
      </React.Fragment>
    );
  }

  render() {
    const { show } = this.state;
    const formsStyle = show !== views.register ? { height: "45%" } : {};
    const navStyle = show !== views.register ? { height: "25%" } : {};

    return (
      <div id="login">
        <div>
          <div id="login-header">
            <img src={admixLogo} alt="admix" />
          </div>

          <div id="login-title" className="st">
            <div>{show}</div>
          </div>

          <div id="login-forms" style={formsStyle}>
            {Forms[show](this.renderAsyncMessage)}
          </div>

          <div id="login-nav" className="mb" style={navStyle}>
            {this.renderNav()}
          </div>
        </div>

        {/* Big right image */}
        <div />
      </div>
    );
  }
}

const mapStateToProps = state => {
  const {
    app: { signupInfo },
    async: { asyncMessage, asyncError, asyncLoading },
  } = state;

  return {
    asyncMessage,
    asyncError,
    asyncLoading,
    signupInfo,
  };
};

Login = connect(mapStateToProps)(Login);

export default Login;
