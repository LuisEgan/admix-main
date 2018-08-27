import React, { Component } from "react";
import { connect } from "react-redux";
import { NavLink, Redirect, Link } from "react-router-dom";
import { routeCodes } from "../../config/routes";
import PropTypes from "prop-types";
import { logout, async, fetchUserImgURL } from "../../actions";
import logoImg20 from "../../assets/img/logo_20.png";
import defaultImg from "../../assets/img/default_pic.jpg";

import IconButton from "@material-ui/core/IconButton";
import MenuItem from "@material-ui/core/MenuItem";
import MUIMenu from "@material-ui/core/Menu";

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faUser from "@fortawesome/fontawesome-free-solid/faUser";
import faCaretDown from "@fortawesome/fontawesome-free-solid/faCaretDown";

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
      this.isSub = this.isSub.bind(this);
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

   isSub(page) {
      const {
         location: { pathname }
      } = this.props;
      return pathname.indexOf(page) > 0 ? "sub" : "";
   }

   render() {
      let { showDropdown } = this.state;
      const { anchorEl } = this.state;
      const open = Boolean(anchorEl);

      const {
         isLoggedIn,
         userData,
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

               <div className="cc mb" id="pages-container">
                  {isLoggedIn && (
                     <React.Fragment>
                        <div className={`${this.isSub("myapps")}`}>
                           <NavLink
                              exact
                              to={routeCodes.MYAPPS}
                              onClick={this.handleClose}
                              className="mb mui-dropdown-item"
                           >
                              My Apps
                           </NavLink>
                        </div>
                        <div className={`${this.isSub("profile")}`}>
                           <NavLink
                              exact
                              to={routeCodes.PROFILE}
                              onClick={this.handleClose}
                              className="mb mui-dropdown-item"
                           >
                              My Profile
                           </NavLink>
                        </div>
                        <div className={`${this.isSub("download")}`}>
                           <NavLink
                              exact
                              to={routeCodes.DOWNLOAD}
                              onClick={this.handleClose}
                              className="mb mui-dropdown-item"
                           >
                              Download
                           </NavLink>
                        </div>
                     </React.Fragment>
                  )}
               </div>

               <div id="dropdown-container">
                  <IconButton
                     aria-owns={open ? "menu-appbar" : null}
                     aria-haspopup="true"
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
                              {/* <NavLink
                                 exact
                                 to={routeCodes.LOGIN}
                                 onClick={this.handleClose.bind(null, true)}
                                 className="mb mui-dropdown-item"
                                 >
                                 Login
                              </NavLink> */}
                              <a
                                 onClick={this.handleClose.bind(null, true)}
                                 className="mb mui-dropdown-item"
                                 href="/login"
                              >
                                 Login
                              </a>
                           </MenuItem>
                        </React.Fragment>
                     )}

                     {isLoggedIn && (
                        <React.Fragment>
                           <MenuItem onClick={this.handleClose}>
                              <a
                                 onClick={this.handleLogout}
                                 className="mb mui-dropdown-item"
                                 href="/login"
                              >
                                 Logout
                              </a>
                           </MenuItem>
                        </React.Fragment>
                     )}
                  </MUIMenu>
                  <span className="sst" onClick={this.handleDropdown}>
                     {userData.name === undefined ||
                     userData.name === "" ||
                     !userData.name
                        ? "Hello!"
                        : "Hi, " + userData.name}{" "}
                     <FontAwesomeIcon icon={faCaretDown} />
                  </span>
               </div>
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

{
   /* <MenuItem onClick={this.handleClose}>
   <NavLink
      exact
      to={routeCodes.MYAPPS}
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
</MenuItem> */
}
