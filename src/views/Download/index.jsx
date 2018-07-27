import React, { Component } from "react";
import unity from "../../assets/img/unity-logo_50.png";
import ue4 from "../../assets/img/UE_Logo_Icon_Black.png";

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
                           href="https://admix.in/plugins/Admix.Unity_rev1.2_Release.rar"
                           target="_blank"
                           rel="noopener noreferrer"
                        >
                           Admix for Unity
                        </a>
                        <p className="mb">
                           Admix.Unity_rev1.2_Release.rar - 12MB <br /> Unity
                           2017.f.1.10 and above
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
                     <h2 className="st">
                        Need help?{" "}
                        <span role="img" aria-label="mm">
                           🤔
                        </span>
                     </h2>
                     <h2 className="sst">
                        Check out our Starter’s Guide{" "}
                        <a
                           href="https://admix.in/pdf/Admix starter guide BETA.pdf"
                           target="_blank"
                           rel="noopener noreferrer"
                        >
                           here{" "}
                           <span role="img" aria-label="book">
                              📘
                           </span>
                        </a>
                     </h2>

                     <h2 className="sst">Questions?</h2>
                     <a href="mailto:support@admix.in">Contact support</a>
                  </div>
               </div>
            </div>
         </div>
      );
   }
}
