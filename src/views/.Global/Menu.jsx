import React, { Component } from "react";
import { connect } from "react-redux";
import { NavLink } from "react-router-dom";
import routeCodes from "../../config/routeCodes";
import PropTypes from "prop-types";
import { logout, fetchUserImgURL } from "../../actions";
import logoImg20 from "../../assets/img/logo_20.png";
import defaultImg from "../../assets/img/default_pic.jpg";

import IconButton from "@material-ui/core/IconButton";
import MenuItem from "@material-ui/core/MenuItem";
import MUIMenu from "@material-ui/core/Menu";

import SVG from "../../components/SVG";

import { CLOUDINARY_IMG_URL } from "../../config/cloudinary";

class Menu extends Component {
  static propTypes = {
    isLoggedIn: PropTypes.bool,
    location: PropTypes.object,
    dispatch: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      showDropdown: false,
      imgChecked: false,
      badURL: false,
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
        imgChecked: true,
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
      location: { pathname },
    } = this.props;
    return pathname.indexOf(page) > 0 ? "sub" : "";
  }

  render() {
    let { showDropdown } = this.state;
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    const { isLoggedIn, userData } = this.props;

    showDropdown = showDropdown ? "show" : "";

    if (!isLoggedIn) return null;

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

          <div className="cc mb" id="pages-container" />

          <div id="dropdown-container" className="mb">
            <MUIMenu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={open}
              onClose={this.handleClose}
            >
              <MenuItem onClick={this.handleClose}>
                <a
                  onClick={this.handleLogout}
                  className="mb mui-dropdown-item"
                  //    href="/login"
                >
                  Logout
                </a>
              </MenuItem>
            </MUIMenu>

            <IconButton
              aria-owns={open ? "menu-appbar" : null}
              aria-haspopup="true"
              color="inherit"
            >
              {userData._id && (
                <img
                  src={userData.cloudinaryImgURL}
                  onError={e => (e.target.src = defaultImg)}
                  alt="Login"
                />
              )}
            </IconButton>
            <span onClick={this.handleDropdown}>
              {userData.name === undefined ||
              userData.name === "" ||
              !userData.name
                ? "Hello!"
                : "Hi, " + userData.name}{" "}
              {SVG.caretDown}
            </span>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const {
    app: {
      userData,
      asyncData,
      asyncError,
      asyncLoading,
      counter,
      accesstoken,
      userImgURL,
      isLoggedIn,
    },
  } = state;

  return {
    userData,
    asyncData,
    asyncError,
    asyncLoading,
    counter,
    accesstoken,
    userImgURL,
    isLoggedIn,
  };
};

export default connect(mapStateToProps)(Menu);
