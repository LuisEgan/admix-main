import React from "react";
import { connect } from "react-redux";
import { reduxForm } from "redux-form";
import routeCodes from "../../config/routeCodes";
import actions from "../../actions";
import { resetAsync } from "../../actions/asyncActions";
import FormTextInput from "../../components/formInputs/FormTextInput";
import STR from "../../utils/strFuncs";
import C from "../../utils/constants";
import { lowerCase } from "../../utils/normalizers";
import isEqual from "lodash/isEqual";
import FontAwesomeIcon from "@fortawesome/react-fontawesome";

const { login } = actions;

class LoginForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hidePass: true,
    };

    this.handleLogin = this.handleLogin.bind(this);
    this.togglePassInputType = this.togglePassInputType.bind(this);
  }

  componentDidMount = () => {
    const { resetAsync } = this.props;
    resetAsync();
  };

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
    const { location, handleSubmit, renderAsyncMessage } = this.props;
    const from = location && location.state ? location.state.from : {};

    const { hidePass } = this.state;
    return (
      <React.Fragment>
        {from === routeCodes.EMAIL_SUCCESS && (
          <div className="" style={{ color: "#14b9be", padding: "10px 0" }}>
            Verified! You may log in now{" "}
            <span role="img" aria-label="cool">
              😎
            </span>
          </div>
        )}
        <form onSubmit={handleSubmit(this.handleLogin)}>
          <FormTextInput name="email" label="Email" normalize={lowerCase} />
          <FormTextInput
            name="password"
            type={hidePass ? "password" : "text"}
            label="Password"
            icon={
              <FontAwesomeIcon icon="eye" onClick={this.togglePassInputType} />
            }
          />
          <button className="gradient-btn">Login</button>
          {renderAsyncMessage()}
        </form>
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
  resetAsync: () => dispatch(resetAsync()),
});

LoginForm = reduxForm(formConfig)(LoginForm);
LoginForm = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LoginForm);

export default LoginForm;
