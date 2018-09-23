import React, { Component } from "react";
import { connect } from "react-redux";
import { Field, reduxForm } from "redux-form";
import { routeCodes } from "../../config/routes";
import { updateApp } from "../../actions";
import PropTypes from "prop-types";
import Breadcrumbs from "../../components/Breadcrumbs";
import Input from "../../components/Input";
import ReactSVG from "react-svg";

// Material UI
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";

import C from "../../utils/constants";

import SVG_content from "../../assets/svg/content-detail.svg";
import SVG_audience from "../../assets/svg/audience-insights.svg";

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faAngleUp from "@fortawesome/fontawesome-free-solid/faAngleUp";
import faLink from "@fortawesome/fontawesome-free-solid/faLink";
import faUsers from "@fortawesome/fontawesome-free-solid/faUsers";
import faFileAlt from "@fortawesome/fontawesome-free-solid/faFileAlt";
// import SVG from "../../components/SVG";

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
         appState = isActive ? C.APP_STATES.pending : C.APP_STATES.inactive;
      } else {
         appState = isActive ? C.APP_STATES.live : C.APP_STATES.inactive;
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

      return (
         <div className="redux-form-inputs-container">
            {/* <Input {...input} id={input.name} icon={SVG.checkmark}/> */}
            <Input {...input} id={input.name} placeholder="App store URL" />
         </div>
      );
   }

   render() {
      const { selectedApp } = this.props;

      const breadcrumbs = [
         {
            title: "My apps",
            route: routeCodes.MYAPPS
         },
         {
            title: selectedApp.name,
            route: routeCodes.SCENE
         },
         {
            title: "App info",
            route: routeCodes.INFO
         }
      ];

      return (
         <div className="step-container" id="info">
            <div className="container simple-container mb">
               <form onSubmit={this.handleSubmit}>
                  <Breadcrumbs breadcrumbs={breadcrumbs} />
                  <div id="info-header">
                     <div>
                        <div className="engine-logo">
                           {C.LOGOS[selectedApp.appEngine]}
                        </div>
                        <h3 className="st">{selectedApp.name}</h3>
                     </div>
                     <button
                        className="gradient-btn"
                        onClick={this.handleSubmit}
                     >
                        {" "}
                        Save
                     </button>
                  </div>
                  <div>
                     <div className="container">
                        {/* APP STORE URL */}

                        <ExpansionPanel
                           classes={{ root: "mui-expansionPanel-root" }}
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
                                 <span>App store URL</span>
                              </div>
                           </ExpansionPanelSummary>
                           <ExpansionPanelDetails className="mb">
                              <div className="expansionPanelDetails-container">
                                 <span className="mb">
                                    Change app store URL
                                 </span>
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
                           classes={{ root: "mui-expansionPanel-root" }}
                           defaultExpanded={false}
                        >
                           <ExpansionPanelSummary
                              expandIcon={<FontAwesomeIcon icon={faAngleUp} />}
                           >
                              <div className="cc">
                                 <ReactSVG
                                    src={SVG_content}
                                    className="sectionIcon"
                                 />
                                 <span>Content Detail</span>
                              </div>
                           </ExpansionPanelSummary>
                           <ExpansionPanelDetails className="mb">
                              <div className="expansionPanelDetails-container" />
                           </ExpansionPanelDetails>
                        </ExpansionPanel>

                        <br />

                        {/* AUDIENCE INSIGHTS */}

                        <ExpansionPanel
                           classes={{ root: "mui-expansionPanel-root" }}
                           defaultExpanded={false}
                        >
                           <ExpansionPanelSummary
                              expandIcon={<FontAwesomeIcon icon={faAngleUp} />}
                           >
                              <div className="cc">
                                 <ReactSVG
                                    src={SVG_audience}
                                    className="sectionIcon"
                                 />
                                 <span>Audience Insights</span>
                              </div>
                           </ExpansionPanelSummary>
                           <ExpansionPanelDetails className="mb">
                              <div className="expansionPanelDetails-container" />
                           </ExpansionPanelDetails>
                        </ExpansionPanel>

                        <br />
                     </div>
                  </div>
               </form>
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
