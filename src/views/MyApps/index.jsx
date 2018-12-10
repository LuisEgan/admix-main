import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect, NavLink } from "react-router-dom";
import routeCodes from "../../config/routeCodes";
import _a from "../../utils/analytics";
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
   setAppsFilterBy,
   getPlacementsByAppId
} from "../../actions";
import C from "../../utils/constants";
import STR from "../../utils/strFuncs";
import { CLOUDINARY_IMG_URL } from "../../config/cloudinary";

import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { KeyboardArrowDown } from "@material-ui/icons";

import AppsStateToggle from "../../components/AppStateToggle";
import Input from "../../components/Input";
import SVG from "../../components/SVG";
import CSS from "../../utils/InLineCSS";

const { ga } = _a;

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

   appStateToNumber(appState) {
      return appState === "inactive" ? 0 : appState === "live" ? 1 : 2;
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

      _a.track(ga.actions.apps.toggleAppState, {
         category: ga.categories.apps,
         label: ga.labels.toggleAppState.onMyapps,
         value: STR.appStateToNumber(appState)
      });

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

   getReportData({ appsIds, userId }) {
      const isGlobal = Array.isArray(appsIds) ? "G" : "";
      _a.track(
         ga.actions.navigationLinks[isGlobal ? "toGlobalReport" : "toReport"],
         {
            category: ga.categories.navigationLinks
         }
      );

      const { dispatch, accessToken, userData } = this.props;

      // to assing scenes to the apps for the scenes names for the graphs
      let c = 0;
      let appId;

      do {
         appId = Array.isArray(appsIds) ? appsIds[c] : appsIds;
         //    dispatch(selectApp(appId, accessToken));
         dispatch(getPlacementsByAppId(appId, accessToken));
         c++;
      } while (Array.isArray(appsIds) && c < appsIds.length);

      dispatch(
         getReportData({
            appsIds,
            accessToken,
            publisherId: userId || userData._id
         })
      );

      dispatch(setInitialReportApp(appsIds));
      // dispatch(getApps({accessToken}));
      this.setState({ appSelected: true, redirect: routeCodes.REPORT });
   }

   // FILTER ----------------------------------------------

   addFilter(button) {
      const _aAction =
         button === "main"
            ? ga.actions.apps.openFilter
            : ga.actions.apps.addFilter;
      _a.track(_aAction, {
         category: ga.categories.apps
      });

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
      _a.track(ga.actions.apps.deleteFilter, {
         category: ga.categories.apps
      });

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

   // RENDER ----------------------------------------------
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
            case "appEngine":
               str = "Engine";
               break;
            case "isActive":
               str = "Status";
               break;
            default:
               str = `${STR.capitalizeFirstLetter(
                  str.substring(0, uppIndex)
               )} ${str.substring(uppIndex, str.length)}`;
         }

         return str;
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
            <MenuItem value={engine} key={engine} style={CSS.mb}>
               {engine}
            </MenuItem>
         );
      });

      const appStatusOpts = [
         <MenuItem
            value={C.APP_STATES.live}
            key={C.APP_STATES.live}
            style={CSS.mb}
         >
            Live
         </MenuItem>,
         <MenuItem
            value={C.APP_STATES.inactive}
            key={C.APP_STATES.inactive}
            style={CSS.mb}
         >
            Inactive
         </MenuItem>
      ];

      const platformOpts = [
         <MenuItem value="Android" key="android" style={CSS.mb}>
            Android
         </MenuItem>
      ];

      return (
         <div className="filter-container fadeIn mb">
            {filterBy.map((filter, i) => (
               <div className="filter" key={`${filter}-${i}`}>
                  {filterTypes.map(filterType => {
                     if (
                        filterType === "appEngine" ||
                        filterType === "isActive" ||
                        filterType === "platformName"
                     ) {
                        let opts = [];
                        let selectValue = filter[filterType];
                        switch (filterType) {
                           case "appEngine":
                              opts = appEnginesOpts;
                              break;
                           case "isActive":
                              opts = appStatusOpts;
                              selectValue =
                                 filter[filterType] === ""
                                    ? ""
                                    : filter[filterType]
                                    ? C.APP_STATES.live
                                    : C.APP_STATES.inactive;
                              break;
                           case "platformName":
                              opts = platformOpts;
                              break;
                           default:
                        }

                        return (
                           <div key={filterType}>
                              <span>{_parseFilterName(filterType)}</span>

                              <Select
                                 value={selectValue}
                                 onChange={this.setFilter.bind(null, {
                                    filterIndex: i,
                                    attr: filterType
                                 })}
                                 classes={{ root: "mui-select-root" }}
                                 disableUnderline={true}
                                 IconComponent={KeyboardArrowDown}
                                 style={CSS.mb}
                              >
                                 <MenuItem value="" style={CSS.mb} />
                                 {opts.map(opt => opt)}
                              </Select>
                           </div>
                        );
                     }
                     return (
                        <div key={filterType}>
                           <span>{_parseFilterName(filterType)}</span>
                           <Input
                              placeholder={`Search by ${_parseFilterName(
                                 filterType
                              )}`}
                              value={filter[filterType]}
                              onChange={this.setFilter.bind(null, {
                                 filterIndex: i,
                                 attr: filterType
                              })}
                           />
                        </div>
                     );
                  })}
                  <div>
                     <div>
                        <button
                           onClick={this.addFilter.bind(null, "plus")}
                           className="SVGbtn"
                        >
                           {SVG.plus}
                        </button>
                        <button
                           onClick={this.deleteFilter.bind(null, i)}
                           className="SVGbtn"
                        >
                           {SVG.minus}
                        </button>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      );
   }

   renderApps() {
      let { apps, selectedApp } = this.props;
      apps = Array.isArray(apps) ? apps : [];

      const appsRe = apps.slice().reverse();

      return appsRe.map((app, i) => {
         let { _id, userId, name, appState } = app;

         if (appState === C.APP_STATES.deleted) return null;

         const selectedAppClass =
            selectedApp && selectedApp._id === _id ? "app-selected" : "";

         //    let isPendingStyle = "";

         //    if (storeurl !== undefined && appState !== undefined) {
         //       isPendingStyle =
         //          appState === C.APP_STATES.pending ? "pendingState" : "";
         //    }

         switch (appState) {
            case "inactive":
               appState = "Off";
               break;
            case "pending":
               appState = "Sandbox";
               break;
            default:
               appState = "Live";
         }

         const appEngineLogo = app.appEngine
            ? C.LOGOS[app.appEngine]
            : C.LOGOS.Admix;

         return (
            <div
               className={`app-select-container mb ${selectedAppClass}`}
               key={_id}
            >
               <div id="app-select-info" className="text-truncate">
                  <div className="engine-logo">{appEngineLogo}</div>
                  <div className="app-name">{name}</div>
               </div>
               <div id="app-select-buttons">
                  {/* <div>{appState}</div> */}
                  <div>
                     <div className="app-status mb">
                        {/* <ToggleButton
                           inputName={_id}
                           isChecked={isActive}
                           onChange={this.handleOnSwitch.bind(null, app)}
                           labelClass={isPendingStyle}
                        /> */}
                        <AppsStateToggle app={app} {...this.props} />
                     </div>
                  </div>

                  <div>
                     <div className="app-buttons">
                        <button
                           onClick={this.selectApp.bind(null, {
                              appId: _id,
                              redirect: routeCodes.SCENE
                           })}
                        >
                           {SVG.setup}
                        </button>
                        <button
                           onClick={this.selectApp.bind(null, {
                              appId: _id,
                              redirect: routeCodes.INFO
                           })}
                        >
                           {SVG.info}
                        </button>

                        {/* REPORT COMMENTED */}
                        <button
                           onClick={this.getReportData.bind(null, {
                              appsIds: _id,
                              userId
                           })}
                        >
                           {SVG.report}
                        </button>
                     </div>
                  </div>
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
                  <NavLink
                     to="/download"
                     className="btn btn-dark"
                     onClick={() => {
                        _a.track(ga.actions.navigationLinks.toDownloadNoApps, {
                           category: ga.categories.navigationLinks
                        });
                     }}
                  >
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
      const { location, apps, adminToken, asyncLoading, userData } = this.props;

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
                  pathname: redirect,
                  state: { from: location }
               }}
               push
            />
         );
      }

      const renderGlobal =
         adminToken && adminToken.length > 0 ? filterBy.length === 0 : true;

      return (
         <div className="step-container" id="apps">
            <div id="apps-header" className="step-title">
               <h3 className="st sc-h3">My apps</h3>
            </div>

            <div id="apps-buttons">
               <button
                  id="filter"
                  className="mb unselectable white-btn"
                  onClick={this.addFilter.bind(null, "main")}
               >
                  {SVG.filter} &nbsp;
                  <span>Filter selection</span>
               </button>

               {/* REPORT COMMENTED */}
               {renderGlobal && (
                  <button
                     className="mb unselectable white-btn"
                     onClick={this.getReportData.bind(null, {
                        appsIds: allAppsIds
                     })}
                  >
                     {SVG.globalReport} &nbsp;
                     <span>Global Report</span>
                  </button>
               )}
            </div>

            {!showContent && SVG.AdmixLoading({ loadingText: "Loading" })}

            {filterBy.length > 0 && this.renderFilter()}

            {anyApps && showContent && (
               <div id="apps-list">{this.renderApps()}</div>
            )}

            {!anyApps && userData._id && showContent && this.renderNoApps()}
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
   userData: state.app.get("userData"),
   logoutCount: state.app.get("logoutCount")
});

export default connect(mapStateToProps)(MyApps);
