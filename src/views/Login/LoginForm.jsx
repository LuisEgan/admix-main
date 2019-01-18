import React from "react";
import { connect } from "react-redux";
import { Field, reduxForm, reset } from "redux-form";
import _a from "../../utils/analytics";
import { login } from "../../actions";
import Input from "../../components/Input";
import STR from "../../utils/strFuncs";

class LoginForm extends React.Component {
  constructor(props) {
    super(props);

    this.handleLogin = this.handleLogin.bind(this);
  }

  handleLogin(values) {
    // console.log("values: ", values);
    // login(emailLogin.toLowerCase(), passLogin);
  }

  renderField(field) {
    const { input } = field;

    return (
      <div className="mb login-input">
        <span className="input-label">
          {STR.capitalizeFirstLetter(input.name)}
        </span>
        <Input {...input} id={input.name} />
      </div>
    );
  }

  render() {
    const { handleSubmit } = this.props;
    return (
      <form onSubmit={handleSubmit(this.handleLogin)}>
        <Field name="email" component={this.renderField} />
        <Field name="password" component={this.renderField} />
        <button className="gradient-btn">Login</button>
      </form>
    );
  }
}

const formConfig = {
  form: "loginForm",
};

const mapStateToProps = state => {
  return {
    asyncData: state.app.get("asyncData"),
    asyncError: state.app.get("asyncError"),
    asyncLoading: state.app.get("asyncLoading"),
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
