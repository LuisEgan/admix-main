import React from "react";
import { Field } from "redux-form";

export default ({ renderField }) => {
  return (
    <React.Fragment>
      <div id="profile-company">
        <Field name="companyName" component={renderField} />
        <Field name="registeredNumber" component={renderField} />
        <Field name="VAT" component={renderField} />
        <Field name="address1" component={renderField} />
        <Field name="address2" component={renderField} />
        <Field name="city" component={renderField} />
        <Field name="country" component={renderField} />
        <Field name="postcode" component={renderField} />
      </div>
    </React.Fragment>
  );
};
