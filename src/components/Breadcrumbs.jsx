import React from "react";
import _a from "../utils/analytics";
import { NavLink } from "react-router-dom";
import ReactSVG from "react-svg";
import caret from "../assets/svg/caret-down.svg";

class Breadcrumbs extends React.Component {
  _a(redirectTo) {
    _a.track(_a.ga.actions.navigationLinks.breadcrumb, {
      category: _a.ga.categories.navigationLinks,
      label: _a.ga.labels.breadcrumb[redirectTo],
    });
  }

  render() {
    const { breadcrumbs } = this.props;
    const allBreadcrumbs = breadcrumbs.length;
    let linkClass, lastBread;

    return (
      <div className="breadcrumbs">
        {breadcrumbs.map((breadcrumb, i) => {
          lastBread = i === allBreadcrumbs - 1;
          linkClass = lastBread ? "last" : "";
          return (
            <React.Fragment key={breadcrumb.title}>
              <div key={breadcrumb.title}>
                <NavLink
                  to={breadcrumb.route}
                  className={linkClass}
                  onClick={this._a.bind(this, breadcrumb.route)}
                >
                  {breadcrumb.title}
                </NavLink>
              </div>
              {!lastBread && (
                <div key={`${breadcrumb.title}-caret`}>
                  <ReactSVG src={caret} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }
}

export default Breadcrumbs;
