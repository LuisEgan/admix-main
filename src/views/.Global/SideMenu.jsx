import React, { Component } from "react";
import { connect } from "react-redux";
import routeCodes from "../../config/routeCodes";
import ReactSVG from "react-svg";
import IconButton from "@material-ui/core/IconButton";

import SVG from "../../components/SVG";
import SVG_docs from "../../assets/svg/documentation.svg";
import logo from "../../assets/img/logo-vertical.png";
import defaultImg from "../../assets/img/default_pic.jpg";

function openInNewTab(url) {
  const sideMenu = document.getElementById("sideMenu");
  const a = document.createElement("a");
  sideMenu.appendChild(a);
  a.target = "_blank";
  a.href = url;
  a.click();
  sideMenu.removeChild(a);
}

const sections = [
  {
    icon: SVG.navMyApps,
    title: "My apps",
    pathname: routeCodes.MYAPPS,
  },
  // {
  //   icon: SVG.navMyProfile,
  //   title: "My profile",
  //   pathname: routeCodes.PROFILE,
  // },
  {
    icon: <ReactSVG src={SVG_docs} />,
    title: "Documentation",
    pathname: "https://docs.admix.in/",
  },
  {
    icon: SVG.navDownload,
    title: "Download",
    pathname: routeCodes.DOWNLOAD,
  },
];

class SideMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.renderSections = this.renderSections.bind(this);
    this.redirectTo = this.redirectTo.bind(this);
  }

  redirectTo(pathname) {
    if (pathname.indexOf("http") >= 0) {
      openInNewTab(pathname);
    }
    this.props.history.push(pathname);
  }

  renderSections() {
    const {
      location: { pathname },
      userData,
    } = this.props;

    sections[3] = {
      icon: (
        <IconButton aria-haspopup="true" color="inherit">
          <img
            onError={e => (e.target.src = defaultImg)}
            src={userData.cloudinaryImgURL}
            alt="Profile"
          />
        </IconButton>
      ),
      title: "My profile",
      pathname: routeCodes.PROFILE,
    };

    let isSelected;

    return (
      <div id="sideMenu-body">
        {sections.map(section => {
          isSelected = section.pathname === pathname ? "selectedSection" : "";
          return (
            <div
              className={isSelected}
              key={section.title}
              onClick={this.redirectTo.bind(null, section.pathname)}
            >
              <div>{section.icon}</div>
              <div>{section.title}</div>
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    const { isLoggedIn } = this.props;

    if (!isLoggedIn) return null;

    return (
      <div id="sideMenu">
        <div id="sideMenu-header">
          <img src={logo} alt="logo" />
        </div>
        {this.renderSections()}
      </div>
    );
  }
}

const mapStateToProps = state => {
  const {
    app: { isLoggedIn, userData },
  } = state;
  return {
    isLoggedIn,
    userData,
  };
};

export default connect(mapStateToProps)(SideMenu);
