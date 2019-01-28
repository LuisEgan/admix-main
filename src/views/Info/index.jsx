import React, { Component } from "react";
import { connect } from "react-redux";
import { NavLink } from "react-router-dom";
import _a from "../../utils/analytics";
import { Field, reduxForm, change } from "redux-form";
import routeCodes from "../../config/routeCodes";
import actions from "../../actions";
import { setAsyncLoading } from "../../actions/asyncActions";
import PropTypes from "prop-types";
import validate from "validate.js";

import Breadcrumbs from "../../components/Breadcrumbs";
import PanelFooter from "../../components/PanelFooter";
import Input from "../../components/inputs/TextInput";
import AdmixCalculator from "../../components/AdmixCalculator";
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
  Timeline,
} from "@material-ui/icons";
// import SVG from "../../components/SVG";

const { ga } = _a;

const { updateApp } = actions;
class Info extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      show: "cal",
      deleteClicked: false,
    };

    this.expMetrics = {
      panelIcon: <Timeline className="sectionIcon" />,
      panelTitle: "Metrics",
      fields: [
        {
          title: "DAU",
          name: "dau",
        },
        {
          title: "MAU",
          name: "mau",
        },
        {
          title: "Session per users/month",
          name: "avgTimePerSession",
        },
        {
          title: "Average time per session",
          name: "sessions",
          optional: ["%"],
        },
      ],
    };

    this.expGeos = {
      panelIcon: (
        <FontAwesomeIcon icon="globe-americas" className="sectionIcon" />
      ),
      panelTitle: "Geos",
      fields: [
        {
          title: "US (%)",
          name: "us",
        },
        {
          title: "UK (%)",
          name: "uk",
        },
        {
          title: "EU (%)",
          name: "eu",
        },
        {
          title: "Rest of the world (%)",
          name: "world",
        },
      ],
    };

    this.expDemos = {
      panelIcon: <FontAwesomeIcon icon="users" className="sectionIcon" />,
      panelTitle: "Demographics",
      fields: [
        {
          title: "Male (%)",
          name: "male",
        },
        {
          title: "Female (%)",
          name: "female",
        },
        {
          title: "15 - 24",
          name: "young",
        },
        {
          title: "24 - 34",
          name: "youngMid",
        },
        {
          title: "35 - 44",
          name: "mid",
        },
        {
          title: "45 - 54",
          name: "senior",
        },
        {
          title: "55 - older",
          name: "old",
        },
      ],
    };

    this.changeView = this.changeView.bind(this);
    this.deleteValue = this.deleteValue.bind(this);
    this.handleUpdateInfo = this.handleUpdateInfo.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.show = this.show.bind(this);
    this.renderExpansionPanel = this.renderExpansionPanel.bind(this);
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
      category: ga.categories.apps,
    });

    const {
      accessToken,
      admintoken,
      dispatch,
      selectedApp,
      admixCalculatorForm,
    } = this.props;

    const appData = {
      platformName: selectedApp.platformName,
      name: selectedApp.name,
      appId: selectedApp._id,
      metrics: {
        dau: values.dau || null,
        mau: values.mau || null,
        avgTimePerSession: values.avgTimePerSession || null,
        sessions: values.session || null,
      },
      geos: {
        us: +values.us || null,
        uk: +values.uk || null,
        eu: +values.eu || null,
      },
      demographics: {
        male: values.male,
        byAge: {
          young: values.young,
          youngMid: values.youngMid,
          mid: values.mid,
          senior: values.senior,
          old: values.old,
        },
      },
      calculator: {
        ...admixCalculatorForm,
      },
      ...values,
    };

    dispatch(updateApp({ appData, accessToken, admintoken }));
  }

  handleDelete() {
    const { accessToken, admintoken, dispatch, selectedApp } = this.props;
    let { platformName, name } = selectedApp;

    const appData = {
      platformName,
      name,
      appId: selectedApp._id,
      appState: "deleted",
      isActive: false,
    };

    this.setState({ deleteClicked: true }, () => {
      dispatch(updateApp({ appData, accessToken, admintoken }));
    });
  }

  show(view) {
    const { show } = this.state;
    return show === view;
  }

  renderField(field) {
    const {
      input,
      meta: { error },
    } = field;

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
                input.value === "" ? "" : error ? SVG_checkFail : SVG_tickGreen
              }
              className="input-svg-icon"
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

  renderExpansionPanel({ panelIcon, panelTitle, fields }) {
    let {
      reduxForm: { infoForm },
    } = this.props;

    let us = 0,
      uk = 0,
      eu = 0;

    if (infoForm) {
      us = infoForm.values.us || us;
      uk = infoForm.values.uk || uk;
      eu = infoForm.values.eu || eu;
    }

    const restOfTheWorld = 100 - (+us + +uk + +eu);

    return (
      <ExpansionPanel
        defaultExpanded={panelTitle === "Metrics"}
        classes={{ root: "mui-expansionPanel-root" }}
      >
        <ExpansionPanelSummary expandIcon={<FontAwesomeIcon icon="angle-up" />}>
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

                  {field.name !== "world" && (
                    <Field name={field.name} component={this.renderField} />
                  )}

                  {field.name === "world" && <div>{restOfTheWorld}</div>}
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
    const { selectedApp, handleSubmit, calculatorInitialValues } = this.props;
    const { deleteClicked } = this.state;

    this.breadcrumbs = [
      {
        title: "My apps",
        route: routeCodes.MYAPPS,
      },
      {
        title: selectedApp.name,
        route: routeCodes.SCENE,
      },
      {
        title: "App info",
        route: routeCodes.INFO,
      },
    ];

    let urlAct = show("url") ? "active" : "";
    let audAct = show("aud") ? "active" : "";
    let delAct = show("del") ? "active" : "";
    let calAct = show("cal") ? "active" : "";

    if (deleteClicked) {
      urlAct = audAct = delAct = calAct = "inactive";
    }

    return (
      <div className="mb page-withPanel-container" id="info">
        <div className={`panel menu-panel`}>
          <div className="panel-title-container">
            <div>
              <span className="mb panel-title" style={{ color: "#14B9BE" }}>
                App info
              </span>
              <span className="sst">{selectedApp.name}</span>
            </div>
          </div>
          <div className="list-group">
            <div
              className={`${urlAct}`}
              onClick={deleteClicked ? null : this.changeView.bind(null, "url")}
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
              onClick={deleteClicked ? null : this.changeView.bind(null, "aud")}
            >
              <span>Audience breakdown</span>
              {show("aud") ? (
                <KeyboardArrowRight className="rotate90" />
              ) : (
                <KeyboardArrowDown className="rotate270" />
              )}
            </div>
            <div
              className={`${calAct}`}
              onClick={deleteClicked ? null : this.changeView.bind(null, "cal")}
            >
              <span>Revenue calculator</span>
              {show("cal") ? (
                <KeyboardArrowRight className="rotate90" />
              ) : (
                <KeyboardArrowDown className="rotate270" />
              )}
            </div>
            <div
              className={`${delAct} delete-arrow`}
              onClick={deleteClicked ? null : this.changeView.bind(null, "del")}
            >
              <span>Delete app</span>
              {show("del") ? (
                <KeyboardArrowRight className="rotate90" />
              ) : (
                <KeyboardArrowDown className="rotate270" />
              )}
            </div>
          </div>
          <PanelFooter
            app={selectedApp}
            hideInner={deleteClicked}
            {...this.props}
          />
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
              {!show("del") && (
                <div>
                  <button type="submit" className="gradient-btn">
                    {" "}
                    Save
                  </button>
                </div>
              )}
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
                  fields: this.expMetrics.fields,
                })}

                {this.renderExpansionPanel({
                  panelIcon: this.expGeos.panelIcon,
                  panelTitle: this.expGeos.panelTitle,
                  fields: this.expGeos.fields,
                })}

                {this.renderExpansionPanel({
                  panelIcon: this.expDemos.panelIcon,
                  panelTitle: this.expDemos.panelTitle,
                  fields: this.expDemos.fields,
                })}
              </div>
            )}
          </form>

          {show("cal") && (
            <div>
              <AdmixCalculator initialValues={calculatorInitialValues} />
            </div>
          )}

          {show("del") && (
            <div id="info-del">
              {!deleteClicked && (
                <React.Fragment>
                  <span className="sst" style={{ color: "red" }}>
                    Warning!
                  </span>{" "}
                  <br />
                  <br />
                  This will inactivate your app and you will not be able to
                  activate it and it will dissappear from your "My apps" menu.{" "}
                  <br />
                  <span className="mbs">
                    Note: you can re-activate it by contacting{" "}
                    <a href="mailto:support@admix.in">support@admix.in</a>
                  </span>{" "}
                  <br />
                  <br />
                  <button
                    className="gradient-btn"
                    type="button"
                    onClick={this.handleDelete}
                  >
                    Confirm
                  </button>
                </React.Fragment>
              )}

              {deleteClicked && (
                <div>
                  <NavLink
                    style={{ margin: "auto", width: "20vw" }}
                    className="gradient-btn cc"
                    to="/myapps"
                  >
                    Go back to My Apps
                  </NavLink>
                </div>
              )}
            </div>
          )}
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
  let { storeurl, metrics, geos, demographics, calculator } = app.selectedApp;
  const {
    form: { admixCalculatorForm },
  } = state;

  metrics = metrics || {};
  geos = geos || {};
  demographics = demographics || {};

  return {
    ...app,
    asyncMessage,
    asyncError,
    asyncLoading,
    reduxForm: state.form,
    initialValues: {
      storeurl,
      ...metrics,
      ...geos,
      male: demographics.male,
      ...demographics.byAge,
    },
    admixCalculatorForm: admixCalculatorForm ? admixCalculatorForm.values : {},
    calculatorInitialValues: calculator,
  };
};

const validateForm = values => {
  const errors = {};
  let { storeurl, us, uk, eu } = values;
  const numericValues = { us, uk, eu };

  storeurl =
    storeurl && storeurl.indexOf("http") < 0 ? "https://" + storeurl : storeurl;

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
  const error = errors ? { message: errors.storeurl } : {};
  dispatch(setAsyncLoading(error));
};

const formConfig = {
  form: "infoForm",
  validate: validateForm,
  onSubmitFail,
};

Info = reduxForm(formConfig)(Info);
Info = connect(mapStateToProps)(Info);

export default Info;
