import React, { Component } from "react";
import { connect } from "react-redux";
import _a from "../../utils/analytics";
import { Field, reduxForm, change } from "redux-form";
import routeCodes from "../../config/routeCodes";
import { updateApp, asyncError } from "../../actions";
import PropTypes from "prop-types";
import validate from "validate.js";
import ToggleDisplay from "react-toggle-display";

import Breadcrumbs from "../../components/Breadcrumbs";
import Input from "../../components/Input";
import ReactSVG from "react-svg";

// Material UI
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";

import C from "../../utils/constants";

import SVG_tickGreen from "../../assets/svg/tick-green.svg";
import SVG_checkFail from "../../assets/svg/check-fail.svg";
import SVG_delete from "../../assets/svg/delete.svg";

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faAngleUp from "@fortawesome/fontawesome-free-solid/faAngleUp";
import faLink from "@fortawesome/fontawesome-free-solid/faLink";
import { KeyboardArrowDown, KeyboardArrowRight } from "@material-ui/icons";
// import SVG from "../../components/SVG";

const { ga } = _a;

class Profile extends Component {
   static propTypes = {
      dispatch: PropTypes.func
   };

   constructor(props) {
      super(props);

      this.state = {
         show: "url"
      };

      this.breadcrumbs = [];

      this.changeView = this.changeView.bind(this);
      this.deleteValue = this.deleteValue.bind(this);
      this.handleUpdateInfo = this.handleUpdateInfo.bind(this);
      this.show = this.show.bind(this);
      this.renderField = this.renderField.bind(this);
   }

   changeView(view) {
      this.setState({ show: view });
   }

   deleteValue(input) {
      const { dispatch } = this.props;
      dispatch(change("infoForm", input, ""));
   }

   handleUpdateInfo(values) {
      _a.track(ga.actions.apps.modifyStoreUrl, {
         category: ga.categories.apps
      });

      const { accessToken, admintoken, dispatch, selectedApp } = this.props;
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
         appId: selectedApp._id,
         ...values
      };

      dispatch(updateApp({ appData, accessToken, admintoken }));
   }

   show(view) {
      const { show } = this.state;
      return show === view;
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
                     src={
                        input.value === ""
                           ? ""
                           : error
                              ? SVG_checkFail
                              : SVG_tickGreen
                     }
                     className="input-icon"
                  />
               }
            />

            <ReactSVG
               src={SVG_delete}
               className="input-delete"
               onClick={this.deleteValue.bind(null, input.name)}
            />
         </div>
      );
   }

   render() {
      const { show } = this;
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

      const urlAct = show("url") ? "active" : "";
      const audAct = show("aud") ? "active" : "";

      return (
         <div className="mb page-withPanel-container" id="info">
            <div className={`panel menu-panel`}>
               <div className="panel-title-container">
                  <div>
                     <span
                        className="mb panel-title"
                        style={{ color: "#14B9BE" }}
                     >
                        App info
                     </span>
                     <span className="sst">{selectedApp.name}</span>
                  </div>
               </div>
               <div className="list-group">
                  <div
                     className={`${urlAct}`}
                     onClick={this.changeView.bind(null, "url")}
                  >
                     <span>App store URL</span>
                     {show("url") ? (
                        <KeyboardArrowRight className="rotate90" />
                     ) : (
                        <KeyboardArrowDown className="rotate270" />
                     )}
                  </div>
                  <div
                     className={`${audAct}`}
                     onClick={this.changeView.bind(null, "aud")}
                  >
                     <span>Audience breakdown</span>
                     {show("aud") ? (
                        <KeyboardArrowRight className="rotate90" />
                     ) : (
                        <KeyboardArrowDown className="rotate270" />
                     )}
                  </div>
               </div>
            </div>

            <div className="page-content">
               <form onSubmit={handleSubmit(this.handleUpdateInfo)}>
                  <Breadcrumbs breadcrumbs={this.breadcrumbs} />
                  <div id="info-header">
                     <div className="engine-logo">
                        {C.LOGOS[selectedApp.appEngine]}
                     </div>
                     <div>
                        <h3 className="st">{selectedApp.name}</h3>
                     </div>
                     <div>
                        <button type="submit" className="gradient-btn">
                           {" "}
                           Save
                        </button>
                     </div>
                  </div>

                  {show("url") && (
                     <div id="info-url">
                        <div>
                           <span>App store URL</span>
                           <div className="expansionPanelDetails-container">
                              <span>Change app store URL</span>
                              <Field
                                 name="storeurl"
                                 component={this.renderField}
                              />
                           </div>
                        </div>
                     </div>
                  )}

                  {show("aud") && (
                        <div id="info-aud">
                        </div>
                  )}
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
