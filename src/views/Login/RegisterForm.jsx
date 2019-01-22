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
  const {
    app: { asyncData, asyncError, asyncLoading },
  } = state;

  return {
    asyncData,
    asyncError,
    asyncLoading,
  };
};

SignupForm = reduxForm(formConfig)(SignupForm);
SignupForm = connect(mapStateToProps)(SignupForm);

export default SignupForm;
