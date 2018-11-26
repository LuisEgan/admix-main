import React, { Component } from "react";
import { connect } from "react-redux";
import _a from "../../utils/analytics";
import { Field, reduxForm, reset, change } from "redux-form";
import {
  imgUpload,
  setUserImgURL,
  forgotPass,
  updateUser,
  changeEmail
} from "../../actions";
import PropTypes from "prop-types";
import Dropzone from "react-dropzone";
import request from "superagent";
import ReactSVG from "react-svg";
import ExpansionPanel from "../../components/ExpansionPanel";

// Material UI
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import Select from "@material-ui/core/Select";
import Input from "@material-ui/core/Input";
import { KeyboardArrowDown } from "@material-ui/icons";

//SVGs
import SVG_personalInfo from "../../assets/svg/personal-information.svg";
import SVG_payment from "../../assets/svg/payments-configuration.svg";

import CSS from "../../utils/InLineCSS";

import CustomInput from "../../components/Input";

import FontAwesomeIcon from "@fortawesome/react-fontawesome";

import BankDetails from "./BankDetails";

import {
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_UPLOAD_URL
} from "../../config/cloudinary";

import defaultImg from "../../assets/img/default_pic.jpg";
import paypal from "../../assets/img/paypal.png";
import SVG from "../../components/SVG";

const { ga } = _a;

class Profile extends Component {
  static propTypes = {
    dispatch: PropTypes.func
  };

  constructor(props) {
    super(props);

    const {
      userData: { payment }
    } = props;

    this.state = {
      statusMssg: "",
      uploadedFile: "",
      passInputType: "password",
      clicked: "",
      changePassClicked: false,
      isWarningVisible: false,
      payment: {
        option: payment.option ? payment.option : "",
        region: payment.details.region ? payment.details.region : "",
        details: payment.details.bankDetails ? payment.details.bankDetails : {}
      }
    };

    this.togglePassInputType = this.togglePassInputType.bind(this);
    this.renderField = this.renderField.bind(this);
    this.onImageDrop = this.onImageDrop.bind(this);
    this.handleImageUploadClient = this.handleImageUploadClient.bind(this);
    this.handleImageUploadServer = this.handleImageUploadServer.bind(this);
    this.handleUserUpdate = this.handleUserUpdate.bind(this);
    this.paymentChange = this.paymentChange.bind(this);
  }

  hardFocus(input) {
    this[input].focus();
  }

  hardUnfocus(input) {
    this[input].blur();
  }

  togglePassInputType() {
    let { passInputType } = this.state;
    passInputType = passInputType === "password" ? "text" : "password";
    this.setState({ passInputType });
  }

  handleSubmit = e => {
    _a.track(ga.actions.account.accountUpdate, {
      category: ga.categories.account
    });

    e.preventDefault();
    const {
      reduxForm: {
        profileForm: { values }
      },
      userData,
      dispatch,
      accessToken,
      initialValues
    } = this.props;
    const { payment } = this.state;

    let update = {
      name: values.userName
    };

    delete values.email;
    delete values.password;

    if (payment.option !== "") {
      update.payment = {
        option: payment.option
      };

      if (payment.option !== "paypal") {
        let paymentDetail = {};
        update.payment.details = {};

        // this is in case the user chose a different region from the one in the db
        if (initialValues.initialPaymentRegion !== payment.region) {
          for (let initialValue in initialValues) {
            delete values[initialValue];

            // clear the old bankDetails values from form
            if (
              initialValue !== "userName" &&
              initialValue !== "initialPaymentRegion" &&
              initialValue !== "password" &&
              initialValue !== "email"
            ) {
              dispatch(change("profileForm", initialValue, ""));
            }
          }
        }

        for (let field in values) {
          if (field !== "userName" && field !== "initialPaymentRegion") {
            paymentDetail[field] = values[field];
          }
        }

        update.payment.details.bankDetails = paymentDetail;
        update.payment.details.region = payment.region;
      } else {
        update.payment.paypalEmail = values.paypalEmail;
      }
    }

    dispatch(updateUser(userData._id, update, accessToken));
  };

  onImageDrop(files) {
    _a.track(ga.actions.account.imageChange, {
      category: ga.categories.account
    });

    const { userData } = this.props;

    this.setState({
      uploadedFile: files[0]
    });

    const reader = new FileReader();
    reader.onload = () => {
      const imgPath = reader.result;
      this.handleImageUploadServer({ imgPath, userId: userData._id });
    };
    reader.readAsDataURL(files[0]);

    //   this.handleImageUploadClient(files[0]);
  }

  handleImageUploadClient(file) {
    const {
      userData: { _id },
      dispatch
    } = this.props;

    let upload = request
      .post(CLOUDINARY_UPLOAD_URL)
      .field("upload_preset", CLOUDINARY_UPLOAD_PRESET)
      .field("public_id", _id)
      .field("file", file);

    upload.end((err, response) => {
      if (err) {
        console.error(err);
      }

      if (response.body.secure_url !== "") {
        const imgURL = {
          data: response.body.secure_url
        };
        dispatch(setUserImgURL(imgURL));
      }
    });
  }

  handleImageUploadServer({ imgPath, userId }) {
    const { accessToken, dispatch } = this.props;

    dispatch(imgUpload(imgPath, userId, accessToken));
  }

  handleUserUpdate(input) {
    const _aAction =
      input === "password"
        ? ga.actions.account.passwordChangeRequest
        : ga.actions.account.emailChangeRequest;
    _a.track(_aAction, {
      category: ga.categories.account
    });

    const { dispatch, initialValues, accessToken } = this.props;

    const newState =
      input === "password"
        ? { clicked: input, changePassClicked: true }
        : { clicked: input };
    this.setState(newState, () => {
      if (input === "password") {
        dispatch(forgotPass(initialValues.email));
      } else if (input === "email") {
        dispatch(changeEmail(initialValues.email, accessToken));
      }
    });
  }

  paymentChange(input, e) {
    const {
      dispatch,
      reduxForm: {
        profileForm: { values }
      },
      initialValues
    } = this.props;
    let payment = this.state.payment;
    payment[input] = e.target.value;
    dispatch(reset("profileForm"));
    dispatch(change("profileForm", "userName", values.userName));

    // force the update on the new values (this is for when the user updates and changes between regions)
    for (let initialValue in initialValues) {
      if (
        initialValue !== "userName" &&
        initialValue !== "initialPaymentRegion" &&
        initialValue !== "password" &&
        initialValue !== "email"
      ) {
        dispatch(
          change("profileForm", initialValue, initialValues[initialValue])
        );
      }
    }
    this.setState({ payment });
  }

  renderField(field) {
    const { initialValues } = this.props;
    const { input } = field;

    let label = input.name;
    let disabled = false;
    let type = "text";

    if (input.name === "userName") {
      if (input.value.length === 0) {
        input.value = initialValues[input.name];
      }
      label = "Name";
    } else if (input.name === "email") {
      input.value = initialValues.email;
      label = "Email";
      disabled = true;
    } else if (input.name === "Password") {
      input.value = initialValues.password;
      disabled = true;
      type = "password";
    } else if (input.name === "paypalEmail") {
      label = "Paypal email";
    }

    return (
      <div>
        <span>{label}</span>
        <CustomInput
          {...input}
          type={type}
          className="mb"
          id={input.name}
          disabled={disabled}
        />
      </div>
    );
  }

  render() {
    const { asyncLoading, userData } = this.props;
    const { payment } = this.state;

    const paypalEmailStyle =
      payment.option !== "bank" ? { display: "block" } : { display: "none" };

    const payBanksStyle =
      payment.option === "bank" ? { display: "block" } : { display: "none" };

    const payBanksDetailsStyle =
      payment.region !== "" ? { display: "block" } : { display: "none" };

    return (
      <div className="step-container" id="profile">
        <form onSubmit={this.handleSubmit}>
          <div className="step-title">
            <h3 className="st sc-h3">My profile</h3>
            <button type="submit" className="mb gradient-btn">
              Save
            </button>
          </div>

          <div>
            <div>
              <div className="image-drop-container">
                <div className="image-drop">
                  <Dropzone
                    multiple={false}
                    accept="image/*"
                    onDrop={this.onImageDrop}
                    className="dropzone"
                  >
                    {!asyncLoading && (
                      <React.Fragment>
                        <img
                          src={userData.cloudinaryImgURL}
                          onError={e => (e.target.src = defaultImg)}
                          alt="+"
                        />
                        {/* {SVG.edit} */}
                        {/* <FontAwesomeIcon
                                       className="fa"
                                       icon={faPen}
                                    /> */}
                        <FontAwesomeIcon icon="pen" />
                      </React.Fragment>
                    )}

                    {asyncLoading && SVG.AdmixLoading({})}
                  </Dropzone>
                </div>
              </div>
            </div>
            <div>
              <div className="mb">
                {/* PERSONAL INFORMATION */}

                <ExpansionPanel
                  headerIcon={
                    <ReactSVG src={SVG_personalInfo} className="sectionIcon" />
                  }
                  headerTitle={"Personal information"}
                >
                  <PersonalInfo
                    renderField={this.renderField}
                    handleUserUpdate={this.handleUserUpdate}
                    {...this.state}
                    {...this.props}
                  />
                </ExpansionPanel>

                {/* PAYMENT OPTIONS */}

                <ExpansionPanel
                  headerIcon={
                    <ReactSVG src={SVG_payment} className="sectionIcon" />
                  }
                  headerTitle={"Payment configuration"}
                  contentId={"expansionPanelDetails-container-payment"}
                >
                  <PaymentConfig
                    renderField={this.renderField}
                    paymentChange={this.paymentChange}
                    paypalEmailStyle={paypalEmailStyle}
                    payBanksStyle={payBanksStyle}
                    payBanksDetailsStyle={payBanksDetailsStyle}
                    {...this.state}
                    {...this.props}
                  />
                </ExpansionPanel>

                <br />
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

const PersonalInfo = ({
  renderField,
  handleUserUpdate,
  asyncLoading,
  clicked,
  changePassClicked
}) => {
  return (
    <React.Fragment>
      <div>
        <Field name="userName" component={renderField} />
        <Field name="email" component={renderField} />
        <Field name="Password" component={renderField} disabled={true} />
      </div>
      <div>
        <div />
        <div>
          <span className="profile-helper-text">
            <a onClick={handleUserUpdate.bind(null, "email")}>
              {asyncLoading && clicked === "email"
                ? " ...Loading"
                : " Update email"}
            </a>
          </span>
        </div>
        <div>
          <span className="profile-helper-text">
            {!changePassClicked && (
              <a onClick={handleUserUpdate.bind(null, "password")}>
                {asyncLoading && clicked === "password"
                  ? " ...Loading"
                  : " Change password."}
              </a>
            )}

            {changePassClicked && (
              <span>
                {asyncLoading && clicked === "password"
                  ? " ...Loading"
                  : " Check your inbox for the password reset link."}
              </span>
            )}
          </span>
        </div>
      </div>
    </React.Fragment>
  );
};

const PaymentConfig = ({
  renderField,
  paymentChange,
  payment,
  paypalEmailStyle,
  payBanksStyle,
  payBanksDetailsStyle
}) => {
  const regions = [
    { title: <em>Please select a region</em>, value: "" },
    { title: "United States of America", value: "usa" },
    { title: "United Kingdom", value: "uk" },
    { title: "Europe", value: "eu" }
  ];

  return (
    <React.Fragment>
      <div>
        <Field name="compName" component={renderField} />
      </div>

      <RadioGroup
        aria-label="paymentOpts"
        name="paymentOpts"
        value={payment.option}
        onChange={paymentChange.bind(null, "option")}
        className="paymentOpts"
      >
        <FormControlLabel
          value="paypal"
          control={<Radio className="mui-radio-btn" />}
          label={<img src={paypal} alt="paypal" />}
        />
        <FormControlLabel
          value="bank"
          control={<Radio className="mui-radio-btn" />}
          label={
            <React.Fragment>
              <FontAwesomeIcon icon="university" /> Bank
            </React.Fragment>
          }
        />
      </RadioGroup>

      <div style={paypalEmailStyle}>
        <Field name="paypalEmail" component={renderField} />
      </div>

      <div id="profile-pay-banks" style={payBanksStyle} className="fadeIn mb">
        <FormControl>
          <div className="input-label">Region</div>
          <Select
            value={payment.region}
            onChange={paymentChange.bind(null, "region")}
            input={<Input name="region" id="region-helper" />}
            classes={{ root: "mui-select-root" }}
            disableUnderline={true}
            IconComponent={KeyboardArrowDown}
            style={CSS.mb}
          >
            {regions.map(region => (
              <MenuItem key={region.value} style={CSS.mb} value={region.value}>
                {region.title}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            Don't see your country yet? You can always use PayPal in the
            meantime{" "}
            <span role="img" aria-label="thumbs-up">
              👍
            </span>
          </FormHelperText>
        </FormControl>

        {payment.region !== "" && (
          <div
            id="profile-pay-banks-details"
            style={payBanksDetailsStyle}
            className="fadeIn"
          >
            <BankDetails
              Field={Field}
              renderField={renderField}
              region={payment.region}
            />
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = state => {
  const userData = state.app.get("userData");
  const {
    payment: {
      paypalEmail,
      details: { bankDetails, region }
    }
  } = userData;

  const initialPaymentRegion = region;

  const initialValues = {
    userName: userData.name,
    email: userData.email.value,
    password: "Click -> to change it!",
    paypalEmail: paypalEmail || "",
    initialPaymentRegion
  };

  for (let bankDetail in bankDetails) {
    initialValues[bankDetail] = bankDetails[bankDetail];
  }

  return {
    accessToken: state.app.get("accessToken"),
    isLoggedIn: state.app.get("isLoggedIn"),
    userImgURL: state.app.get("userImgURL"),
    asyncLoading: state.app.get("asyncLoading"),
    userData,
    reduxForm: state.form,
    initialValues
  };
};

const validateEmail = email => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const validate = values => {
  const errors = {};
  const { email, password, password2 } = values;

  const isEmailValid = validateEmail(email);

  if (!isEmailValid) {
    errors.email = "Please enter a valid email!";
  }

  if (password && password !== password2) {
    errors.password2 = "Both passwords must be identical!";
  }

  return errors;
};

const formConfig = {
  form: "profileForm",
  validate
};

Profile = reduxForm(formConfig)(Profile);
Profile = connect(mapStateToProps)(Profile);

export default Profile;
