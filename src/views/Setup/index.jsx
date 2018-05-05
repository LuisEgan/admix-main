import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { routeCodes } from "../../config/routes";
import PropTypes from "prop-types";
import {
   getApps,
   getUserData,
   selectApp,
   toggleAppStatus,
   getReportData,
   setInitialReportApp
} from "../../actions";
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faGlobe from "@fortawesome/fontawesome-free-solid/faGlobe";
import faSearchPlus from "@fortawesome/fontawesome-free-solid/faSearchPlus";
import faSearchMinus from "@fortawesome/fontawesome-free-solid/faSearchMinus";

import unity from "../../assets/img/unity-logo_20.png";

const getFirstUpper = str => {
   for (let i = 0; i < str.length; i++) {
      if (str.charAt(i) === str.charAt(i).toUpperCase()) {
         return i;
      }
   }
   return -1;
};

const capitalizeFirstLetter = string => {
   return string.charAt(0).toUpperCase() + string.slice(1);
};

// @connect(state => ({
//   apps: state.app.get("apps"),
//   selectedApp: state.app.get("selectedApp"),
//   accessToken: state.app.get("accessToken"),
//   asyncLoading: state.app.get("asyncLoading"),
//   userData: state.app.get("userData")
// }))
class Setup extends Component {
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
         appSelected: false,
         activeApps: [],
         edit: false,
         report: false,
         allAppsIds: [],

         //filter

         filterBy: [],
         showFilter: true
      };

      this.selectApp = this.selectApp.bind(this);
      this.getReportData = this.getReportData.bind(this);
      this.handleOnSwitch = this.handleOnSwitch.bind(this);
      this.toggleEditInfoBox = this.toggleEditInfoBox.bind(this);
      this.hideEditInfoBox = this.hideEditInfoBox.bind(this);
      this.showEditInfoBox = this.showEditInfoBox.bind(this);

      //filter
      this.toggleFilter = this.toggleFilter.bind(this);
      this.addFilter = this.addFilter.bind(this);
      this.deleteFilter = this.deleteFilter.bind(this);
      this.setFilter = this.setFilter.bind(this);
   }

   componentWillMount() {
      const { dispatch, accessToken, userData } = this.props;

      if (!userData._id) {
      }
      dispatch(getApps(accessToken));
      dispatch(getUserData(accessToken));
   }

   componentDidMount() {
      const { apps } = this.props;
      const activeApps = [];
      apps.forEach(app => {
         const { _id, isActive } = app;
         isActive && activeApps.push(_id);
      });

      const allAppsIds = apps.map(app => app._id);
      this.setState({ allAppsIds, activeApps });
   }

   componentWillReceiveProps(nextProps) {
      const { apps } = this.props;
      const activeApps = [];
      apps.forEach(app => {
         const { _id, isActive } = app;
         isActive && activeApps.push(_id);
      });

      const allAppsIds = apps.map(app => app._id);
      this.setState({ allAppsIds, activeApps });
   }

   handleOnSwitch(app) {
      const { dispatch, accessToken } = this.props;

      const { _id, platformName, name, isActive } = app;
      const appDetails = {
         _id,
         platformName,
         name,
         isActive
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

   renderApps() {
      let { apps, selectedApp } = this.props;

      return apps.map((app, i) => {
         // if (i > 1) return;
         const { _id, name, isActive } = app;

         const selectedAppClass =
            selectedApp && selectedApp._id === _id ? "app-selected" : "";

         return (
            <div
               className={`app-select-container ${selectedAppClass}`}
               key={_id}
            >
               <div className="engine-logo">
                  <img src={unity} alt="Engine" />
               </div>

               <div className="app-name">{name}</div>

               <div className="app-status">
                  <div className="active-switch clearfix toggleBtn">
                     <div className="toggles">
                        <input
                           type="checkbox"
                           name={_id}
                           id={_id}
                           className="ios-toggle"
                           checked={isActive}
                           onChange={this.handleOnSwitch.bind(null, app)}
                        />
                        <label
                           htmlFor={_id}
                           className="checkbox-label"
                           data-on="Live"
                           data-off="Inactive"
                        />
                     </div>
                     {/* <label className="switch">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={this.handleOnSwitch.bind(null, app)}
                />
                <span className="slider round" />
              </label>
              <span>{liveStatus}</span> */}
                  </div>
               </div>

               <div
                  className="app-buttons"
                  onMouseLeave={this.hideEditInfoBox.bind(null, _id)}
               >
                  <div
                     className="info-box"
                     id={_id}
                     style={{ display: "none" }}
                     ref={infoBox => {
                        this[_id] = infoBox;
                     }}
                  >
                     Campaign is live, turn it off before editing!
                  </div>
                  <button
                     className="btn btn-dark"
                     onClick={this.getReportData.bind(null, _id)}
                  >
                     Report
                  </button>
                  <button
                     className="btn btn-dark"
                     disabled={isActive}
                     onClick={this.selectApp.bind(null, _id, "edit")}
                     onMouseEnter={this.showEditInfoBox.bind(null, _id)}
                  >
                     Edit
                  </button>
               </div>
            </div>
         );
      });
   }

   renderNoApps() {
      return (
         <div id="no-apps">
            <img
               src="https://cdn.shopify.com/s/files/1/1061/1924/files/Thinking_Face_Emoji.png?9898922749706957214"
               alt="mmm"
            />
            <h3 className="st">
               Looks like you have not connected your app yet.
            </h3>
            <h2 className="mb">
               To get started, create your inventory in Unity with the <br />{" "}
               Advir plugin. Apps will appear here automatically.
            </h2>
            <h2 className="mb">
               <br />
               <br />
               Don't have the plugin?
            </h2>
            <a
               href="https://assetstore.unity.com/"
               target="_blank"
               className="btn btn-dark"
               rel="noopener noreferrer"
            >
               Download Advir for Unity
            </a>
         </div>
      );
   }

   selectApp(appId) {
      const { dispatch, accessToken } = this.props;

      // Fetch selected app's scenes and then store selected app (with scenes and placements details) in the redux state as 'selectedApp'
      dispatch(selectApp(appId, accessToken));
      this.setState({ appSelected: true, edit: true });
   }

   getReportData(appsIds) {
      const { dispatch } = this.props;
      const isAdmin = true;
      dispatch(getReportData(isAdmin, appsIds));
      dispatch(setInitialReportApp(appsIds));
      this.setState({ appSelected: true, report: true });
   }

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

      this.setState({ filterBy });
   }

   deleteFilter(i) {
      const { filterBy } = this.state;
      filterBy.splice(i, 1);
      this.setState({ filterBy });
   }

   setFilter({ filterIndex, attr }, e) {
      const { filterBy } = this.state;

      let {
         target: { value }
      } = e;

      value = attr === "isActive" ? value === "live" : value;

      filterBy[filterIndex][attr] = value;

      this.setState({ filterBy });
      // dispatch(getApps(accessToken));
   }

   renderFilter() {
      const _parseFilterName = str => {
         const uppIndex = getFirstUpper(str);

         switch (str) {
            case "name":
               str = "App Name";
               break;
            case "_id":
               str = "App Id";
               break;
            default:
         }

         return `${capitalizeFirstLetter(
            str.substring(0, uppIndex)
         )} ${str.substring(uppIndex, str.length)}`;
      };

      let { filterBy } = this.state;

      const isAdmin = true;

      const filterTypes = isAdmin
         ? [
              "name",
              "_id",
              "userId",
              "userName",
              "appEngine",
              "isActive",
              "platformName"
           ]
         : ["name", "appEngine", "isActive", "platformName"];

      const appEnginesOpts = [
         <option value="unity" key="unity">
            Unity
         </option>,
         <option value="unreal" key="unreal">
            Unreal
         </option>
      ];

      const appStatusOpts = [
         <option value="inactive" key="inactive">
            Inactive
         </option>,
         <option value="live" key="live">
            Live
         </option>
      ];

      const platformOpts = [
         <option value="Android" key="android">
            Android
         </option>
      ];

      return (
         <div className="filter-container fadeIn">
            {/* <div className="filter-header">
          <div>
            <h2 className="st">Filter</h2>
          </div>
          <div id="plus" onClick={this.addFilter}>
            <FontAwesomeIcon icon={faPlusSquare} />
          </div>
          <div id="go">
            <FontAwesomeIcon icon={faSearch} />
          </div>
        </div>

        <hr /> */}

            {filterBy.map((filter, i) => (
               <div className="filter" key={`${filter}-${i}`}>
                  {filterTypes.map(f => {
                     if (
                        f === "appEngine" ||
                        f === "isActive" ||
                        f === "platformName"
                     ) {
                        let opts;
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
                              <span className="st">{_parseFilterName(f)}</span>
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
                           <span className="st">{_parseFilterName(f)}</span>
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
                        icon={faSearchMinus}
                        onClick={this.deleteFilter.bind(null, i)}
                     />
                  </div>
               </div>
            ))}
         </div>
      );
   }

   render() {
      const { appSelected, edit, allAppsIds, filterBy } = this.state;
      const { location, apps, asyncLoading } = this.props;
      const anyApps = apps.length > 0;

      if (!asyncLoading && appSelected) {
         const TO = edit ? "SCENE" : "REPORT";
         return (
            <Redirect
               to={{
                  pathname: routeCodes[TO],
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
                  <h3 className="st">My apps</h3>
                  <div
                     id="filter"
                     className="unselectable"
                     onClick={this.addFilter}
                  >
                     <FontAwesomeIcon icon={faSearchPlus} /> &nbsp;
                     <span className="mb">Filter</span>
                  </div>
                  <button
                     className="btn btn-dark"
                     onClick={this.getReportData.bind(null, allAppsIds)}
                  >
                     <FontAwesomeIcon icon={faGlobe} /> &nbsp; Global Report
                  </button>
               </div>

               {filterBy.length > 0 && this.renderFilter()}

               {/* { ( asyncLoading ) && (
            loadingIcon
          )} */}

               {anyApps && <div id="apps-list">{this.renderApps()}</div>}

               {!anyApps && !asyncLoading && this.renderNoApps()}
            </div>
         </div>
      );
   }
}

const mapStateToProps = state => ({
   apps: state.app.get("apps"),
   selectedApp: state.app.get("selectedApp"),
   accessToken: state.app.get("accessToken"),
   asyncLoading: state.app.get("asyncLoading"),
   userData: state.app.get("userData")
});

export default connect(mapStateToProps)(Setup);