import api from "../../api";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Field, reduxForm } from "redux-form";
import PropTypes from "prop-types";
import Dropzone from "react-dropzone";
import request from "superagent";

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faEdit from "@fortawesome/fontawesome-free-solid/faEdit";

import {
   CLOUDINARY_UPLOAD_PRESET,
   CLOUDINARY_UPLOAD_URL,
   CLOUDINARY_IMG_URL
} from "../../config/cloudinary";

import userImgGen from "../../assets/img/userImg.png";

class Profile extends Component {
   static propTypes = {
      dispatch: PropTypes.func
   };

   constructor(props) {
      super(props);

      this.state = {
         statusMssg: "",
         uploadedFileCloudinaryUrl: "",
         uploadedFile: "",
         userHasImg: true
      };

      this.renderField = this.renderField.bind(this);
      this.onImageDrop = this.onImageDrop.bind(this);
      this.handleImageUploadClient = this.handleImageUploadClient.bind(this);
      this.handleImageUploadServer = this.handleImageUploadServer.bind(this);
      this.noUserImg = this.noUserImg.bind(this);
   }

   componentDidMount() {
      const {
         userData: { _id }
      } = this.props;

      this.hardFocus("email");
      this.hardFocus("userName");
      this.hardUnfocus("userName");

      this.setState({
         uploadedFileCloudinaryUrl: `${CLOUDINARY_IMG_URL}/${_id}.png`
      });
   }

   hardFocus(input) {
      this[input].focus();
   }

   hardUnfocus(input) {
      this[input].blur();
   }

   handleSubmit = e => {
      e.preventDefault();
      const {
         form: {
            profileForm: { values }
         }
      } = this.props;
      console.log("values: ", values);
   };

   onImageDrop(files) {
      this.setState({
         uploadedFile: files[0]
      });

      this.handleImageUploadClient(files[0]);
   }

   handleImageUploadClient(file) {
      const {
         userData: { _id },
         updateMenuImg
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
            updateMenuImg();
            this.setState({
               uploadedFileCloudinaryUrl: `${
                  response.body.secure_url
               }?${new Date().getTime()}`,
               userHasImg: true
            });
         }
      });
   }

   handleImageUploadServer(uploadImg) {
      const { accessToken, updateMenuImg } = this.props;

      api
         .cloudinayImgUpload(accessToken, uploadImg)
         .then(data => {
            console.log("data: ", data);
            if (data.body.secure_url !== "") {
               updateMenuImg();
               this.setState({
                  uploadedFileCloudinaryUrl: `${
                     data.body.secure_url
                  }?${new Date().getTime()}`,
                  userHasImg: true
               });
            }
         })
         .catch(error => {
            console.log("error: ", error);
         });
   }

   noUserImg(e) {
      e.target.src = userImgGen;
      this.setState({ userHasImg: false });
   }

   renderField(field) {
      const { initialValues } = this.props;
      const {
         label,
         input,
         meta: { touched, error }
      } = field;
      let hasDanger = touched && error ? "has-danger" : "";

      if (input.name === "userName" || input.name === "email") {
         if (input.value.length === 0) {
            input.value = initialValues[input.name];
         }
      }

      return (
         <div className={`form-group ${hasDanger}`}>
            <label>{label}</label>
            <input
               className="form-control"
               type="text"
               {...input}
               ref={i => (this[input.name] = i)}
            />
            {touched && <div className="text-help slideInLeft">{error}</div>}
         </div>
      );
   }

   render() {
      const { statusMssg, uploadedFileCloudinaryUrl, userHasImg } = this.state;

      const userImgStyle = userHasImg ? { padding: "5%" } : { padding: "15%" };

      return (
         <div className="step-container" id="profile">
            <form onSubmit={this.handleSubmit}>
               <div className="container">
                  <div>
                     <h3 className="st">My profile</h3>
                  </div>
                  <div>
                     <div className="mb">Profile picture</div>
                     <div className="image-drop">
                        <Dropzone
                           multiple={false}
                           accept="image/*"
                           onDrop={this.onImageDrop}
                           className="dropzone"
                        >
                           <img
                              src={uploadedFileCloudinaryUrl}
                              onError={this.noUserImg}
                              alt="+"
                              style={userImgStyle}
                           />
                           <FontAwesomeIcon icon={faEdit} />
                        </Dropzone>
                     </div>
                  </div>

                  <div>
                     <div className="mb">Name</div>
                     <div>
                        <Field name="userName" component={this.renderField} />
                     </div>
                  </div>
                  <div>
                     <div className="mb">Email</div>
                     <div>
                        <Field name="email" component={this.renderField} />
                     </div>
                  </div>
                  <br />
                  <br />
                  <div>
                     <div className="mb">New password</div>
                     <div>
                        <Field name="password" component={this.renderField} />
                     </div>
                  </div>
                  <div>
                     <div className="mb">Repeat new password</div>
                     <div>
                        <Field name="password2" component={this.renderField} />
                     </div>
                  </div>
                  <div>
                     <span className="mb">{statusMssg}</span>
                  </div>
                  <div>
                     <button className="btn btn-black">Save</button>
                  </div>
               </div>
            </form>
         </div>
      );
   }
}

const mapStateToProps = state => {
   const userData = state.app.get("userData");

   const initialValues = {
      userName: userData.name,
      email: userData.email.value
   };

   return {
      accessToken: state.app.get("accessToken"),
      isLoggedIn: state.app.get("isLoggedIn"),
      userData,
      form: state.form,
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

Profile = connect(mapStateToProps)(Profile);
Profile = reduxForm(formConfig)(Profile);

export default Profile;
