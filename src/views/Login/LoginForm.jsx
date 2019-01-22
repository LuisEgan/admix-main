import React from "react";
import { connect } from "react-redux";
import { reduxForm } from "redux-form";
import { login } from "../../actions";
import { setAsyncLoading } from "../../actions/asyncActions";
import TextInput from "../../components/formInputs/TextInput";
import STR from "../../utils/strFuncs";
import C from "../../utils/constants";
import { lowerCase } from "../../utils/normalizers";
import isEqual from "lodash/isEqual";

class LoginForm extends React.Component {
  constructor(props) {
    super(props);

    this.handleLogin = this.handleLogin.bind(this);
  }

  shouldComponentUpdate = (nextProps, nextState) => {
    const { loginForm, asyncError } = this.props;
    if (
      (loginForm &&
        loginForm.values &&
        !isEqual(loginForm.values, nextProps.loginForm.values)) ||
      asyncError !== nextProps.asyncError
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

  render() {
    const { handleSubmit, asyncError } = this.props;
    return (
      <React.Fragment>
        <form onSubmit={handleSubmit(this.handleLogin)}>
          <TextInput
            name="email"
            formname="loginForm"
            label="Email"
            normalize={lowerCase}
          />
          <TextInput name="password" label="Password" normalize={lowerCase} />
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
  return {
    asyncData: state.async.get("asyncData"),
    asyncError: state.async.get("asyncError"),
    asyncLoading: state.async.get("asyncLoading"),
    loginForm: state.form.loginForm,
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
