import React, { Component } from "react";
import { connect } from "react-redux";
import { Field, reduxForm } from "redux-form";
import { imgUpload, setUserImgURL, forgotPass } from "../../actions";
import PropTypes from "prop-types";
import Dropzone from "react-dropzone";
import request from "superagent";

// Material UI
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";

import STR from "../../utils/strFuncs";

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faEdit from "@fortawesome/fontawesome-free-solid/faEdit";
import faAngleUp from "@fortawesome/fontawesome-free-solid/faAngleUp";
import faUser from "@fortawesome/fontawesome-free-solid/faUser";
import faEye from "@fortawesome/fontawesome-free-solid/faEye";
import faMoneyCheckAlt from "@fortawesome/fontawesome-free-solid/faMoneyCheckAlt";

import {
   CLOUDINARY_UPLOAD_PRESET,
   CLOUDINARY_UPLOAD_URL
} from "../../config/cloudinary";

import defaultImg from "../../assets/img/default_pic.jpg";

let passhelperText;

class Profile extends Component {
   static propTypes = {
      dispatch: PropTypes.func
   };

   constructor(props) {
      super(props);

      this.state = {
         statusMssg: "",
         uploadedFile: "",
         passInputType: "password"
      };

      this.togglePassInputType = this.togglePassInputType.bind(this);
      this.renderField = this.renderField.bind(this);
      this.onImageDrop = this.onImageDrop.bind(this);
      this.handleImageUploadClient = this.handleImageUploadClient.bind(this);
      this.handleImageUploadServer = this.handleImageUploadServer.bind(this);
      this.handleUserUpdate = this.handleUserUpdate.bind(this);
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
         }
      } = this.props;
      console.log("values: ", values);
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
      const { dispatch, initialValues } = this.props;

      if (input === "password") {
         dispatch(forgotPass(initialValues.email));
      }
   }

   renderField(field) {
      const { initialValues } = this.props;
      const {
         input
         //  meta: { touched, error }
      } = field;
      //   let hasDanger = touched && error ? "has-danger" : "";
      let label = input.name;
      let helperText;
      let type = "text";

      if (input.name === "userName") {
         if (input.value.length === 0) {
            input.value = initialValues[input.name];
         }
         label = "Name";
      } else if (input.name === "email") {
         helperText = (
            <span>
               Want to change your email?
               <a onClick={this.handleUserUpdate.bind(null, "email")}>
                  {" "}
                  Click here.
               </a>
            </span>
         );
      }

      const disabled = input.name === "email";

      return (
         <div className="redux-form-inputs-container">
            <TextField
               {...input}
               id={input.name}
               label={STR.capitalizeFirstLetter(label)}
               margin="normal"
               disabled={disabled}
               helperText={helperText}
               type={type}
            />
         </div>
      );
   }

   render() {
      const { userImgURL, initialValues } = this.props;
      const { passInputType } = this.state;

      passhelperText = (
         <span>
            Want to change your password?
            <a onClick={this.handleUserUpdate.bind(null, "password")}>
               {" "}
               Click here.
            </a>
         </span>
      );

      return (
         <div className="step-container" id="profile">
            <div className="container simple-container">
               <h3 className="st">My profile</h3>
               <div>
                  <form onSubmit={this.handleSubmit}>
                     <div className="container">
                        <div id="image-drop-container">
                           <div className="image-drop">
                              <Dropzone
                                 multiple={false}
                                 accept="image/*"
                                 onDrop={this.onImageDrop}
                                 className="dropzone"
                              >
                                 <img
                                    src={userImgURL}
                                    onError={this.noUserImg}
                                    alt="+"
                                 />
                                 <FontAwesomeIcon icon={faEdit} />
                              </Dropzone>
                           </div>
                        </div>

                        <ExpansionPanel
                           defaultExpanded={true}
                           className="ExpansionPanel"
                        >
                           <ExpansionPanelSummary
                              expandIcon={<FontAwesomeIcon icon={faAngleUp} />}
                           >
                              <div className="cc">
                                 <FontAwesomeIcon
                                    icon={faUser}
                                    className="sectionIcon"
                                 />
                                 <h5 className="st">Personal Information</h5>
                              </div>
                           </ExpansionPanelSummary>
                           <ExpansionPanelDetails>
                              <div className="expansionPanelDetails-container">
                                 <Field
                                    name="userName"
                                    component={this.renderField}
                                 />
                                 <Field
                                    name="email"
                                    component={this.renderField}
                                 />
                                 <div className="redux-form-inputs-container">
                                    <TextField
                                       id="password"
                                       label="Password"
                                       margin="normal"
                                       disabled={true}
                                       helperText={passhelperText}
                                       type={passInputType}
                                       value={initialValues.password}
                                    />
                                    <FontAwesomeIcon
                                       icon={faEye}
                                       onMouseEnter={this.togglePassInputType}
                                       onMouseLeave={this.togglePassInputType}
                                       className="password-eye"
                                    />
                                 </div>
                              </div>
                           </ExpansionPanelDetails>
                        </ExpansionPanel>

                        <ExpansionPanel className="ExpansionPanel">
                           <ExpansionPanelSummary
                              expandIcon={<FontAwesomeIcon icon={faAngleUp} />}
                           >
                              <div className="cc">
                                 <FontAwesomeIcon
                                    icon={faMoneyCheckAlt}
                                    className="sectionIcon"
                                 />
                                 <h5 className="st">Payments Configuration</h5>
                              </div>
                           </ExpansionPanelSummary>
                           <ExpansionPanelDetails>
                              <div className="expansionPanelDetails-container">
                                 <Field
                                    name="userName"
                                    component={this.renderField}
                                 />
                                 <Field
                                    name="email"
                                    component={this.renderField}
                                 />
                              </div>
                           </ExpansionPanelDetails>
                        </ExpansionPanel>

                        <br />
                     </div>

                     <Button
                        variant="contained"
                        color="primary"
                        onClick={this.handleSubmit}
                     >
                        Save
                     </Button>
                  </form>
               </div>
            </div>
         </div>
      );
   }
}

const mapStateToProps = state => {
   const userData = state.app.get("userData");

   const initialValues = {
      userName: userData.name,
      email: userData.email.value,
      password: "We can't tell you the password 🤐 Click below to change it!"
   };

   return {
      accessToken: state.app.get("accessToken"),
      isLoggedIn: state.app.get("isLoggedIn"),
      userImgURL: state.app.get("userImgURL"),
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
