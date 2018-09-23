import React from "react";
import { NavLink } from "react-router-dom";
import ReactSVG from "react-svg";
import caret from "../assets/svg/caret-down.svg";
import SVG from "./SVG";

class Breadcrumbs extends React.Component {
   render() {
      const { breadcrumbs } = this.props;
      const allBreadcrumbs = breadcrumbs.length;
      let linkClass, lastBread;

      return (
         <div className="breadcrumbs">
            {breadcrumbs.map((breadcrumb, i) => {
                lastBread = i === allBreadcrumbs - 1;
                linkClass =  lastBread ? "last" : "";
               return (
                  <React.Fragment key={breadcrumb.title}>
                     <div>
                        <NavLink to={breadcrumb.route} className={linkClass}>
                           {breadcrumb.title}
                        </NavLink>
                     </div>
                     {!lastBread && <div><ReactSVG src={caret} /></div>}
                  </React.Fragment>
               );
            })}
         </div>
      );
   }
}

export default Breadcrumbs;
