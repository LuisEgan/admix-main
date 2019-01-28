import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import Checkbox from "../inputs/Checkbox";

class FormTextInput extends React.PureComponent {
  static propTypes = {
    name: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);

    this.renderField = this.renderField.bind(this);
  }

  renderField(field) {
    const {
      input,
      meta: { error, touched },
    } = field;

    return (
      <Checkbox
        {...input}
        {...this.props}
        id={input.name}
        error={error}
        touched={touched}
      />
    );
  }

  render() {
    return (
      <Field component={this.renderField} type="checkbox" {...this.props} />
    );
  }
}

export default FormTextInput;
