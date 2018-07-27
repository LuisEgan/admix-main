import React from "react";

const AdmixLoading = ({ loadingText }) => {
   return (
      <div className="loadingSVG">
         <svg
            className="Admix-SVG"
            x="0px"
            y="0px"
            viewBox="0 0 374 307"
            style={{ enableBackground: "new 0 0 368 307" }}
         >
            <polygon
               id="left"
               className="animated infinite flipInY"
               points="0,307 91,155.9 182,307 "
            />
            <polygon
               id="right"
               className="animated infinite flipInY"
               points="192,307 283,155.9 374,307"
            />
            <g id="center">
               <polygon
                  id="XMLID_3_"
                  points="102,146.1 187,2.3 272,146.1"
                  className="animated infinite bounceInDown"
               />
               <polygon
                  id="XMLID_4_"
                  className="animated infinite bounceInDown"
                  points="272,146.1 187,289.9 102,146.1"
               />
            </g>
            <rect
               id="XMLID_1_"
               x="103.3"
               y="143.8"
               width="167.4"
               height="4.4"
               className="animated infinite bounceInDown"
            />
         </svg>
         <span className="loadingSVGText mb">
            {loadingText} <span className="animated infinite fadeIn">...</span>
         </span>
      </div>
   );
};

export default AdmixLoading;