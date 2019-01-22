import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Field, change } from "redux-form";
import Input from "../inputs/TextInput";

class TextInput extends React.PureComponent {
  static propTypes = {
    name: PropTypes.string.isRequired,
    formname: PropTypes.string,
    label: PropTypes.string,
  };

  componentDidMount() {
    const { simulateType, formname, name } = this.props;
    simulateType(formname, name);
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
        touched={touched ? 1 : 0}
      />
    );
  }

  render() {
    return <Field component={this.renderField.bind(this)} {...this.props} />;
  }
}

const mapDispatchToProps = dispatch => ({
  simulateType: (formanme, name) => {
    dispatch(change(formanme, name, "simulate"));
    dispatch(change(formanme, name, null));
  },
});

export default connect(
  null,
  mapDispatchToProps,
)(TextInput);
