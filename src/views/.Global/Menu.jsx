import React, { Component } from "react";
import { connect } from "react-redux";
import { NavLink, Redirect, Link } from "react-router-dom";
import { routeCodes } from "../../config/routes";
import PropTypes from "prop-types";
import { logout, async, fetchUserImgURL } from "../../actions";
import logoImg20 from "../../assets/img/logo_20.png";
import loginImg from "../../assets/img/login-img.png";
import userImgGen from "../../assets/img/userImg.png";
import book2 from "../../assets/img/book2.jpg";
import sam20 from "../../assets/img/sam_20.jpg";
import admixLoading from "../../assets/gifs/admixBreath.gif";
import defaultImg from "../../assets/img/default_pic.jpg";

import IconButton from "@material-ui/core/IconButton";
import AccountCircle from "@material-ui/icons/AccountCircle";
import MenuItem from "@material-ui/core/MenuItem";
import MUIMenu from "@material-ui/core/Menu";

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faUser from "@fortawesome/fontawesome-free-solid/faUser";
import faSortDown from "@fortawesome/fontawesome-free-solid/faSortDown";

import {
   CLOUDINARY_UPLOAD_PRESET,
   CLOUDINARY_UPLOAD_URL,
   CLOUDINARY_IMG_URL
} from "../../config/cloudinary";

// @connect(state => ({
//   userData: state.app.get("userData")
// }))
class Menu extends Component {
   static propTypes = {
      isLoggedIn: PropTypes.bool,
      location: PropTypes.object,
      dispatch: PropTypes.func
   };

   constructor(props) {
      super(props);

      this.state = {
         showDropdown: false,
         imgChecked: false,
         badURL: false
      };

      this.handleLogout = this.handleLogout.bind(this);
      this.toggleDropdowns = this.toggleDropdowns.bind(this);
   }

   static getDerivedStateFromProps(nextProps, prevSate) {
      const { userData, dispatch, accesstoken } = nextProps;
      const { imgChecked } = prevSate;

      const userId = userData._id;

      if (userId && !imgChecked) {
         const userImg = `${CLOUDINARY_IMG_URL}/${userId}.png?${new Date().getTime()}`;
         const imgURL = `${CLOUDINARY_IMG_URL}/${userId}.png`;
         dispatch(fetchUserImgURL(imgURL, accesstoken));
         return {
            imgChecked: true
         };
      }

      return null;
   }

   componentDidMount() {
      this.props.onRef(this);
   }

   componentWillUnmount() {
      this.props.onRef(undefined);
   }

   handleLogout() {
      const { dispatch } = this.props;
      this.setState({ imgChecked: false });
      this.toggleDropdowns(true);
      dispatch(logout());
   }

   toggleDropdowns(forceClose = false) {
      let { showDropdown } = this.state;
      showDropdown = forceClose ? false : !showDropdown;
      this.setState({ showDropdown });
   }

   handleChange = (event, checked) => {
      this.setState({ auth: checked });
   };

   handleDropdown = event => {
      this.setState({ anchorEl: event.currentTarget });
   };

   handleClose = () => {
      this.setState({ anchorEl: null });
   };

   render() {
      let { showDropdown } = this.state;
      const { anchorEl } = this.state;
      const open = Boolean(anchorEl);

      const {
         location: { pathname },
         isLoggedIn,
         userData,
         userImgURL,
         asyncLoading
      } = this.props;

      showDropdown = showDropdown ? "show" : "";

      return (
         <div id="headerMenu">
            <div className="container">
               <div id="logo-container">
                  <div className="header-logo cc">
                     <NavLink exact to={routeCodes.LOGIN} className="cc">
                        <img src={logoImg20} />
                     </NavLink>
                  </div>
               </div>

               <div className="cc" id="steps-container" />

               <div id="dropdown-container">
                  <span className="sst">
                     {userData.name === undefined ||
                     userData.name === "" ||
                     !userData.name
                        ? "Hello!"
                        : "Hi, " + userData.name + "!"}
                  </span>
                  <IconButton
                     aria-owns={open ? "menu-appbar" : null}
                     aria-haspopup="true"
                     onClick={this.handleDropdown}
                     color="inherit"
                  >
                     {!isLoggedIn && <FontAwesomeIcon icon={faUser} />}

                     {isLoggedIn &&
                        userData._id && (
                           <img
                              src={userData.cloudinaryImgURL}
                              onError={e => (e.target.src = defaultImg)}
                              alt="Login"
                           />
                        )}
                  </IconButton>
                  <MUIMenu
                     id="menu-appbar"
                     anchorEl={anchorEl}
                     anchorOrigin={{
                        vertical: "top",
                        horizontal: "right"
                     }}
                     transformOrigin={{
                        vertical: "top",
                        horizontal: "right"
                     }}
                     open={open}
                     onClose={this.handleClose}
                  >
                     {!isLoggedIn && (
                        <React.Fragment>
                           <MenuItem onClick={this.handleClose}>
                              <NavLink
                                 exact
                                 to={routeCodes.DOWNLOAD}
                                 onClick={this.handleClose.bind(null, true)}
                                 className="mb mui-dropdown-item"
                              >
                                 Download
                              </NavLink>
                           </MenuItem>
                           <MenuItem onClick={this.handleClose}>
                              <NavLink
                                 exact
                                 to={routeCodes.LOGIN}
                                 onClick={this.handleClose.bind(null, true)}
                                 className="mb mui-dropdown-item"
                              >
                                 Login
                              </NavLink>
                           </MenuItem>
                        </React.Fragment>
                     )}

                     {isLoggedIn && (
                        <React.Fragment>
                           <MenuItem onClick={this.handleClose}>
                              <NavLink
                                 exact
                                 to={routeCodes.SETUP}
                                 onClick={this.handleClose}
                                 className="mb mui-dropdown-item"
                              >
                                 My Apps
                              </NavLink>
                           </MenuItem>

                           <MenuItem onClick={this.handleClose}>
                              <NavLink
                                 exact
                                 to={routeCodes.PROFILE}
                                 onClick={this.handleClose}
                                 className="mb mui-dropdown-item"
                              >
                                 My Profile
                              </NavLink>
                           </MenuItem>

                           <MenuItem onClick={this.handleClose}>
                              <NavLink
                                 exact
                                 to={routeCodes.DOWNLOAD}
                                 onClick={this.handleClose}
                                 className="mb mui-dropdown-item"
                              >
                                 Download
                              </NavLink>
                           </MenuItem>

                           <MenuItem onClick={this.handleClose}>
                              <a
                                 onClick={this.handleLogout}
                                 className="mb mui-dropdown-item"
                              >
                                 Logout
                              </a>
                           </MenuItem>
                        </React.Fragment>
                     )}
                  </MUIMenu>
               </div>

               {/* <div
                  className=""
                  id="dropdown-container"
                  onMouseLeave={this.toggleDropdowns.bind(null, true)}
               >
                  <div className="dropdown">
                     <button
                        className="btn btn-secondary dropdown-toggle"
                        type="button"
                        onClick={this.toggleDropdowns.bind(null, false)}
                     >
                        <span className="sst">
                           {userData.name === undefined ||
                           userData.name === "" ||
                           !userData.name
                              ? "Hello!"
                              : "Hi, " + userData.name + "!"}
                        </span>
                     </button>
                     <div className={`dropdown-menu ${showDropdown}`}>
                        {!isLoggedIn && (
                           <React.Fragment>
                              <NavLink
                                 exact
                                 to={routeCodes.DOWNLOAD}
                                 className="dropdown-item"
                                 onClick={this.toggleDropdowns.bind(null, true)}
                              >
                                 Download
                              </NavLink>
                              <NavLink
                                 exact
                                 to={routeCodes.LOGIN}
                                 className="dropdown-item"
                                 onClick={this.toggleDropdowns.bind(null, true)}
                              >
                                 Login
                              </NavLink>
                           </React.Fragment>
                        )}

                        {isLoggedIn && (
                           <React.Fragment>
                              <NavLink
                                 exact
                                 to={routeCodes.SETUP}
                                 className="dropdown-item"
                                 onClick={this.toggleDropdowns.bind(null, true)}
                              >
                                 My Apps
                              </NavLink>

                              <NavLink
                                 exact
                                 to={routeCodes.PROFILE}
                                 className="dropdown-item"
                                 onClick={this.toggleDropdowns.bind(null, true)}
                              >
                                 My Profile
                              </NavLink>

                              <NavLink
                                 exact
                                 to={routeCodes.DOWNLOAD}
                                 className="dropdown-item"
                                 onClick={this.toggleDropdowns.bind(null, true)}
                              >
                                 Download
                              </NavLink>
                              <a
                                 className="dropdown-item"
                                 onClick={this.handleLogout}
                              >
                                 Logout
                              </a>
                           </React.Fragment>
                        )}
                     </div>
                  </div>
                  {isLoggedIn &&
                     userData._id && (
                        <img
                           src={userData.cloudinaryImgURL}
                           onError={e => (e.target.src = defaultImg)}
                           alt="Login"
                        />
                     )}
               </div> */}
            </div>
         </div>
      );
   }
}

const mapStateToProps = state => ({
   userData: state.app.get("userData"),
   asyncData: state.app.get("asyncData"),
   asyncError: state.app.get("asyncError"),
   asyncLoading: state.app.get("asyncLoading"),
   counter: state.app.get("counter"),
   accesstoken: state.app.get("accesstoken"),
   userImgURL: state.app.get("userImgURL"),
   isLoggedIn: state.app.get("isLoggedIn")
});

export default connect(mapStateToProps)(Menu);
