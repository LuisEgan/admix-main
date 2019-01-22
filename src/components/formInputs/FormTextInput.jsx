import React from "react";
import PropTypes from "prop-types";
import { Field, change } from "redux-form";
import Input from "../inputs/TextInput";

class FormTextInput extends React.PureComponent {
  static propTypes = {
    name: PropTypes.string.isRequired,
    formname: PropTypes.string,
    label: PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.renderField = this.renderField.bind(this);
  }

  renderField(field) {
    const { normalize, simulateType, ...inputProps } = this.props;

    const {
      input,
      meta: { error, touched },
    } = field;

    return (
      <Input
        {...input}
        {...inputProps}
        id={input.name}
        error={error}
        touched={touched}
      />
    );
  }

  render() {
    return <Field component={this.renderField} {...this.props} />;
  }
}

export default FormTextInput;
