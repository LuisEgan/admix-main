import React, { Component } from "react";
import { connect } from "react-redux";
import { NavLink, Redirect, Switch, Link } from "react-router-dom";
import { routeCodes } from "../../config/routes";
import PropTypes from "prop-types";
import { logout, async } from "../../actions";
import logoImg20 from "../../assets/img/logo_20.png";
import loginImg from "../../assets/img/login-img.png";
import userImgGen from "../../assets/img/userImg.png";
import book2 from "../../assets/img/book2.jpg";
import sam20 from "../../assets/img/sam_20.jpg";
import admixLoading from "../../assets/gifs/admixBreath.gif";

import {
   CLOUDINARY_UPLOAD_PRESET,
   CLOUDINARY_UPLOAD_URL,
   CLOUDINARY_IMG_URL
} from "../../config/cloudinary";

const AppsLeft = "27%";
const EditLeft = "43%";
const ValidateLeft = "60%";

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
         stepBarStyle: {
            left: 0,
            opacity: 0,
            redirectTo: ""
         },
         userImg: "",
         userHasImg: true
      };

      this.handleLogout = this.handleLogout.bind(this);
      this.handleClick = this.handleClick.bind(this);
      this.updateMenuImg = this.updateMenuImg.bind(this);
      this.noUserImg = this.noUserImg.bind(this);
      this.toggleDropdowns = this.toggleDropdowns.bind(this);
   }

   componentWillReceiveProps(nextProps) {
      const {
         location: { pathname },
         userData
      } = nextProps;
      let stepBarStyle;
      const userId = userData._id;

      if (!!location) {
         if (pathname.includes("setup")) {
            stepBarStyle = {
               opacity: 0,
               left: AppsLeft
            };
         } else if (pathname.includes("scene")) {
            stepBarStyle = {
               // opacity: 1,
               left: EditLeft
            };
         } else if (pathname.includes("validation")) {
            stepBarStyle = {
               // opacity: 1,
               left: ValidateLeft
            };
         }

         this.updateMenuImg();
         this.setState({ stepBarStyle });
      }
   }

   componentDidMount() {
      this.updateMenuImg();
      this.props.onRef(this);
   }

   componentWillUnmount() {
      this.props.onRef(undefined);
   }

   updateMenuImg() {
      const { userData } = this.props;
      const userId = userData._id;
      this.setState({
         userImg: `${CLOUDINARY_IMG_URL}/${userId}.png?${new Date().getTime()}`,
         userHasImg: true
      });
   }

   noUserImg(e) {
      const { userData } = this.props;
      const userId = userData._id;

      let userImg = "";

      userImg = admixLoading;
      this.setState({ userImg });

      userImg = userId
         ? `${CLOUDINARY_IMG_URL}/${userId}.png?${new Date().getTime()}`
         : loginImg;
      this.setState({ userImg, userHasImg: false });
   }

   handleLogout() {
      const { dispatch } = this.props;
      this.toggleDropdowns(true);
      dispatch(logout());
   }

   handleClick(step, e) {
      const { location, history } = this.props;
      let left, redirectTo;
      switch (step) {
         case "Apps":
            left = AppsLeft;
            redirectTo = routeCodes.LOGIN;
            break;
         case "Edit":
            left = EditLeft;
            redirectTo = routeCodes.SCENE;
            break;
         case "Validate":
            left = ValidateLeft;
            redirectTo = routeCodes.VALIDATION;
            break;
      }

      const stepBarStyle = {
         opacity: 1,
         left
      };

      this.setState({ stepBarStyle });
      setTimeout(() => {
         history.push(redirectTo);
      }, 500);
   }

   toggleDropdowns(forceClose = false) {
      let { showDropdown } = this.state;
      showDropdown = forceClose ? false : !showDropdown;
      this.setState({ showDropdown });
   }

   render() {
      let {
         stepBarStyle,
         redirectTo,
         userImg,
         showDropdown,
         userHasImg
      } = this.state;
      const {
         location: { pathname },
         isLoggedIn
      } = this.props;

      showDropdown = showDropdown ? "show" : "";

      const userImgStyle = userHasImg
         ? {}
         : { padding: "4%", backgroundColor: "#f2f2f2" };

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

               {isLoggedIn && (
                  <div
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
                           {/* <i className="fa fa-user" aria-hidden="true"></i> */}
                           <span className="st">My Profile</span>
                        </button>
                        <div className={`dropdown-menu ${showDropdown}`}>
                           {!isLoggedIn && (
                              <NavLink
                                 exact
                                 to={routeCodes.LOGIN}
                                 className="dropdown-item"
                                 onClick={this.toggleDropdowns.bind(null, true)}
                              >
                                 Login
                              </NavLink>
                           )}

                           {isLoggedIn && (
                              <NavLink
                                 exact
                                 to={routeCodes.PROFILE}
                                 className="dropdown-item"
                                 onClick={this.toggleDropdowns.bind(null, true)}
                              >
                                 Profile
                              </NavLink>
                           )}

                           {isLoggedIn && (
                              <a
                                 className="dropdown-item"
                                 onClick={this.handleLogout}
                              >
                                 Logout
                              </a>
                           )}
                        </div>
                     </div>
                     <img src={userImg} onError={this.noUserImg} alt="Login" />
                  </div>
               )}
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
   isLoggedIn: state.app.get("isLoggedIn")
});

export default connect(mapStateToProps)(Menu);
