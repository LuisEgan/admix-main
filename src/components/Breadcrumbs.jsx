import React from "react";
import SVG from "./SVG";

class Breadcrumbs extends React.Component {
   render() {
      const { breadcrumbs } = this.props;
      const allBreadcrumbs = breadcrumbs.length;

      return (
         <div className="breadcrumbs">
            {breadcrumbs.map((breadcrumb, i) => {
               return (
                  <React.Fragment key={breadcrumb}>
                     <div>{breadcrumb}</div>
                     {i !== allBreadcrumbs - 1 && <div>{SVG.caretDown}</div>}
                  </React.Fragment>
               );
            })}
         </div>
      );
   }
}

export default Breadcrumbs;
