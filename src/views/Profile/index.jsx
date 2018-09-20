import React, { Component } from "react";
import { connect } from "react-redux";
import { Field, reduxForm, reset, change } from "redux-form";
import {
   imgUpload,
   setUserImgURL,
   forgotPass,
   updateUser,
   changeEmail,
   logout
} from "../../actions";
import PropTypes from "prop-types";
import Dropzone from "react-dropzone";
import request from "superagent";

// Material UI
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import Select from "@material-ui/core/Select";
import Input from "@material-ui/core/Input";

import CustomInput from "../../components/Input";
import STR from "../../utils/strFuncs";

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faEdit from "@fortawesome/fontawesome-free-solid/faEdit";
import faAngleUp from "@fortawesome/fontawesome-free-solid/faAngleUp";
import faUser from "@fortawesome/fontawesome-free-solid/faUser";
import faEye from "@fortawesome/fontawesome-free-solid/faEye";
import faMoneyCheckAlt from "@fortawesome/fontawesome-free-solid/faMoneyCheckAlt";
import faUniversity from "@fortawesome/fontawesome-free-solid/faUniversity";

import AdmixLoading from "../../components/SVG/AdmixLoading";

import BankDetails from "./BankDetails";

import {
   CLOUDINARY_UPLOAD_PRESET,
   CLOUDINARY_UPLOAD_URL
} from "../../config/cloudinary";

import defaultImg from "../../assets/img/default_pic.jpg";
import paypal from "../../assets/img/paypal.png";
import SVG from "../../components/SVG";

let passhelperText;

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
         isWarningVisible: false,
         payment: {
            option: payment.option ? payment.option : "",
            region: payment.details.region ? payment.details.region : "",
            details: payment.details.bankDetails
               ? payment.details.bankDetails
               : {}
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
         }
      }

      dispatch(updateUser(userData._id, update, accessToken));
   };

   onImageDrop(files) {
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
      const { dispatch, initialValues, accessToken } = this.props;

      if (input === "password") {
         dispatch(forgotPass(initialValues.email));
         this.setState({ clicked: "password" });
      } else if (input === "email") {
         setTimeout(() => {
            dispatch(logout());
         }, 3000);
         dispatch(changeEmail(initialValues.email, accessToken));
         this.setState({ clicked: "email" });
      }
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

      if (input.name === "userName") {
         if (input.value.length === 0) {
            input.value = initialValues[input.name];
         }
         label = "Name";
      } else if (input.name === "email") {
         input.value = initialValues.email;
         label = "Email";
      }

      return (
         <div>
            <span className="input-label">{label}</span>
            <CustomInput {...input} className="mb" id={input.name} />
         </div>
      );
   }

   render() {
      const { initialValues, asyncLoading, userData } = this.props;
      const { passInputType, clicked, isWarningVisible, payment } = this.state;

      const payBanksStyle =
         payment.option === "bank" ? { display: "block" } : { display: "none" };

      const payBanksDetailsStyle =
         payment.region !== "" ? { display: "block" } : { display: "none" };

      const warningStyle = isWarningVisible
         ? { color: "red", opacity: 1 }
         : { color: "red", opacity: 0 };

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
                                       onError={e =>
                                          (e.target.src = defaultImg)
                                       }
                                       alt="+"
                                    />
                                    {/* {SVG.edit} */}
                                    <FontAwesomeIcon
                                       className="fa"
                                       icon={faEdit}
                                    />
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
                           className="ExpansionPanel"
                           defaultExpanded={true}
                           classes={{ root: "mui-expansionPanel-root" }}
                        >
                           <ExpansionPanelSummary
                              expandIcon={<FontAwesomeIcon icon={faAngleUp} />}
                           >
                              <div className="cc">
                                 <FontAwesomeIcon
                                    icon={faUser}
                                    className="sectionIcon"
                                 />
                                 <h2 className="sst">Personal Information</h2>
                              </div>
                           </ExpansionPanelSummary>
                           <ExpansionPanelDetails>
                              <div className="expansionPanelDetails-container">
                                 <div>
                                    <Field
                                       name="userName"
                                       component={this.renderField}
                                    />
                                    <Field
                                       name="email"
                                       component={this.renderField}
                                       asyncLoading={asyncLoading}
                                       isWarningVisible={isWarningVisible}
                                    />
                                    <div>
                                       <TextField
                                          id="password"
                                          label="Password"
                                          margin="normal"
                                          disabled={true}
                                          // helperText={passhelperText}
                                          type={passInputType}
                                          value={initialValues.password}
                                          readOnly={true}
                                       />
                                       <FontAwesomeIcon
                                          icon={faEye}
                                          onMouseEnter={
                                             this.togglePassInputType
                                          }
                                          onMouseLeave={
                                             this.togglePassInputType
                                          }
                                          className="password-eye"
                                       />
                                    </div>
                                 </div>
                                 <div>
                                    <div />
                                    <div>
                                       <span className="profile-helper-text">
                                          Want to change your email?
                                          <a
                                             onClick={this.handleUserUpdate.bind(
                                                null,
                                                "email"
                                             )}
                                             onMouseEnter={() => {
                                                this.setState({
                                                   isWarningVisible: true
                                                });
                                             }}
                                             onMouseLeave={() => {
                                                this.setState({
                                                   isWarningVisible: false
                                                });
                                             }}
                                          >
                                             {asyncLoading &&
                                             clicked === "email"
                                                ? " ...Loading"
                                                : " Click here."}
                                          </a>
                                          <span style={warningStyle}>
                                             &nbsp;Warning! Your account will
                                             become inactive and you will have
                                             to verify your new email before
                                             logging in again (this will log you
                                             out).
                                          </span>
                                       </span>
                                    </div>
                                    <div>
                                       <span className="profile-helper-text">
                                          Want to change your password?
                                          <a
                                             onClick={this.handleUserUpdate.bind(
                                                null,
                                                "password"
                                             )}
                                          >
                                             {asyncLoading &&
                                             clicked === "password"
                                                ? " ...Loading"
                                                : " Click here."}
                                          </a>
                                       </span>
                                    </div>
                                 </div>
                              </div>
                           </ExpansionPanelDetails>
                        </ExpansionPanel>

                        {/* PAYMENT OPTIONS */}

                        <ExpansionPanel
                           className="ExpansionPanel"
                           defaultExpanded={false}
                           classes={{ root: "mui-expansionPanel-root" }}
                        >
                           <ExpansionPanelSummary
                              expandIcon={<FontAwesomeIcon icon={faAngleUp} />}
                           >
                              <div className="cc">
                                 <FontAwesomeIcon
                                    icon={faMoneyCheckAlt}
                                    className="sectionIcon"
                                 />
                                 <h2 className="sst">Payments Configuration</h2>
                              </div>
                           </ExpansionPanelSummary>
                           <ExpansionPanelDetails>
                              <div className="expansionPanelDetails-container">
                                 <FormControl component="fieldset" required>
                                    <RadioGroup
                                       aria-label="paymentOpts"
                                       name="paymentOpts"
                                       value={payment.option}
                                       onChange={this.paymentChange.bind(
                                          null,
                                          "option"
                                       )}
                                       className="paymentOpts"
                                    >
                                       <FormControlLabel
                                          value="paypal"
                                          control={<Radio />}
                                          label={
                                             <img src={paypal} alt="paypal" />
                                          }
                                       />
                                       <FormControlLabel
                                          value="bank"
                                          control={<Radio />}
                                          label={
                                             <React.Fragment>
                                                <FontAwesomeIcon
                                                   icon={faUniversity}
                                                />{" "}
                                                Bank
                                             </React.Fragment>
                                          }
                                       />
                                    </RadioGroup>
                                 </FormControl>

                                 <div
                                    id="profile-pay-banks"
                                    style={payBanksStyle}
                                    className="fadeIn mb"
                                 >
                                    <FormControl>
                                       <div className="input-title mb">
                                          Region
                                       </div>
                                       <Select
                                          value={payment.region}
                                          onChange={this.paymentChange.bind(
                                             null,
                                             "region"
                                          )}
                                          input={
                                             <Input
                                                name="region"
                                                id="region-helper"
                                             />
                                          }
                                          classes={{ root: "mui-select-root" }}
                                          disableUnderline={true}
                                       >
                                          <MenuItem value="">
                                             <em>Please select a region</em>
                                          </MenuItem>
                                          <MenuItem value="usa">
                                             United States of America
                                          </MenuItem>
                                          <MenuItem value="uk">
                                             Uniter Kingdom
                                          </MenuItem>
                                          <MenuItem value="eu">Europe</MenuItem>
                                       </Select>
                                       <FormHelperText>
                                          Don't see your country yet? You can
                                          always use PayPal in the meantime{" "}
                                          <span
                                             role="img"
                                             aria-label="thumbs-up"
                                          >
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
                                             renderField={this.renderField}
                                             region={payment.region}
                                          />
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </ExpansionPanelDetails>
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

const mapStateToProps = state => {
   const userData = state.app.get("userData");
   const {
      payment: {
         details: { bankDetails, region }
      }
   } = userData;

   const initialPaymentRegion = region;

   const initialValues = {
      userName: userData.name,
      email: userData.email.value,
      password: "We can't tell you the password 🤐 Click below to change it!",
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
