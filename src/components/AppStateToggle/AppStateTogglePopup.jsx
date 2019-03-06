import React from "react";
import { connect } from "react-redux";
import { reduxForm } from "redux-form";
import validate from "validate.js";
import TextInput from "../formInputs/FormTextInput";

class AppStateTogglePopup extends React.Component {
  handleSubmit = values => {
    const { handleSubmitForReview } = this.props;

    handleSubmitForReview(values);
  };

  render() {
    const { handleSubmit, asyncLoading, togglePopup } = this.props;

    return (
      <form onSubmit={handleSubmit(this.handleSubmit)}>
        <span className="popup-title">Ready to go live?</span>
        <br />
        <span className="popup-text">
          To go Live, your app needs to be published on a Store
        </span>
        <br />
        <br />
        <TextInput
          name="storeurl"
          label="Your app URL"
          placeholder="Your app store URL here (Google Play Store, Steam)"
        />
        <br />
        <span className="popup-text">
          Next, your app will be pending review
        </span>
        <br />
        <span className="mbs" style={{ fontWeight: "normal" }}>
          We'll make some final checks to make sure it is setup properly. This
          can take up to 2h. After that, your app will become Live and you'll
          start to make revenue{" "}
          <span role="img" aria-label="wohoo">
            🎉
          </span>
        </span>
        <br />
        <br />
        <span className="popup-btns">
          {asyncLoading && (
            <button className="btn" id="review-btn" type="button">
              Loading...
            </button>
          )}

          {!asyncLoading && (
            <button className="btn" id="review-btn">
              Submit for review
            </button>
          )}

          <button
            className="cancel-btn mb"
            id="cancel-btn"
            onClick={togglePopup}
            type="button"
          >
            Cancel
          </button>
        </span>
      </form>
    );
  }
}

const validateForm = values => {
  const errors = {};
  let { storeurl } = values;

  if (!storeurl) {
    errors.storeurl = "Store URL is needed!";
  }

  storeurl =
    storeurl && storeurl.indexOf("http") < 0 ? "https://" + storeurl : storeurl;

  const notValid = validate({ website: storeurl }, { website: { url: true } });

  if (notValid && storeurl !== "") {
    errors.storeurl = notValid.website[0];
  }

  return errors;
};

const formConfig = {
  form: "AppStateToggleForm",
  validate: validateForm,
};

const mapStateToProps = (state, props) => {
  const {
    app: { storeurl },
  } = props;
  const initialValues = { storeurl };

  return { initialValues };
};

AppStateTogglePopup = reduxForm(formConfig)(AppStateTogglePopup);
AppStateTogglePopup = connect(mapStateToProps)(AppStateTogglePopup);

export default AppStateTogglePopup;
