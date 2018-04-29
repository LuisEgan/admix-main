import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import Routes from "config/routes";
import Menu from "components/Global/Menu";

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

    return (
      <div className="App">
        <Menu
          isLoggedIn={isLoggedIn}
          location={location}
          history={history}
          onRef={ref => (this.menu = ref)}
        />

        <div id="Page">
          <div id="content">
            <Routes
              isLoggedIn={isLoggedIn}
              location={location}
              updateMenuImg={this.updateMenuImg}
            />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  isLoggedIn: state.app.get("isLoggedIn")
});

export default withRouter(connect(mapStateToProps)(App));
