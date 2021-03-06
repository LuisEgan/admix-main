import React, { Component } from "react";
import { connect } from "react-redux";
import _a from "../../utils/analytics";
import { reduxForm, reset, change } from "redux-form";
import actions from "../../actions";
import PropTypes from "prop-types";
import Dropzone from "react-dropzone";
import request from "superagent";
import ReactSVG from "react-svg";
import ExpansionPanel from "../../components/ExpansionPanel";
import FontAwesomeIcon from "@fortawesome/react-fontawesome";

import CompanyInfo from "./Panels/CompanyInfo";
import PersonalInfo from "./Panels/PersonalInfo";
import PaymentConfig from "./Panels/PaymentConfig";

//SVGs
import SVG_personalInfo from "../../assets/svg/personal-information.svg";
import SVG_payment from "../../assets/svg/payments-configuration.svg";
import { KeyboardArrowDown, KeyboardArrowRight } from "@material-ui/icons";

import CustomInput from "../../components/inputs/TextInput";

import {
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_UPLOAD_URL,
} from "../../config/cloudinary";

import defaultImg from "../../assets/img/default_pic.jpg";
import SVG from "../../components/SVG";
import routeCodes from "../../config/routeCodes";

import pdf from "../../assets/pdf/Admix-Supply-Partner-Integration-and-Media-Agmt-web-acceptance-version-16-01-19.pdf";

const { ga } = _a;
const {
  imgUpload,
  setUserImgURL,
  forgotPass,
  changeEmail,
  updateUser,
  logout,
} = actions;

const tabs = {
  per: "Personal info",
  org: "Organisation",
  com: "Company info",
  pay: "Payments",
  noti: "Notifications",
  ter: "Terms and conditions",
  log: "Logout",
};
class Profile extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
  };

  constructor(props) {
    super(props);

    const {
      userData: { payment },
    } = props;

    this.state = {
      show: tabs.per,
      statusMssg: "",
      uploadedFile: "",
      passInputType: "password",
      clicked: "",
      changePassClicked: false,
      isWarningVisible: false,
      payment: {
        option: payment.option ? payment.option : "",
        region: payment.details.region ? payment.details.region : "",
        details: payment.details.bankDetails ? payment.details.bankDetails : {},
      },
    };

    this.handleLogout = this.handleLogout.bind(this);
    this.changeView = this.changeView.bind(this);
    this.togglePassInputType = this.togglePassInputType.bind(this);
    this.renderField = this.renderField.bind(this);
    this.onImageDrop = this.onImageDrop.bind(this);
    this.handleImageUploadClient = this.handleImageUploadClient.bind(this);
    this.handleImageUploadServer = this.handleImageUploadServer.bind(this);
    this.handleUserUpdate = this.handleUserUpdate.bind(this);
    this.show = this.show.bind(this);
    this.paymentChange = this.paymentChange.bind(this);
  }

  handleLogout() {
    const { dispatch, history } = this.props;
    dispatch(logout());
    history.push(routeCodes.LOGIN);
  }

  changeView(view) {
    this.setState({ show: view });
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

  handleSubmit = values => {
    _a.track(ga.actions.account.accountUpdate, {
      category: ga.categories.account,
    });

    const { userData, dispatch, accessToken, initialValues } = this.props;
    const { payment } = this.state;
    const {
      userName,
      paypalEmail,
      initialPaymentRegion,
      email,
      password,
      ...companyInfo
    } = values;

    let update = {
      name: userName,
      company: { ...companyInfo },
    };

    delete values.email;
    delete values.password;

    if (payment.option !== "") {
      update.payment = {
        option: payment.option,
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
        update.payment.paypalEmail = paypalEmail;
      }
    }

    dispatch(
      updateUser({ userId: userData._id, newData: update, accessToken }),
    );
  };

  onImageDrop(files) {
    _a.track(ga.actions.account.imageChange, {
      category: ga.categories.account,
    });

    const { userData } = this.props;

    this.setState({
      uploadedFile: files[0],
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
      dispatch,
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
          data: response.body.secure_url,
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
      category: ga.categories.account,
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
        profileForm: { values },
      },
      initialValues,
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
          change("profileForm", initialValue, initialValues[initialValue]),
        );
      }
    }
    this.setState({ payment });
  }

  show(view) {
    const { show } = this.state;
    return show === view;
  }

  renderField(field) {
    const { initialValues } = this.props;
    const { input } = field;

    let label = input.name;
    let disabled = false;
    let type = "text";

    switch (input.name) {
      case "userName":
        input.value =
          input.value.length === 0 ? initialValues[input.name] : input.value;
        label = "Name";
        break;

      case "email":
        input.value = initialValues.email;
        label = "Email";
        disabled = true;
        break;

      case "Password":
        input.value = initialValues.password;
        disabled = true;
        type = "password";
        break;

      case "paypalEmail":
        label = "Paypal email";
        break;

      case "companyName":
        label = "Company Name";
        break;

      case "registeredNumber":
        label = "Registered number";
        break;

      case "address1":
        label = "Address 1";
        break;

      case "address2":
        label = "Address 2";
        break;

      case "city":
        label = "City";
        break;

      case "country":
        label = "Country";
        break;

      case "postcode":
        label = "Postcode";
        break;

      default:
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
    const { show } = this;
    const { asyncLoading, userData, handleSubmit } = this.props;
    const { payment } = this.state;

    const paypalEmailStyle =
      payment.option !== "bank" ? { display: "block" } : { display: "none" };

    const payBanksStyle =
      payment.option === "bank" ? { display: "block" } : { display: "none" };

    const payBanksDetailsStyle =
      payment.region !== "" ? { display: "block" } : { display: "none" };

    let perAct = show(tabs.per) ? "active" : "";
    // let orgAct = show(tabs.org) ? "active" : "";
    let comAct = show(tabs.com) ? "active" : "";
    let payAct = show(tabs.pay) ? "active" : "";
    // let notiAct = show(tabs.noti) ? "active" : "";
    let terAct = show(tabs.ter) ? "active" : "";

    return (
      <div className="page-withPanel-container" id="profile">
        <div className={`panel menu-panel`}>
          <div className="panel-title-container">
            <div>
              <span className="mb panel-title" style={{ color: "#14B9BE" }}>
                My profile
              </span>
              <span className="sst">{userData.name}</span>
            </div>
          </div>
          <div className="list-group mb">
            <div
              className={`${perAct}`}
              onClick={() => this.changeView(tabs.per)}
            >
              <span>Personal info</span>
              {perAct ? (
                <KeyboardArrowRight className="rotate90" />
              ) : (
                <KeyboardArrowDown className="rotate270" />
              )}
            </div>

            <div
              className={`${comAct}`}
              onClick={() => this.changeView(tabs.com)}
            >
              <span>Company info</span>
              {comAct ? (
                <KeyboardArrowRight className="rotate90" />
              ) : (
                <KeyboardArrowDown className="rotate270" />
              )}
            </div>

            <div
              className={`${payAct}`}
              onClick={() => this.changeView(tabs.pay)}
            >
              <span>Payments</span>
              {payAct ? (
                <KeyboardArrowRight className="rotate90" />
              ) : (
                <KeyboardArrowDown className="rotate270" />
              )}
            </div>

            {/* <div
              className={`${notiAct}`}
              onClick={() => this.changeView(tabs.noti)}
            >
              <span>Notifications</span>
              {notiAct ? (
                <KeyboardArrowRight className="rotate90" />
              ) : (
                <KeyboardArrowDown className="rotate270" />
              )}
            </div> */}
          </div>

          <div className="list-group-footer mb">
            <div
              className={`${terAct}`}
              onClick={() => this.changeView(tabs.ter)}
            >
              <span>Terms and conditions</span>
              {terAct ? (
                <KeyboardArrowRight className="rotate90" />
              ) : (
                <KeyboardArrowDown className="rotate270" />
              )}
            </div>

            <div className="delete-arrow" onClick={() => this.handleLogout()}>
              <span>Logout</span>
              <KeyboardArrowDown className="rotate270" />
            </div>
          </div>
        </div>

        <div className="page-content">
          <form className="form-top-bot-btns" onSubmit={handleSubmit(this.handleSubmit)}>
            <div className="step-title">
              <h3 className="st sc-h3">{this.state.show}</h3>
              {!terAct && (
                <button type="submit" className="mb gradient-btn">
                  Save
                </button>
              )}
            </div>

            <div className="step-content">
              {perAct && (
                <div style={{ width: "35%" }}>
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
                            <FontAwesomeIcon icon="pen" />
                          </React.Fragment>
                        )}

                        {asyncLoading && SVG.AdmixLoading({})}
                      </Dropzone>
                    </div>
                  </div>
                </div>
              )}
              <div style={{ width: perAct ? "60%" : "100%" }}>
                <div className="mb">
                  {/* PERSONAL INFORMATION */}
                  {perAct && (
                    <ExpansionPanel
                      headerIcon={
                        <ReactSVG
                          src={SVG_personalInfo}
                          className="sectionIcon"
                        />
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
                  )}

                  {/* COMPANY INFORMATION */}
                  {comAct && (
                    <ExpansionPanel
                      headerIcon={
                        <FontAwesomeIcon
                          icon="building"
                          className="sectionIcon"
                        />
                      }
                      headerTitle={"Company information"}
                    >
                      <CompanyInfo
                        renderField={this.renderField}
                        handleUserUpdate={this.handleUserUpdate}
                        {...this.state}
                        {...this.props}
                      />
                    </ExpansionPanel>
                  )}

                  {/* PAYMENT OPTIONS */}
                  {payAct && (
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
                  )}

                  {/* TERMS AND CONDITIONS */}
                  {terAct && <iframe src={pdf} frameborder="0" title="pdf" />}
                </div>
              </div>
            </div>

            <div className="bottom-download">
              {!terAct && (
                <button type="submit" className="mb gradient-btn">
                  Save
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const {
    app,
    async: { asyncMessage, asyncError, asyncLoading },
  } = state;

  const { userData } = app;
  const {
    payment: {
      paypalEmail,
      details: { bankDetails, region },
    },
    name,
    email: { value },
    company,
  } = userData;

  const initialPaymentRegion = region;

  const initialValues = {
    userName: name,
    email: value,
    password: "Click -> to change it!",
    paypalEmail: paypalEmail || "",
    ...company,
    initialPaymentRegion,
  };

  for (let bankDetail in bankDetails) {
    initialValues[bankDetail] = bankDetails[bankDetail];
  }

  return {
    ...app,
    asyncMessage,
    asyncError,
    asyncLoading,
    userData,
    reduxForm: state.form,
    initialValues,
  };
};

const validate = values => {
  const errors = {};

  return errors;
};

const formConfig = {
  form: "profileForm",
  validate,
};

Profile = reduxForm(formConfig)(Profile);
Profile = connect(mapStateToProps)(Profile);

export default Profile;
