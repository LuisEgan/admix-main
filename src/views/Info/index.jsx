import React, { Component } from "react";
import { connect } from "react-redux";
import { Field, reduxForm } from "redux-form";
import { updateApp } from "../../actions";
import PropTypes from "prop-types";

// Material UI
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";

import STR from "../../utils/strFuncs";

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faAngleUp from "@fortawesome/fontawesome-free-solid/faAngleUp";
import faLink from "@fortawesome/fontawesome-free-solid/faLink";
import faUsers from "@fortawesome/fontawesome-free-solid/faUsers";
import faFileAlt from "@fortawesome/fontawesome-free-solid/faFileAlt";

class Profile extends Component {
   static propTypes = {
      dispatch: PropTypes.func
   };

   constructor(props) {
      super(props);

      this.state = {};

      this.renderField = this.renderField.bind(this);
   }

   hardFocus(input) {
      this[input].focus();
   }

   hardUnfocus(input) {
      this[input].blur();
   }

   handleSubmit = e => {
      const { accessToken, dispatch, selectedApp } = this.props;
      let { isActive } = selectedApp;
      e.preventDefault();
      const {
         reduxForm: {
            infoForm: { values }
         }
      } = this.props;

      let appState;
      if (values.storeurl === "") {
         appState = "pending";
      } else {
         appState = isActive ? "active" : "inactive";
      }

      const appData = {
         platformName: selectedApp.platformName,
         name: selectedApp.name,
         appState,
         ...values
      };

      dispatch(updateApp(appData, accessToken));
   };

   renderField(field) {
      const { input } = field;

      let label;

      if (input.name === "storeurl") {
         label = "App store URL";
      }

      return (
         <div className="redux-form-inputs-container">
            <TextField
               {...input}
               id={input.name}
               label={STR.capitalizeFirstLetter(label)}
               margin="normal"
            />
         </div>
      );
   }

   render() {
      return (
         <div className="step-container" id="info">
            <div className="container simple-container">
               <h3 className="st">App Info</h3>
               <div>
                  <form onSubmit={this.handleSubmit}>
                     <div className="container">
                        {/* APP STORE URL */}

                        <ExpansionPanel
                           className="ExpansionPanel"
                           defaultExpanded={true}
                        >
                           <ExpansionPanelSummary
                              expandIcon={<FontAwesomeIcon icon={faAngleUp} />}
                           >
                              <div className="cc">
                                 <FontAwesomeIcon
                                    icon={faLink}
                                    className="sectionIcon"
                                 />
                                 <h2 className="sst">App store URL</h2>
                              </div>
                           </ExpansionPanelSummary>
                           <ExpansionPanelDetails className="mb">
                              <div className="expansionPanelDetails-container">
                                 <Field
                                    name="storeurl"
                                    component={this.renderField}
                                 />
                              </div>
                           </ExpansionPanelDetails>
                        </ExpansionPanel>

                        <br />

                        {/* CONTENT DETAIL */}

                        <ExpansionPanel
                           className="ExpansionPanel"
                           defaultExpanded={false}
                        >
                           <ExpansionPanelSummary
                              expandIcon={<FontAwesomeIcon icon={faAngleUp} />}
                           >
                              <div className="cc">
                                 <FontAwesomeIcon
                                    icon={faFileAlt}
                                    className="sectionIcon"
                                 />
                                 <h2 className="sst">Content Detail</h2>
                              </div>
                           </ExpansionPanelSummary>
                           <ExpansionPanelDetails className="mb">
                              <div className="expansionPanelDetails-container" />
                           </ExpansionPanelDetails>
                        </ExpansionPanel>

                        <br />

                        {/* AUDIENCE INSIGHTS */}

                        <ExpansionPanel
                           className="ExpansionPanel"
                           defaultExpanded={false}
                        >
                           <ExpansionPanelSummary
                              expandIcon={<FontAwesomeIcon icon={faAngleUp} />}
                           >
                              <div className="cc">
                                 <FontAwesomeIcon
                                    icon={faUsers}
                                    className="sectionIcon"
                                 />
                                 <h2 className="sst">Audience Insights</h2>
                              </div>
                           </ExpansionPanelSummary>
                           <ExpansionPanelDetails className="mb">
                              <div className="expansionPanelDetails-container" />
                           </ExpansionPanelDetails>
                        </ExpansionPanel>

                        <br />
                     </div>

                     <Button
                        variant="contained"
                        color="primary"
                        onClick={this.handleSubmit}
                        className="mb"
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
   const selectedApp = state.app.get("selectedApp");
   const { storeurl } = selectedApp;

   return {
      accessToken: state.app.get("accessToken"),
      isLoggedIn: state.app.get("isLoggedIn"),
      userImgURL: state.app.get("userImgURL"),
      asyncLoading: state.app.get("asyncLoading"),
      selectedApp,
      userData,
      reduxForm: state.form,
      initialValues: {
         storeurl
      }
   };
};

const validate = values => {
   const errors = {};
   const { password, password2 } = values;

   if (password && password !== password2) {
      errors.password2 = "Both passwords must be identical!";
   }

   return errors;
};

const formConfig = {
   form: "infoForm",
   validate
};

Profile = reduxForm(formConfig)(Profile);
Profile = connect(mapStateToProps)(Profile);

export default Profile;
