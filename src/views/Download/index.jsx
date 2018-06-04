import React, { Component } from "react";
import unity from "../../assets/img/unity-logo_50.png";
import ue4 from "../../assets/img/Unreal-Engine-Logo-20.png";

export default class Congratulations extends Component {
   render() {
      return (
         <div className="step-container" id="download">
            <div className="container simple-container">
               <h3 className="st">Download</h3>
               <div>
                  <div>
                     <div>
                        <img src={unity} alt="unity" />
                        <a
                           className="btn btn-dark"
                           href="http://admix.in/plugins/Plugin_V1.0_Distribute.unitypackage"
                           target="_blank"
                           rel="noopener noreferrer"
                        >
                           Admix for Unity
                        </a>
                        <p className="mb">
                           V1.0 - 102Mb <br /> Unity 2017.f.1.10 and above
                        </p>
                     </div>
                     <div>
                        <img src={ue4} alt="ue4" />
                        <a className="btn btn-dark disabled">
                           Admix for Unreal
                        </a>
                        <p className="mb">Available soon.</p>
                     </div>
                  </div>

                  <div>
                     <h2 className="st">How to install</h2>
                     <ul>
                        <li>Download Asset package</li>
                        {/* <li>Extract .zip anywhere</li> */}
                        <li>
                           Open your app project and import Asset package
                           <ul>
                              <li>Import > Custom package</li>
                              <li>Import all</li>
                           </ul>
                        </li>
                        <li>
                           Login in the plugin with your Admix credentials and
                           start creating your placements
                        </li>
                     </ul>

                     <h2 className="st">Questions?</h2>
                     <a href="mailto:contact@admix.in">Contact support</a>
                  </div>
               </div>
            </div>
         </div>
      );
   }
}
