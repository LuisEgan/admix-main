import React, { Component } from "react";

import NotOK from "../../assets/img/Thumbs_Down_Hand_Sign_Emoji.png";

export default class Congratulations extends Component {
   static propTypes = {};

   render() {
      return (
         <div className="step-container" id="congratulations">
            <div className="container simple-container">
               <h3 className="st">Whoops...</h3>
               <div>
                  <div className="emoji-container">
                     <img src={NotOK} alt="B-)" />
                  </div>
                  <h2 className="st">Something went wrong</h2>
                  <h3 className="mb">
                     Please contact our team at{" "}
                     <a href="mailto:contact@admix.in">contact@admix.in</a> for
                     help <br />
                  </h3>
                  <a href="http://admix.in/" className="btn btn-dark">
                     Visit Admix.in
                  </a>
               </div>
            </div>
         </div>
      );
   }
}
