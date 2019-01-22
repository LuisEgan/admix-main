import React from "react";
import { connect } from "react-redux";
import { reduxForm } from "redux-form";

class ResetForm extends React.Component {
  render() {
    return (
      <form>
        <div>Signup</div>
      </form>
    );
  }
}

const formConfig = {
  form: "resetForm",
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

ResetForm = reduxForm(formConfig)(ResetForm);
ResetForm = connect(mapStateToProps)(ResetForm);

export default ResetForm;
