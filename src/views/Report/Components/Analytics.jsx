import React, { Component } from "react";
import PropTypes from "prop-types";

export default class Analytics extends Component {
   static propTypes = {
      dispatch: PropTypes.func
   };

   render() {
      return (
         <div id="analytics">
            <h1>Analytics</h1>
         </div>
      );
   }
}
