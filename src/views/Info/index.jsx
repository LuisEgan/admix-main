import React, { Component } from "react";
import { connect } from "react-redux";
import { Field, reduxForm, change } from "redux-form";
import { routeCodes } from "../../config/routes";
import { updateApp, asyncError } from "../../actions";
import PropTypes from "prop-types";
import validate from "validate.js";

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
import SVG_tickGreen from "../../assets/svg/tick-green.svg";
import SVG_checkFail from "../../assets/svg/check-fail.svg";
import SVG_delete from "../../assets/svg/delete.svg";

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

      this.breadcrumbs = [];

      this.deleteValue = this.deleteValue.bind(this);
      this.handleUpdateInfo = this.handleUpdateInfo.bind(this);
      this.renderField = this.renderField.bind(this);
   }

   deleteValue(input) {
       const { dispatch } = this.props;
       dispatch(change('infoForm', input, ''));
   }

   handleUpdateInfo(values) {
      const { accessToken, dispatch, selectedApp } = this.props;
      let { isActive } = selectedApp;

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
   }

   renderField(field) {
      const {
         input,
         meta: { error }
      } = field;

      return (
         <div className="redux-form-inputs-container">
            {/* <Input {...input} id={input.name} icon={SVG.checkmark}/> */}

            <Input
               {...input}
               id={input.name}
               placeholder="App store URL"
               rootstyle={error ? { borderColor: "red" } : null}
               icon={
                  <ReactSVG
                     src={error ? SVG_checkFail : SVG_tickGreen}
                     className="input-icon"
                  />
               }
            />

            <ReactSVG src={SVG_delete} className="input-delete" onClick={this.deleteValue.bind(null, input.name)}/>
         </div>
      );
   }

   render() {
      const { selectedApp, handleSubmit } = this.props;

      this.breadcrumbs = [
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
         <div className="step-container mb" id="info">
            <form onSubmit={handleSubmit(this.handleUpdateInfo)}>
               <Breadcrumbs breadcrumbs={this.breadcrumbs} />
               <div id="info-header">
                  <div>
                     <div className="engine-logo">
                        {C.LOGOS[selectedApp.appEngine]}
                     </div>
                     <h3 className="st">{selectedApp.name}</h3>
                  </div>
                  <button type="submit" className="gradient-btn">
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
                              <span className="mb">Change app store URL</span>
                              <Field
                                 name="storeurl"
                                 component={this.renderField}
                              />
                           </div>
                        </ExpansionPanelDetails>
                     </ExpansionPanel>

                     {/* <ExpansionPanel
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
                     </ExpansionPanel> */}
                  </div>
               </div>
            </form>
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

const validateForm = values => {
   const errors = {};
   let { storeurl } = values;

   storeurl =
      storeurl && storeurl.indexOf("http") < 0
         ? "https://" + storeurl
         : storeurl;

   const notValid = validate({ website: storeurl }, { website: { url: true } });

   if (notValid && storeurl !== "") {
      errors.storeurl = notValid.website[0];
   }

   return errors;
};

const onSubmitFail = (errors, dispatch) => {
   const error = { message: errors.storeurl };
   dispatch(asyncError(error));
};

const formConfig = {
   form: "infoForm",
   validate: validateForm,
   onSubmitFail
};

Profile = reduxForm(formConfig)(Profile);
Profile = connect(mapStateToProps)(Profile);

export default Profile;
