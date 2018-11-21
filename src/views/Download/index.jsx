import React, { Component } from "react";
import _a from "../../utils/analytics";
import SVG from "../../components/SVG";

const { ga } = _a;

export default class Congratulations extends Component {
   handleDownload(file) {
      _a.track(ga.actions.download[file], {
         category: ga.categories.download,
      });
   }

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
                     <div>
                        <span className="sst">Admix for Unity</span>
                     </div>
                     <div>
                        <a
                           className="btn-dark mb"
                           href="https://admix.in/wp-content/uploads/2018/11/Admix.Unity_Rev1.5.1_Release.unitypackage"
                           target="_blank"
                           rel="noopener noreferrer"
                           onClick={this.handleDownload.bind(null, "unity")}
                        >
                           Download
                        </a>
                     </div>
                  </div>
                  <div id="download-ue">
                     <div>{SVG.logoUnreal}</div>
                     <div>
                        <span className="sst">Admix for Unreal</span>
                     </div>
                     <div>
                        <a className="mb">Download</a>
                     </div>
                  </div>
                  <div id="download-help">
                     <div>
                        <span className="st">Need help?</span>
                     </div>
                     <div>
                        <span className="mb">
                           Check out our <br /> Starter’s Guide{" "}
                           <a
                              href="https://admix.in/wp-content/uploads/2018/08/Admix_Starter_Guide.pdf"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={this.handleDownload.bind(null, "guide")}
                           >
                              here
                           </a>
                        </span>
                     </div>
                     <div>
                        <span className="mb">
                           Questions? <br />{" "}
                           <a href="mailto:support@admix.in">Contact support</a>
                        </span>
                     </div>
                  </div>
               </div>

               <div className="mb download-bottom-section">
                  <div>
                     <span className="subtitle">VERSION</span>
                     <span>Admix.Unity_Rev1.5.1_Release.unitypackage</span>
                     <span className="subtitle">SIZE</span>
                     <span>4MB</span>
                     <span className="subtitle">REQUIREMENTS</span>
                     <span>Unity 2017.4.14f1 LTS and above</span>
                  </div>
                  <div>
                     <span>Available soon</span>
                  </div>
                  <div />
               </div>
            </div>
         </div>
      );
   }
}
