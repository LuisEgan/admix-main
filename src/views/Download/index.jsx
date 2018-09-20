import React, { Component } from "react";
import SVG from "../../components/SVG";

export default class Congratulations extends Component {
   render() {
      return (
         <div className="step-container" id="download">
            <div className="step-title">
               <h3 className="st sc-h3">Download</h3>
            </div>

            <div>
               <div className="download-top-section">
                   <div id="download-unity">
                       <div>{SVG.logoUnity}</div>
                       <div><span className="sst">Admix for Unity</span></div>
                       <div>
                           <a
                           className="btn btn-dark"
                           href="https://admix.in/wp-content/uploads/2018/08/Admix_Unity.rar"
                           target="_blank"
                           rel="noopener noreferrer"
                           >
                           Download
                        </a></div>
                   </div>
                   <div id="download-ue">
                       <div>{SVG.logoUnreal}</div>
                       <div><span className="sst">Admix for Unreal</span></div>
                       <div><a>Download</a></div>
                   </div>
                   <div id="download-help">
                       <div><span className="st">Need help?</span></div>
                       <div><span className="mb">Check out our <br/> Starter’s Guide <a
                           href="https://admix.in/wp-content/uploads/2018/08/Admix_Starter_Guide.pdf"
                           target="_blank"
                           rel="noopener noreferrer"
                        >
                           here
                        </a></span></div>
                       <div><span className="mb">Questions? <br/> <a href="mailto:support@admix.in">Contact support</a></span></div>
                   </div>
               </div>


               <div className="mb download-bottom-section">
                   <div>
                       <span className="subtitle">VERSION</span>
                       <span>Admix.Unity_Rev1.3-Release_videoFix</span>
                       <span className="subtitle">SIZE</span>
                       <span>8MB</span>
                       <span className="subtitle">REQUIREMENTS</span>
                       <span>Unity 2017.f.1.10 and above</span>
                   </div>
                   <div>
                       <span>Avaliable soon</span>
                   </div>
                   <div></div>
               </div>
            </div>
         </div>
      );
   }
}
