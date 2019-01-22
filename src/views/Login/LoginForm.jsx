import React from "react";
import { connect } from "react-redux";
import { reduxForm } from "redux-form";
import { login } from "../../actions";
import { setAsyncLoading } from "../../actions/asyncActions";
import TextInput from "../../components/formInputs/FormTextInput";
import STR from "../../utils/strFuncs";
import C from "../../utils/constants";
import { lowerCase } from "../../utils/normalizers";
import isEqual from "lodash/isEqual";
import FontAwesomeIcon from "@fortawesome/react-fontawesome";

class LoginForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hidePass: true,
    };

    this.handleLogin = this.handleLogin.bind(this);
    this.togglePassInputType = this.togglePassInputType.bind(this);
  }

  shouldComponentUpdate = (nextProps, nextState) => {
    const { loginForm, asyncError } = this.props;
    const { hidePass } = this.state;
    if (
      (loginForm &&
        loginForm.values &&
        !isEqual(loginForm.values, nextProps.loginForm.values)) ||
      asyncError !== nextProps.asyncError ||
      hidePass !== nextState.hidePass
    ) {
      return true;
    }

    return false;
  };

  handleLogin(values) {
    const { login } = this.props;
    const { email, password } = values;
    login(email, password);
  }

  togglePassInputType() {
    this.setState({ hidePass: !this.state.hidePass });
  }

  render() {
    const { handleSubmit, asyncError } = this.props;
    const { hidePass } = this.state;
    return (
      <React.Fragment>
        <form onSubmit={handleSubmit(this.handleLogin)}>
          <TextInput
            name="email"
            formname="loginForm"
            label="Email"
            normalize={lowerCase}
          />
          <TextInput
            name="password"
            type={hidePass ? "password" : "text"}
            label="Password"
            normalize={lowerCase}
            icon={
              <FontAwesomeIcon icon="eye" onClick={this.togglePassInputType} />
            }
          />
          <button className="gradient-btn">Login</button>
        </form>
        {asyncError && (
          <div className="login-error asyncError animate fadeIn">
            {asyncError}
          </div>
        )}
      </React.Fragment>
    );
  }
}

const validate = values => {
  const errors = {};

  if (!values.email) errors.email = STR.randomArrayValue(C.ERRORS.noEmail);
  if (!values.password)
    errors.password = STR.randomArrayValue(C.ERRORS.noPassword);

  console.log("errors: ", errors);
  return errors;
};

const formConfig = {
  form: "loginForm",
  validate,
  onSubmitFail: (errors, dispatch) => {
    dispatch(setAsyncLoading(errors));
  },
};

const mapStateToProps = state => {
  const {
    async: { asyncData, asyncError, asyncLoading },
    form: { loginForm },
  } = state;

  return {
    asyncData,
    asyncError,
    asyncLoading,
    loginForm,
  };
};

const mapDispatchToProps = dispatch => ({
  login: (email, password) => dispatch(login(email, password)),
});

LoginForm = reduxForm(formConfig)(LoginForm);
LoginForm = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LoginForm);

export default LoginForm;
