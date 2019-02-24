import React, { Component } from "react";
import { connect } from "react-redux";
import _a from "../../utils/analytics";
import SVG from "../../components/SVG";
import actions from "../../actions";

const { ga } = _a;

const { updateUser } = actions;
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

    const updaUserObj = {
      userId: userData._id,
      newData: {
        status: 2,
      },
      accessToken,
      noSetAsync: true,
    };

    updateUser(updaUserObj);
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
                  href="https://admix.in/wp-content/uploads/2019/02/Admix.Unity_Rev1.6.2_Release.unitypackage"
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
                <span className="mb" style={{ width: "100%" }}>
                  Here is how to get started with Admix in less than 3 minutes
                  <iframe
                    width="560"
                    height="315"
                    src="https://www.youtube.com/embed/E1Vu6vVbcKU"
                    frameborder="0"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                  />
                </span>
              </div>
              <div>
                <span className="mb">
                  More questions? <br />{" "}
                  <a href="mailto:support@admix.in">Contact support</a>
                </span>
              </div>
            </div>
          </div>

          <div className="mb download-bottom-section">
            <div>
              <span className="subtitle">VERSION</span>
              <span>Admix.Unity_Rev1.6.2_Release.unitypackage</span>
              <span className="subtitle">SIZE</span>
              <span>4MB</span>
              <span className="subtitle">REQUIREMENTS</span>
              <span>Unity 2017.4.21f1 LTS and above</span>
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
  const {
    app,
    async: { asyncMessage, asyncError, asyncLoading },
  } = state;

  return {
    ...app,
    asyncMessage,
    asyncError,
    asyncLoading,
  };
};

const mapDispatchToProps = dispatch => ({
  updateUser: ({ userId, newData, accessToken }) =>
    dispatch(updateUser({ userId, newData, accessToken, noSetAsync: true })),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Download);
