import React from "react";
import { connect } from "react-redux";
import { reduxForm } from "redux-form";
import actions from "../../actions";
import { resetAsync } from "../../actions/asyncActions";
import FormTextInput from "../../components/formInputs/FormTextInput";
import Checkbox from "../../components/formInputs/FormCheckbox";
import STR from "../../utils/strFuncs";
import { lowerCase } from "../../utils/normalizers";
import isEqual from "lodash/isEqual";
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import C from "../../utils/constants";

const { register } = actions;

class RegisterForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hidePass: true,
      passStyles: {
        limit: null,
        letter: null,
        number: null,
      },
    };

    this.handleRegister = this.handleRegister.bind(this);
    this.togglePassInputType = this.togglePassInputType.bind(this);
    this.setPassGuidelineStyle = this.setPassGuidelineStyle.bind(this);
    this.passGuideline = this.passGuideline.bind(this);
  }

  componentDidMount = () => {
    const { resetAsync } = this.props;
    resetAsync();
  };

  shouldComponentUpdate = (nextProps, nextState) => {
    const { registerForm, asyncError, asyncLoading, asyncMessage } = this.props;
    const { hidePass, passStyles } = this.state;
    if (
      (registerForm &&
        nextProps.registerForm.values &&
        !isEqual(registerForm.values, nextProps.registerForm.values)) ||
      asyncError !== nextProps.asyncError ||
      asyncLoading !== nextProps.asyncLoading ||
      asyncMessage !== nextProps.asyncMessage ||
      hidePass !== nextState.hidePass ||
      !isEqual(passStyles, nextState.passStyles)
    ) {
      return true;
    }

    return false;
  };

  handleRegister(values) {
    const { register } = this.props;
    const { name, email, password } = values;
    this.feedback.scrollIntoView({ behavior: "smooth" });
    register(name, email, password);
  }

  togglePassInputType() {
    this.setState({ hidePass: !this.state.hidePass });
  }

  setPassGuidelineStyle(e) {
    const {
      target: { value },
    } = e;
    const passStyles = {};

    const goodStyle = { color: "green" };
    const badStyle = { color: "red" };

    passStyles.limit = STR.isAtleast(value, 8) ? goodStyle : badStyle;
    passStyles.letter = STR.hasLetter(value) ? goodStyle : badStyle;
    passStyles.number = STR.hasNumber(value) ? goodStyle : badStyle;

    this.setState({ passStyles });
  }

  passGuideline() {
    const { passStyles } = this.state;
    return (
      <React.Fragment>
        <span style={passStyles.limit}>min 8 characters</span> -{" "}
        <span style={passStyles.letter}>one letter</span> -{" "}
        <span style={passStyles.number}>one number</span>
      </React.Fragment>
    );
  }

  privacyText() {
    return (
      <div className="mbs">
        I have read to Admix’s &nbsp;
        <a
          href="https://admix.in/wp-content/uploads/2018/08/terms-1.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          T&Cs
        </a>
        &nbsp; and &nbsp;
        <a
          href="https://admix.in/wp-content/uploads/2018/08/privacy-1.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          privacy policy
        </a>
      </div>
    );
  }

  dataUsageText() {
    return (
      <div className="mbs">
        I confirm that I have consent from my users to process some of their
        data, such as device ID or location, to serve more relevant ads.
      </div>
    );
  }

  render() {
    const { handleSubmit, asyncLoading, asyncError, asyncMessage } = this.props;
    const { hidePass } = this.state;

    const feedbackStyle = asyncError ? { color: "red" } : {};

    return (
      <form onSubmit={handleSubmit(this.handleRegister)}>
        {asyncMessage !== C.SUCCESS.emailSent && (
          <React.Fragment>
            <FormTextInput
              name="name"
              label="Username"
            />
            <FormTextInput
              name="email"
              label="Email"
              normalize={lowerCase}
            />
            <FormTextInput
              name="password"
              type={hidePass ? "password" : "text"}
              label="Password"
              icon={
                <FontAwesomeIcon
                  icon="eye"
                  onClick={this.togglePassInputType}
                />
              }
              guideline={
                "Must have at least 8 characters, at least 1 letter and at least 1 number"
              }
              hideGuideLineOnSucces={true}
            />
            <FormTextInput
              name="passwordCheck"
              type={hidePass ? "password" : "text"}
              label="Confirm Password"
              icon={
                <FontAwesomeIcon
                  icon="eye"
                  onClick={this.togglePassInputType}
                />
              }
            />
            <Checkbox
              name="privacy"
              id="privacy"
              textComp={this.privacyText()}
            />
            <Checkbox
              name="dataUsage"
              id="dataUsage"
              textComp={this.dataUsageText()}
            />
            <button className="gradient-btn">Register</button>
          </React.Fragment>
        )}

        <div
          ref={e => (this.feedback = e)}
          id="register-feedback"
          className="animate fadeIn"
          style={feedbackStyle}
        >
          {asyncLoading || asyncError || asyncMessage}
        </div>
      </form>
    );
  }
}

const validate = values => {
  const errors = {};
  const { name, email, password, passwordCheck, privacy, dataUsage } = values;

  if (!name) {
    errors.name = "We need a name!";
  }

  if (!email || !STR.isValidEmail(email)) {
    errors.email = "Your email is invalid.";
  }

  if (
    !password ||
    !STR.isAtleast(password, 8) ||
    !STR.hasLetter(password) ||
    !STR.hasNumber(password)
  ) {
    errors.password = "Invalid password.";
  }

  if (!passwordCheck || password !== passwordCheck) {
    errors.passwordCheck = "Passwords do not match!";
  }

  if (!privacy) {
    errors.privacy = true;
  }

  if (!dataUsage) {
    errors.dataUsage = true;
  }

  return errors;
};

const formConfig = {
  form: "registerForm",
  validate,
};

const mapStateToProps = state => {
  const {
    async: { asyncMessage, asyncError, asyncLoading },
    form: { registerForm },
  } = state;

  return {
    asyncMessage,
    asyncError,
    asyncLoading,
    registerForm,
  };
};

const mapDispatchToProps = dispatch => ({
  register: (name, email, password) =>
    dispatch(register(name, email, password)),
  resetAsync: () => dispatch(resetAsync()),
});

RegisterForm = reduxForm(formConfig)(RegisterForm);
RegisterForm = connect(
  mapStateToProps,
  mapDispatchToProps,
)(RegisterForm);

export default RegisterForm;
