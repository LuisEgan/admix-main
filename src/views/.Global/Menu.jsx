import React, { Component } from "react";
import { connect } from "react-redux";
import { NavLink, Redirect, Switch, Link } from "react-router-dom";
import { routeCodes } from "../../config/routes";
import PropTypes from "prop-types";
import { logout, async } from "../../actions";
import logoImg20 from "../../assets/img/logo_20.png";
import loginImg from "../../assets/img/login-img.png";
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
         stepBarStyle: {
            left: 0,
            opacity: 0,
            redirectTo: ""
         },
         userImg: ""
      };

      this.handleLogout = this.handleLogout.bind(this);
      this.renderSteps = this.renderSteps.bind(this);
      this.handleClick = this.handleClick.bind(this);
      this.updateMenuImg = this.updateMenuImg.bind(this);
      this.handleNoImg = this.handleNoImg.bind(this);
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
         userImg: `${CLOUDINARY_IMG_URL}/${userId}.png?${new Date().getTime()}`
      });
   }

   handleNoImg(e) {
      const { userData } = this.props;
      const userId = userData._id;

      let userImg = "";

      userImg = admixLoading;
      this.setState({ userImg });

      userImg = userId
         ? `${CLOUDINARY_IMG_URL}/${userId}.png?${new Date().getTime()}`
         : "";
      this.setState({ userImg });
   }

   handleLogout() {
      const { dispatch } = this.props;
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

   renderSteps() {
      const {
         location: { pathname }
      } = this.props;

      const showEdit =
         pathname.includes("/scene") || pathname.includes("/validation");
      const showValidation = pathname.includes("/validation");

      return (
         <div className="cc">
            <div className="cc" onClick={this.handleClick.bind(null, "Apps")}>
               Apps
            </div>{" "}
            >
            {showEdit && (
               <div
                  className="cc"
                  onClick={this.handleClick.bind(null, "Edit")}
               >
                  Edit
               </div>
            )}{" "}
            >
            {showValidation && (
               <div
                  className="cc"
                  onClick={this.handleClick.bind(null, "Validate")}
               >
                  Validate
               </div>
            )}
            {!showValidation && <div className="cc" style={{ opacity: 0 }} />}
         </div>
      );
   }

   render() {
      const { stepBarStyle, redirectTo, userImg } = this.state;
      const {
         location: { pathname },
         isLoggedIn
      } = this.props;

      const buttonStyle = {
         border: 0,
         backgroundColor: "transparent",
         borderColor: "transparent"
      };
      // const doRenderStep = (
      //   !!(location) && !(
      //     pathname.includes("login") ||
      //     pathname.includes("setup") ||
      //     pathname.includes("congratulations")
      //   )
      // );
      const doRenderStep = false;

      return (
         <div className="" id="headerMenu">
            <div className="container">
               <div className="" id="logo-container">
                  <div className="header-logo cc">
                     <NavLink exact to={routeCodes.LOGIN} className="cc">
                        <img src={logoImg20} />
                     </NavLink>
                  </div>
               </div>

               <div className="cc" id="steps-container">
                  <div id="steps-bar" style={stepBarStyle} />
                  {doRenderStep && this.renderSteps()}
                  {/* {this.renderSteps()} */}
               </div>

               {isLoggedIn && (
                  <div className="" id="dropdown-container">
                     <div className="dropdown">
                        <button
                           className="btn btn-secondary dropdown-toggle"
                           type="button"
                           id="dropdownMenuButton"
                           data-toggle="dropdown"
                           aria-haspopup="true"
                           aria-expanded="false"
                           style={buttonStyle}
                        >
                           {/* <i className="fa fa-user" aria-hidden="true"></i> */}
                           <span className="st">My Profile</span>
                        </button>
                        <div
                           className="dropdown-menu"
                           aria-labelledby="dropdownMenuButton"
                        >
                           {!isLoggedIn && (
                              <NavLink
                                 exact
                                 to={routeCodes.LOGIN}
                                 className="dropdown-item"
                              >
                                 Login
                              </NavLink>
                           )}

                           {isLoggedIn && (
                              <NavLink
                                 exact
                                 to={routeCodes.PROFILE}
                                 className="dropdown-item"
                              >
                                 Profile
                              </NavLink>
                           )}

                           {isLoggedIn && (
                              <a
                                 className="dropdown-item"
                                 onClick={event => this.handleLogout(event)}
                              >
                                 Logout
                              </a>
                           )}
                        </div>
                     </div>
                     <img
                        src={userImg}
                        onError={this.handleNoImg}
                        alt="Login"
                     />
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