import React, { Component } from "react";
import { connect } from "react-redux";
import _a from "../../utils/analytics";
import { Field, reduxForm, change } from "redux-form";
import routeCodes from "../../config/routeCodes";
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

import SVG_tickGreen from "../../assets/svg/tick-green.svg";
import SVG_checkFail from "../../assets/svg/check-fail.svg";
import SVG_delete from "../../assets/svg/delete.svg";

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import {
   KeyboardArrowDown,
   KeyboardArrowRight,
   Timeline
} from "@material-ui/icons";
// import SVG from "../../components/SVG";

const { ga } = _a;

class Profile extends Component {
   static propTypes = {
      dispatch: PropTypes.func
   };

   constructor(props) {
      super(props);

      this.state = {
         show: "aud"
      };

      this.breadcrumbs = [];

      this.expMetrics = {
         panelIcon: <Timeline className="sectionIcon" />,
         panelTitle: "Metrics",
         fields: [
            {
               title: "DAU",
               name: "dau"
            },
            {
               title: "MAU",
               name: "mau"
            },
            {
               title: "Session per users/month",
               name: "avgTimePerSession"
            },
            {
               title: "Average time per session",
               name: "sessions",
               optional: ["%"]
            }
         ]
      };

      this.expGeos = {
         panelIcon: (
            <FontAwesomeIcon icon="globe-americas" className="sectionIcon" />
         ),
         panelTitle: "Geos",
         fields: [
            {
               title: "US (%)",
               name: "us"
            },
            {
               title: "UK (%)",
               name: "uk"
            },
            {
               title: "EU (%)",
               name: "eu"
            },
            {
               title: "Rest of the world",
               name: "world"
            }
         ]
      };

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
         metrics: {
            dau: values.dau || null,
            mau: values.mau || null,
            avgTimePerSession: values.avgTimePerSession || null,
            sessions: values.session || null
         },
         geos: {
            us: +values.us || null,
            uk: +values.uk || null,
            eu: +values.eu || null
         },
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

      const {
         reduxForm: { infoForm }
      } = this.props;

      let us, uk, eu;

      console.warn("us: ", us);
      console.warn("uk: ", uk);
      console.warn("eu: ", eu);

      if (infoForm) {
         us = infoForm.values.us || us;
         uk = infoForm.values.uk || uk;
         eu = infoForm.values.eu || eu;
      }
      console.log("us: ", us);
      console.log("uk: ", uk);
      console.log("eu: ", eu);

      let customValue = undefined;

      if (input.name === "world") {
         customValue = +us + +uk + +eu;
         console.warn("customValue: ", customValue);
      }

      return (
         <div className="redux-form-inputs-container">
            <Input
               {...input}
               id={input.name}
               //    placeholder="App store URL"
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
                     className="input-svg-icon"
                  />
               }
               value={customValue || input.value}
            />

            <ReactSVG
               src={SVG_delete}
               className="input-delete"
               onClick={this.deleteValue.bind(null, input.name)}
            />
         </div>
      );
   }

   renderExpansionPanel({ panelIcon, panelTitle, fields }) {
      return (
         <ExpansionPanel
            defaultExpanded={panelTitle === "Geos"}
            classes={{ root: "mui-expansionPanel-root" }}
         >
            <ExpansionPanelSummary
               expandIcon={<FontAwesomeIcon icon="angle-up" />}
            >
               <div className="cc">
                  {panelIcon}
                  <span>{panelTitle}</span>
               </div>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
               <div className="expansionPanelDetails-container">
                  {fields.map(field => {
                     return (
                        <div key={field.name}>
                           <span>{field.title}</span>
                           <Field
                              name={field.name}
                              component={this.renderField}
                           />
                        </div>
                     );
                  })}
               </div>
            </ExpansionPanelDetails>
         </ExpansionPanel>
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
                        <span>App store URL</span>
                        <Field name="storeurl" component={this.renderField} />
                     </div>
                  )}

                  {show("aud") && (
                     <div id="info-aud">
                        {this.renderExpansionPanel({
                           panelIcon: this.expMetrics.panelIcon,
                           panelTitle: this.expMetrics.panelTitle,
                           fields: this.expMetrics.fields
                        })}

                        {this.renderExpansionPanel({
                           panelIcon: this.expGeos.panelIcon,
                           panelTitle: this.expGeos.panelTitle,
                           fields: this.expGeos.fields
                        })}
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
   const { storeurl, metrics, geos, demographics } = selectedApp;

   return {
      accessToken: state.app.get("accessToken"),
      isLoggedIn: state.app.get("isLoggedIn"),
      userImgURL: state.app.get("userImgURL"),
      asyncLoading: state.app.get("asyncLoading"),
      selectedApp,
      userData,
      reduxForm: state.form,
      initialValues: {
         storeurl,
         ...metrics,
         ...geos,
         ...demographics
      }
   };
};

const validateForm = values => {
   const errors = {};
   let { storeurl, us, uk, eu } = values;
   const numericValues = { us, uk, eu };

   storeurl =
      storeurl && storeurl.indexOf("http") < 0
         ? "https://" + storeurl
         : storeurl;

   const notValid = validate({ website: storeurl }, { website: { url: true } });

   if (notValid && storeurl !== "") {
      errors.storeurl = notValid.website[0];
   }

   let isNumber;

   for (let numericInputName in numericValues) {
      isNumber = /^\d+$/.test(numericValues[numericInputName]);
      if (numericValues[numericInputName] && !isNumber) {
         errors[numericInputName] = "Should be a number!";
      }
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
