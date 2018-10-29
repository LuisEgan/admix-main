import React from "react";

class AppStateToggle extends React.Component {
   constructor(props) {
      super(props);

      this.state = {};
   }

   liveText(app) {
      return "Live";
   }

   render() {
      const { app } = this.props;

      return (
         <div className="appStateToggle">
            <div id="appStateToggle-off">
               <span>Off</span>
               <div className="tooltip">
                  In Off mode, ads are not delivering and appear transparent.
               </div>
            </div>
            <div id="appStateToggle-sandbox">
               <span>Sandbox</span>
               <div className="tooltip">
                  In SANDBOX mode, placeholder ads are delivered for testing
                  purposes but not generating revenue.
               </div>
            </div>
            <div id="appStateToggle-active">
               <span>{this.liveText(app)}</span>
               <div className="tooltip">
                  In Off mode, ads are not delivering and appear transparent.
               </div>
            </div>
         </div>
      );
   }
}

export default AppStateToggle;
