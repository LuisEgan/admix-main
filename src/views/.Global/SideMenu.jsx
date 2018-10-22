import React, { Component } from "react";
import { connect } from "react-redux";
import routeCodes from "../../config/routeCodes";

import SVG from "../../components/SVG";

const sections = [
   {
      icon: SVG.navMyApps,
      title: "My apps",
      pathname: "/myapps",
      redirect: "MYAPPS"
   },
   {
      icon: SVG.navMyProfile,
      title: "My profile",
      pathname: "/profile",
      redirect: "PROFILE"
   },
   {
      icon: SVG.navDownload,
      title: "Download",
      pathname: "/download",
      redirect: "DOWNLOAD"
   }
];

class SideMenu extends Component {
   constructor(props) {
      super(props);

      this.state = {};

      this.renderSections = this.renderSections.bind(this);
      this.redirectTo = this.redirectTo.bind(this);
   }

   redirectTo(redirect) {
      this.props.history.push(routeCodes[redirect]);
   }

   renderSections() {
      const {
         location: { pathname }
      } = this.props;

      let isSelected;

      return sections.map(section => {
         isSelected = section.pathname === pathname ? "selectedSection" : "";
         return (
            <div
               className={isSelected}
               key={section.title}
               onClick={this.redirectTo.bind(null, section.redirect)}
            >
               <div>{section.icon}</div>
               <div>{section.title}</div>
            </div>
         );
      });
   }

   render() {
      const { isLoggedIn } = this.props;

      if (!isLoggedIn) return null;

      return <div id="sideMenu">{this.renderSections()}</div>;
   }
}

const mapStateToProps = state => ({
   isLoggedIn: state.app.get("isLoggedIn")
});

export default connect(mapStateToProps)(SideMenu);
