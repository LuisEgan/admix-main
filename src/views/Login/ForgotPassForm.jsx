import React from "react";
import { connect } from "react-redux";
import { reduxForm } from "redux-form";
import actions from "../../actions";
import { resetAsync } from "../../actions/asyncActions";
import TextInput from "../../components/formInputs/FormTextInput";
import STR from "../../utils/strFuncs";
import C from "../../utils/constants";
import { lowerCase } from "../../utils/normalizers";
import isEqual from "lodash/isEqual";

const { forgotPass } = actions;
class ForgotPassForm extends React.Component {
  constructor(props) {
    super(props);

    this.handleforgotPass = this.handleforgotPass.bind(this);
  }

  componentDidMount = () => {
    const { resetAsync } = this.props;
    resetAsync();
  };

  shouldComponentUpdate = (nextProps, nextState) => {
    const {
      forgotPassForm,
      asyncError,
      asyncMessage,
      asyncLoading,
    } = this.props;
    if (
      (forgotPassForm &&
        forgotPassForm.values &&
        !isEqual(forgotPassForm.values, nextProps.forgotPassForm.values)) ||
      asyncError !== nextProps.asyncError ||
      asyncLoading !== nextProps.asyncLoading ||
      asyncMessage !== nextProps.asyncMessage
    ) {
      return true;
    }

    return false;
  };

  handleforgotPass(values) {
    const { forgotPass } = this.props;
    const { email } = values;
    forgotPass(email);
  }

  render() {
    const { handleSubmit, renderAsyncMessage } = this.props;
    return (
      <React.Fragment>
        <form onSubmit={handleSubmit(this.handleforgotPass)}>
          <TextInput name="email" label="Email" normalize={lowerCase} />
          <button className="gradient-btn">Recover password</button>
          {renderAsyncMessage()}
        </form>
      </React.Fragment>
    );
  }
}

const validate = values => {
  const errors = {};

  if (!values.email) errors.email = STR.randomArrayValue(C.ERRORS.noEmail);
  return errors;
};

const formConfig = {
  form: "forgotPassForm",
  validate,
};

const mapStateToProps = state => {
  const {
    async: { asyncMessage, asyncError, asyncLoading },
    form: { forgotPassForm },
  } = state;

  return {
    asyncMessage,
    asyncError,
    asyncLoading,
    forgotPassForm,
  };
};

const mapDispatchToProps = dispatch => ({
  forgotPass: email => dispatch(forgotPass(email)),
  resetAsync: () => dispatch(resetAsync()),
});

ForgotPassForm = reduxForm(formConfig)(ForgotPassForm);
ForgotPassForm = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ForgotPassForm);

export default ForgotPassForm;
