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
  return {
    asyncData: state.app.get("asyncData"),
    asyncError: state.app.get("asyncError"),
    asyncLoading: state.app.get("asyncLoading"),
  };
};

ResetForm = reduxForm(formConfig)(ResetForm);
ResetForm = connect(mapStateToProps)(ResetForm);

export default ResetForm;
