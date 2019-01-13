import React, { Component } from "react";
import { connect } from "react-redux";
import _a from "../../utils/analytics";
import SVG from "../../components/SVG";
import { updateUser } from "../../actions";

const { ga } = _a;

class Download extends Component {
  constructor(props) {
    super(props);

    this.handleDownload = this.handleDownload.bind(this);
  }

  handleDownload(file) {
    _a.track(ga.actions.download[file], {
      category: ga.categories.download,
    });

    const { updateUser, userData, accessToken } = this.props;

    updateUser(userData._id, { status: 2 }, accessToken);
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
                  href="https://admix.in/wp-content/uploads/2019/01/Admix.Unity_Rev1.5.2_Release.unitypackage"
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
              <span>Admix.Unity_Rev1.5.2_Release.unitypackage</span>
              <span className="subtitle">SIZE</span>
              <span>2MB</span>
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

const mapStateToProps = state => {
  return {
    asyncData: state.app.get("asyncData"),
    asyncError: state.app.get("asyncError"),
    asyncLoading: state.app.get("asyncLoading"),
    accessToken: state.app.get("accessToken"),
    userData: state.app.get("userData"),
  };
};

const mapDispatchToProps = dispatch => ({
  updateUser: (userId, update, accessToken) =>
    dispatch(updateUser(userId, update, accessToken)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Download);
