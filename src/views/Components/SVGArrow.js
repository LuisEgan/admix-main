import React, { Component } from "react";

export default class SVGArrow extends Component {
   render() {
      return (
         <svg x="0px" y="0px" width="32px" height="32px" viewBox="0 0 32 32">
            <g>
               <g>
                  <path d="M28,0H4C1.791,0,0,1.791,0,4v24c0,2.209,1.791,4,4,4h24c2.209,0,4-1.791,4-4V4C32,1.791,30.209,0,28,0z M28,28H4V4h24V28z" />
                  <rect x="14.002" y="15" width="4" height="8" />
                  <polygon points="22.002,15 16.002,15 16.002,9" />
                  <polygon points="10.002,15 16.002,15 16.002,9" />
               </g>
            </g>
         </svg>
      );
   }
}
