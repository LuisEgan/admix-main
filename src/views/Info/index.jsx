import React, { Component } from "react";
import { connect } from "react-redux";
import { NavLink } from "react-router-dom";
import _a from "../../utils/analytics";
import { reduxForm, change } from "redux-form";
import routeCodes from "../../config/routeCodes";
import actions from "../../actions";
import PropTypes from "prop-types";
import validate from "validate.js";
import FormTextInput from "../../components/formInputs/FormTextInput";
import isEqual from "lodash/isEqual";

import Breadcrumbs from "../../components/Breadcrumbs";
import PanelFooter from "../../components/PanelFooter";
import AdmixCalculator from "../../components/AdmixCalculator";
import ReactSVG from "react-svg";

// Material UI
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";

import C from "../../utils/constants";
import { onlyNums } from "../../utils/normalizers";

import SVG_delete from "../../assets/svg/delete.svg";

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import {
  KeyboardArrowDown,
  KeyboardArrowRight,
  Timeline,
} from "@material-ui/icons";
import GuideBox from "../../components/GuideBox";
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
      show: "url",
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
  }

  componentDidUpdate(prevProps, prevState) {
    const { initialize, initialValues } = this.props;

    if (!isEqual(initialValues, prevProps.initialValues)) {
      initialize({ ...initialValues });
    }
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
      selectedApp: { platformName, name, _id },
      admixCalculatorForm,
    } = this.props;

    const appData = {
      platformName: platformName,
      name: name,
      appId: _id,
      metrics: {
        dau: values.dau || null,
        mau: values.mau || null,
        avgTimePerSession: values.avgTimePerSession || null,
        sessions: values.sessions || null,
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
      ...values,
    };

    Object.keys(admixCalculatorForm).length > 0 &&
      (appData.calculator = { ...admixCalculatorForm });

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

  renderExpansionPanel({ panelIcon, panelTitle, fields }) {
    let {
      reduxForm: { infoForm },
    } = this.props;

    let us = 0,
      uk = 0,
      eu = 0,
      male = 0;

    if (infoForm) {
      us = infoForm.values.us || us;
      uk = infoForm.values.uk || uk;
      eu = infoForm.values.eu || eu;
      male = infoForm.values.male || male;
    }

    const restOfTheWorld = 100 - (+us + +uk + +eu);
    const femDem = 100 - male;

    let normalizer;

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
              normalizer = field.name === "male" ? onlyNums : null;
              return (
                <div key={field.name}>
                  {field.name !== "world" && field.name !== "female" && (
                    <FormTextInput
                      name={field.name}
                      label={field.title}
                      normalize={normalizer}
                      icon={
                        <ReactSVG
                          src={SVG_delete}
                          className="input-delete"
                          onClick={this.deleteValue.bind(null, field.name)}
                        />
                      }
                    />
                  )}

                  {field.name === "world" && (
                    <FormTextInput
                      name={field.name}
                      label={field.title}
                      value={restOfTheWorld}
                    />
                  )}

                  {field.name === "female" && (
                    <FormTextInput
                      name={field.name}
                      label={field.title}
                      value={femDem}
                    />
                  )}
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
              <React.Fragment>
                <GuideBox text="To go Live and start generating revenue, your app needs to be published in a Store. Add the store URL in the field below." />
                <div id="info-url">
                  <FormTextInput
                    name="storeurl"
                    label="App store URL"
                    icon={
                      <ReactSVG
                        src={SVG_delete}
                        className="input-delete"
                        onClick={this.deleteValue.bind(null, "storeurl")}
                      />
                    }
                    placeholder="Eg: https://play.google.com/store/apps/details?id=com.your.app.here"
                  />
                </div>
              </React.Fragment>
            )}

            {show("aud") && (
              <React.Fragment>
                <GuideBox text="Please fill as much information on your app as possible to help us maximise your revenue. This data helps us forecast the amount of inventory your app will generate and prioritise it with our advertisers." />
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
              </React.Fragment>
            )}
          </form>

          {show("cal") && (
            <React.Fragment>
              <GuideBox text="Complete the fields below to project how much revenue your app can make. Figures are for indication only and can vary based on our fill rate and the location of your users." />
              <div>
                <AdmixCalculator initialValues={calculatorInitialValues} />
              </div>
            </React.Fragment>
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
                  This will deactivate your app and it will disappear from the
                  "My apps" menu. Are you sure you want to continue? <br />
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
                    Confirm deletion
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
  let { storeurl, us, uk, eu, female } = values;
  const numericValues = { us, uk, eu, female };

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

const formConfig = {
  form: "infoForm",
  validate: validateForm,
};

Info = reduxForm(formConfig)(Info);
Info = connect(mapStateToProps)(Info);

export default Info;
