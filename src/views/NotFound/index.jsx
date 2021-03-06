import React, { Component } from "react";

import Confused_emoji from "../../assets/img/Confused_emoji.png";

export default class Congratulations extends Component {
   static propTypes = {};

   render() {
      return (
         <div className="step-container" id="congratulations">
            <div className="container simple-container">
               <h3 className="st">404</h3>
               <div>
                  <div className="emoji-container">
                     <img src={Confused_emoji} alt=":/" />
                  </div>
                  <h2 className="st">That page doesn't seem to exist</h2>
                  <h3 className="mb">
                     Here, let us guide you to a safe place <br />
                  </h3>
                  <a href="/login" className="btn btn-dark">
                     Log in
                  </a>
               </div>
            </div>
         </div>
      );
   }
}
