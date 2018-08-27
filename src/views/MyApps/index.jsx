import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect, NavLink } from "react-router-dom";
import { routeCodes } from "../../config/routes";
import PropTypes from "prop-types";
import {
   getApps,
   getUserData,
   selectApp,
   toggleAppStatus,
   getReportData,
   setInitialReportApp,
   resetSavedInputs,
   resetSelectedApp,
   setUserImgURL,
   setAppsFilterBy
} from "../../actions";
import C from "../../utils/constants";
import STR from "../../utils/strFuncs";
import { CLOUDINARY_IMG_URL } from "../../config/cloudinary";

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faGlobe from "@fortawesome/fontawesome-free-solid/faGlobe";
import faSearchPlus from "@fortawesome/fontawesome-free-solid/faSearchPlus";
import faPlus from "@fortawesome/fontawesome-free-solid/faPlus";
import faMinus from "@fortawesome/fontawesome-free-solid/faMinus";

import AdmixLoading from "../../components/SVG/AdmixLoading";

import admix from "../../assets/img/default_pic.jpg";

// @connect(state => ({
//   apps: state.app.get("apps"),
//   selectedApp: state.app.get("selectedApp"),
//   accessToken: state.app.get("accessToken"),
//   asyncLoading: state.app.get("asyncLoading"),
//   userData: state.app.get("userData")
// }))
class MyApps extends Component {
   static propTypes = {
      apps: PropTypes.array,
      accessToken: PropTypes.string,
      asyncLoading: PropTypes.bool,
      userData: PropTypes.object,
      dispatch: PropTypes.func
   };

   constructor(props) {
      super(props);

      this.state = {
         showContent: false,
         appSelected: false,
         activeApps: [],
         redirect: "",
         allAppsIds: [],

         //filter

         filterBy: [],
         showFilter: true,
         userUsedFilter: false
      };

      this.showContent = this.showContent.bind(this);
      this.selectApp = this.selectApp.bind(this);
      this.getReportData = this.getReportData.bind(this);
      this.handleOnSwitch = this.handleOnSwitch.bind(this);
      this.toggleEditInfoBox = this.toggleEditInfoBox.bind(this);
      this.hideEditInfoBox = this.hideEditInfoBox.bind(this);
      this.showEditInfoBox = this.showEditInfoBox.bind(this);
      this.renderNoApps = this.renderNoApps.bind(this);

      //filter
      this.toggleFilter = this.toggleFilter.bind(this);
      this.addFilter = this.addFilter.bind(this);
      this.deleteFilter = this.deleteFilter.bind(this);
      this.setFilter = this.setFilter.bind(this);
   }

   componentDidMount() {
      let {
         apps,
         dispatch,
         accessToken,
         adminToken,
         userData,
         appsFilterBy
      } = this.props;
      apps = Array.isArray(apps) ? apps : [];
      const activeApps = [];
      apps.forEach(app => {
         const { _id, isActive } = app;
         isActive && activeApps.push(_id);
      });

      const allAppsIds = apps.map(app => app._id);
      this.setState({ allAppsIds, activeApps, filterBy: appsFilterBy || [] });

      (!appsFilterBy || appsFilterBy.length === 0) &&
         dispatch(getApps({ accessToken, adminToken }));
      dispatch(resetSelectedApp());
      dispatch(getUserData(accessToken));
      dispatch(setUserImgURL(CLOUDINARY_IMG_URL + userData._id + ".png"));
      dispatch(resetSavedInputs());
      this.showContent();
   }

   static getDerivedStateFromProps(nextProps, prevState) {
      let { apps } = nextProps;
      apps = Array.isArray(apps) ? apps : [];
      const activeApps = [];
      apps.forEach(app => {
         const { _id, isActive } = app;
         isActive && activeApps.push(_id);
      });

      const allAppsIds = apps.map(app => app._id);
      return { allAppsIds, activeApps };
   }

   showContent() {
      const { asyncLoading, userData } = this.props;
      setTimeout(() => {
         if (!asyncLoading && userData._id) {
            this.setState({ showContent: true });
         } else {
            this.showContent();
         }
      }, 500);
   }

   handleOnSwitch(app, e) {
      const { dispatch, accessToken } = this.props;

      let { _id, platformName, name, isActive, appState, storeurl } = app;
      appState = isActive ? C.APP_STATES.inactive : C.APP_STATES.live;

      if (storeurl !== undefined && appState !== undefined) {
         if (!isActive && storeurl === "") {
            appState = C.APP_STATES.pending;
         }
      }

      const appDetails = {
         _id,
         platformName,
         name,
         isActive: !isActive,
         appState
      };
      dispatch(toggleAppStatus(appDetails, accessToken));
   }

   toggleEditInfoBox(appId) {
      const { activeApps } = this.state;
      const { display } = this[appId].style;

      if (activeApps.indexOf(appId) >= 0) {
         this[appId].style.display = display !== "none" ? "none" : "block";
      }
   }

   showEditInfoBox(appId) {
      const { activeApps } = this.state;

      if (activeApps.indexOf(appId) >= 0) {
         this[appId].style.display = "block";
      }
   }

   hideEditInfoBox(appId) {
      const { activeApps } = this.state;

      if (activeApps.indexOf(appId) >= 0) {
         this[appId].style.display = "none";
      }
   }

   selectApp({ appId, redirect }) {
      const { dispatch, accessToken } = this.props;

      // Fetch selected app's scenes and then store selected app (with scenes and placements details) in the redux state as 'selectedApp'
      dispatch(selectApp(appId, accessToken));
      this.setState({ appSelected: true, redirect });
   }

   getReportData(appsIds) {
      const {
         dispatch,
         accessToken,
         location: { search },
         userData
      } = this.props;

      const isAdmin = search === "?iamanadmin";
      dispatch(
         getReportData({
            isAdmin,
            appsIds,
            accessToken,
            publisherId: userData._id
         })
      );

      dispatch(setInitialReportApp(appsIds));
      // dispatch(getApps({accessToken}));
      this.setState({ appSelected: true, redirect: "REPORT" });
   }

   // FILTER ----------------------------------------------

   toggleFilter() {
      const { showFilter } = this.state;

      this.setState({ showFilter: !showFilter });
   }

   addFilter() {
      const { filterBy } = this.state;

      const newFilter = {
         _id: "",
         name: "",
         userId: "",
         isActive: "",
         platformName: "",

         userName: "",
         appEngine: ""
      };

      filterBy.push(newFilter);

      this.setState({ filterBy, userUsedFilter: true });
   }

   deleteFilter(i) {
      const { accessToken, adminToken, dispatch } = this.props;
      const { filterBy } = this.state;
      filterBy.splice(i, 1);
      const userUsedFilter = filterBy.length !== 0;
      this.setState({ filterBy, userUsedFilter });
      dispatch(getApps({ accessToken, filterBy, adminToken }));
   }

   setFilter({ filterIndex, attr }, e) {
      const { accessToken, adminToken, dispatch } = this.props;
      let { filterBy } = this.state;
      const usedAttr = !!filterBy[filterIndex][attr];

      let {
         target: { value }
      } = e;

      value =
         attr === "isActive"
            ? value === ""
               ? value
               : value === "live"
            : value;

      filterBy[filterIndex][attr] = value;

      this.setState({ filterBy });
      dispatch(setAppsFilterBy(filterBy));

      // check if it's an empty filter
      let isEmpty = true;
      let filter;
      for (let i = 0; i < filterBy.length; i++) {
         filter = filterBy[i];
         for (let filterItem in filter) {
            if (filter[filterItem] !== "") {
               isEmpty = false;
               break;
            }
         }
         if (!isEmpty) break;
      }

      filterBy = isEmpty ? [] : filterBy;

      if (
         attr === "name" ||
         attr === "_id" ||
         attr === "email.value" ||
         attr === "userName"
      ) {
         (value.length >= 3 || usedAttr) &&
            dispatch(getApps({ accessToken, filterBy, adminToken }));
      } else {
         dispatch(getApps({ accessToken, filterBy, adminToken }));
      }
   }

   renderFilter() {
      const _parseFilterName = str => {
         const uppIndex = STR.getFirstUpper(str);

         switch (str) {
            case "name":
               str = "App Name";
               break;
            case "_id":
               str = "App Id";
               break;
            case "platformName":
               str = "Platform";
               break;
            case "email.value":
               str = "User Email";
               break;
            default:
         }

         return `${STR.capitalizeFirstLetter(
            str.substring(0, uppIndex)
         )} ${str.substring(uppIndex, str.length)}`;
      };

      let {
         //    location: { search },
         userData,
         appsFilterBy
      } = this.props;
      let { filterBy } = this.state;

      appsFilterBy = appsFilterBy || [];
      filterBy = Object.keys(appsFilterBy).length > 0 ? appsFilterBy : filterBy;

      // const isAdmin = search === "?iamanadmin";

      const filterTypes = userData.isAdmin
         ? [
              "name",
              //   "_id",
              "email.value",
              "userName",
              "appEngine",
              "isActive",
              "platformName"
           ]
         : ["name", "isActive", "appEngine"];
      //      ["name", "appEngine", "isActive", "platformName"];

      const appEnginesOpts = Object.keys(C.APP_ENGINES_IMGS).map(engine => {
         return (
            <option value={engine} key={engine}>
               {engine}
            </option>
         );
      });

      // const appEnginesOpts = [
      //    <option value="Unity" key="unity">
      //       Unity
      //    </option>,
      //    <option value="Unreal" key="unreal">
      //       Unreal
      //    </option>
      // ];

      const appStatusOpts = [
         <option value={C.APP_STATES.live} key={C.APP_STATES.live}>
            Live
         </option>,
         <option value={C.APP_STATES.inactive} key={C.APP_STATES.inactive}>
            Inactive
         </option>
      ];

      const platformOpts = [
         <option value="Android" key="android">
            Android
         </option>
      ];

      return (
         <div className="filter-container fadeIn">
            {filterBy.map((filter, i) => (
               <div className="filter" key={`${filter}-${i}`}>
                  {filterTypes.map(f => {
                     if (
                        f === "appEngine" ||
                        f === "isActive" ||
                        f === "platformName"
                     ) {
                        let opts = [];
                        switch (f) {
                           case "appEngine":
                              opts = appEnginesOpts;
                              break;
                           case "isActive":
                              opts = appStatusOpts;
                              break;
                           case "platformName":
                              opts = platformOpts;
                              break;
                           default:
                        }

                        return (
                           <div key={f}>
                              <span className="mb">{_parseFilterName(f)}</span>
                              <select
                                 className="form-control"
                                 onChange={this.setFilter.bind(null, {
                                    filterIndex: i,
                                    attr: f
                                 })}
                                 defaultValue={filter[f]}
                              >
                                 <option value="" />
                                 {opts.map(opt => opt)}
                              </select>
                           </div>
                        );
                     }
                     return (
                        <div key={f}>
                           <span className="mb">{_parseFilterName(f)}</span>
                           <input
                              className="form-control"
                              type="text"
                              value={filter[f]}
                              onChange={this.setFilter.bind(null, {
                                 filterIndex: i,
                                 attr: f
                              })}
                           />
                        </div>
                     );
                  })}
                  <div className="cc trash">
                     <FontAwesomeIcon
                        icon={faPlus}
                        onClick={this.addFilter}
                        className="trash-plus"
                     />
                     <FontAwesomeIcon
                        icon={faMinus}
                        onClick={this.deleteFilter.bind(null, i)}
                        className="trash-minus"
                     />
                  </div>
               </div>
            ))}
         </div>
      );
   }

   // RENDER ----------------------------------------------

   renderApps() {
      let { apps, selectedApp } = this.props;
      apps = Array.isArray(apps) ? apps : [];

      const appsRe = apps.slice().reverse();

      return appsRe.map((app, i) => {
         //  if (i > 0) return;
         let { _id, name, isActive, appState, storeurl } = app;

         const selectedAppClass =
            selectedApp && selectedApp._id === _id ? "app-selected" : "";

         let isPendingStyle = "";
         let dataOn = "Live";

         if (storeurl !== undefined && appState !== undefined) {
            isPendingStyle =
               appState === C.APP_STATES.pending ? "pendingState" : "";
            dataOn = appState === C.APP_STATES.pending ? "Need info" : "Live";
         }

         let infoBtnClass;

         if (isPendingStyle !== "" && isActive) {
            // infoBtnClass = "btn-pending btn-blink-orange";
            infoBtnClass = "btn-pending";
         } else {
            infoBtnClass = "btn-dark";
         }

         return (
            <div
               className={`app-select-container ${selectedAppClass}`}
               key={_id}
            >
               <div className="engine-logo">
                  {/* <img src={enginesImgs[app.appEngine]} alt="Engine" /> */}
                  <img
                     src={
                        app.appEngine
                           ? C.APP_ENGINES_IMGS[app.appEngine]
                           : admix
                     }
                     className="unselectable"
                     alt="Engine"
                  />
               </div>

               <div className="app-name mb">{name}</div>

               <div className="app-status mb">
                  <div className="active-switch clearfix toggleBtn">
                     <div className="toggles">
                        <input
                           type="checkbox"
                           style={{ display: "none" }}
                           name={_id}
                           id={_id}
                           className="ios-toggle"
                           checked={isActive}
                           onChange={this.handleOnSwitch.bind(null, app)}
                        />
                        <label
                           htmlFor={_id}
                           className={`checkbox-label ${isPendingStyle}`}
                           data-on={dataOn}
                           data-off="Inactive"
                        />
                     </div>
                     {/* {isPendingStyle !== "" &&
                        isActive && (
                           <span className="mb">
                              (missing store URL, add it&nbsp;
                              <a
                                 onClick={this.selectApp.bind(null, {
                                    appId: _id,
                                    redirect: "INFO"
                                 })}
                              >
                                 here
                              </a>)
                           </span>
                        )} */}
                  </div>
               </div>

               <div
                  className="app-buttons"
                  onMouseLeave={this.hideEditInfoBox.bind(null, _id)}
               >
                  <div
                     className="info-box mb"
                     id={_id}
                     style={{ display: "none" }}
                     ref={infoBox => {
                        this[_id] = infoBox;
                     }}
                  >
                     Turn off the campaign before editing!
                  </div>

                  <button
                     className="btn btn-dark mb"
                     onClick={this.selectApp.bind(null, {
                        appId: _id,
                        redirect: "SCENE"
                     })}
                     //       disabled={isActive}
                     //    onMouseLeave={this.hideEditInfoBox.bind(null, _id)}
                     //    onMouseEnter={this.showEditInfoBox.bind(null, _id)}
                  >
                     Setup
                  </button>
                  <button
                     className={`btn mb ${infoBtnClass}`}
                     onClick={this.selectApp.bind(null, {
                        appId: _id,
                        redirect: "INFO"
                     })}
                  >
                     App Info
                  </button>

                  {/* REPORT COMMENTED */}
                  <button
                     className="btn btn-dark mb"
                     onClick={this.getReportData.bind(null, _id)}
                  >
                     Report
                  </button>
               </div>
            </div>
         );
      });
   }

   renderNoApps() {
      const { userUsedFilter } = this.state;
      return (
         <div id="no-apps">
            <img
               src="https://cdn.shopify.com/s/files/1/1061/1924/files/Thinking_Face_Emoji.png?9898922749706957214"
               alt="mmm"
            />
            {!userUsedFilter && (
               <React.Fragment>
                  <h3 className="st">
                     Looks like you have not connected your app yet.
                  </h3>
                  <h2 className="mb">
                     To get started, create your inventory in Unity with the{" "}
                     <br /> Advir plugin. Apps will appear here automatically.
                  </h2>
                  <h2 className="mb">
                     <br />
                     <br />
                     Don't have the plugin?
                  </h2>
                  <NavLink to="/download" className="btn btn-dark">
                     Download Admix plugin
                  </NavLink>
               </React.Fragment>
            )}

            {userUsedFilter && (
               <React.Fragment>
                  <h3 className="st">You don't seem to have that app.</h3>
                  <h2 className="mb">
                     Check your spelling or the filter combinations.
                  </h2>
               </React.Fragment>
            )}
         </div>
      );
   }

   render() {
      const { location, apps, asyncLoading, userData } = this.props;
      const {
         showContent,
         appSelected,
         redirect,
         allAppsIds,
         filterBy
      } = this.state;
      const anyApps = apps.length > 0;

      if (!asyncLoading && appSelected) {
         return (
            <Redirect
               to={{
                  pathname: routeCodes[redirect],
                  state: { from: location }
               }}
               push
            />
         );
      }

      return (
         <div className="step-container" id="apps">
            <div className="container">
               <div id="apps-myApps">
                  <h3 className="st sc-h3">My apps</h3>
                  <div
                     id="filter"
                     className="unselectable"
                     onClick={this.addFilter}
                  >
                     <FontAwesomeIcon icon={faSearchPlus} /> &nbsp;
                     <span className="mb">Filter</span>
                  </div>
                  {/* REPORT COMMENTED */}
                  <button
                     className="btn btn-dark sst"
                     onClick={this.getReportData.bind(null, allAppsIds)}
                  >
                     <FontAwesomeIcon icon={faGlobe} /> &nbsp; Global Report
                  </button>
               </div>

               {!showContent && <AdmixLoading loadingText="Loading" />}

               {filterBy.length > 0 && this.renderFilter()}

               {anyApps &&
                  showContent && <div id="apps-list">{this.renderApps()}</div>}

               {!anyApps && userData._id && showContent && this.renderNoApps()}
            </div>
         </div>
      );
   }
}

const mapStateToProps = state => ({
   apps: state.app.get("apps"),
   appsFilterBy: state.app.get("appsFilterBy"),
   selectedApp: state.app.get("selectedApp"),
   accessToken: state.app.get("accessToken"),
   adminToken: state.app.get("adminToken"),
   asyncLoading: state.app.get("asyncLoading"),
   userData: state.app.get("userData")
});

export default connect(mapStateToProps)(MyApps);
