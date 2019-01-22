import React from "react";
import { connect } from "react-redux";
import { reduxForm } from "redux-form";

class SignupForm extends React.Component {
  render() {
    return (
      <form>
        <div>Signup</div>
      </form>
    );
  }
}

const formConfig = {
  form: "signupForm",
  // validate
};

const mapStateToProps = state => {
  return {
    asyncData: state.app.get("asyncData"),
    asyncError: state.app.get("asyncError"),
    asyncLoading: state.app.get("asyncLoading"),
  };
};

SignupForm = reduxForm(formConfig)(SignupForm);
SignupForm = connect(mapStateToProps)(SignupForm);

export default SignupForm;
