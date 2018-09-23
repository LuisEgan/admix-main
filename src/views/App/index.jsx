import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";

import Routes from "../../config/routes";
import Menu from "../.Global/Menu";
import SideMenu from "../.Global/SideMenu";
import Snackbar from "../.Global/SnackBar";

// @withRouter()
// @connect(state => ({
//   isLoggedIn: state.app.get('isLoggedIn'),
// }))
class App extends Component {
   constructor(props) {
      super(props);

      this.updateMenuImg = this.updateMenuImg.bind(this);
   }

   updateMenuImg() {
      this.menu.updateMenuImg();
   }

   render() {
      const { isLoggedIn, location, history } = this.props;

      const contentStyle = !isLoggedIn ? {width: "100%"} : {};

      return (
         <div className="App">
            <Menu
               isLoggedIn={isLoggedIn}
               location={location}
               history={history}
               onRef={ref => (this.menu = ref)}
            />
            <div id="Page">
               <SideMenu location={location} history={history} />
               <div id="content" style={contentStyle}>
                  <Routes
                     isLoggedIn={isLoggedIn}
                     location={location}
                     updateMenuImg={this.updateMenuImg}
                  />
               </div>
            </div>
            <Snackbar />
         </div>
      );
   }
}

const mapStateToProps = state => ({
   isLoggedIn: state.app.get("isLoggedIn")
});

export default withRouter(connect(mapStateToProps)(App));
