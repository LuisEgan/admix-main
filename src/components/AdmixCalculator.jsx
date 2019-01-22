import React from "react";
import { connect } from "react-redux";
import { Field, reduxForm } from "redux-form";
import Input from "./inputs/TextInput";
import { onlyNums } from "../utils/normalizers";

export class AdmixCalculator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      impressions: 0,
      revenue: 0,
      admixCut: 0,
      expected: 0
    };

    this.updateInput = this.updateInput.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let newState = {};

    const { admixCalculatorForm } = nextProps;
    const values = { ...admixCalculatorForm };
    const { cpm, mau, session, avg } = values;

    if (
      cpm !== prevState.cpm &&
      mau !== prevState.mau &&
      session !== prevState.session &&
      avg !== prevState.avg
    ) {
      newState.impressions = `${(mau * session * avg).toFixed(2)}`;
      newState.revenue = `${((newState.impressions * cpm) / 1000).toFixed(2)}`;
      newState.admixCut = `${(newState.revenue / 5).toFixed(2)}`;
      newState.expected = `${(newState.revenue - newState.admixCut).toFixed(
        2
      )}`;
    }

    return newState;
  }

  updateInput(e) {
    const { admixCalculatorForm } = this.props;
    const {
      target: { value, name }
    } = e;

    const values = { ...admixCalculatorForm };
    values[name] = onlyNums(value);

    const { cpm, mau, session, avg } = values;
    const newState = { ...this.state };

    newState.impressions = `${(mau * session * avg).toFixed(2)}`;
    newState.revenue = `${((newState.impressions * cpm) / 1000).toFixed(2)}`;
    newState.admixCut = `${(newState.revenue / 5).toFixed(2)}`;
    newState.expected = `${(newState.revenue - newState.admixCut).toFixed(2)}`;

    this.setState(newState);
  }

  renderField(field) {
    const { input } = field;

    return <Input {...input} id={input.name} />;
  }

  render() {
    const { impressions, revenue, admixCut, expected } = this.state;

    return (
      <div className="admix-calculator">
        <div>Expected CPM ($)</div>
        <div>
          <Field
            component={this.renderField}
            name="cpm"
            normalize={onlyNums}
            onChange={this.updateInput}
          />
        </div>

        <div>MAU</div>
        <div>
          <Field
            component={this.renderField}
            name="mau"
            normalize={onlyNums}
            onChange={this.updateInput}
          />
        </div>

        <div>Session per user / month</div>
        <div>
          <Field
            component={this.renderField}
            name="session"
            normalize={onlyNums}
            onChange={this.updateInput}
          />
        </div>

        <div>Avg ads per session</div>
        <div>
          <Field
            component={this.renderField}
            name="avg"
            normalize={onlyNums}
            onChange={this.updateInput}
          />
        </div>

        <div id="admixCalc-impressions">Impressions generated</div>
        <div id="impressions">{impressions}</div>

        <div>Gross revenue ($)</div>
        <div id="revenue">$ {revenue}</div>

        <div>Admix 20% cut ($)</div>
        <div id="admixCut">$ {admixCut}</div>

        <div id="admixCalc-expected">Your expected monthly revenue</div>
        <div id="expected">$ {expected}</div>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  const { initialValues } = props;
  const {
    form: { admixCalculatorForm }
  } = state;

  return {
    initialValues: {
      cpm: 20,
      mau: 0,
      session: 0,
      avg: 0,
      ...initialValues
    },
    admixCalculatorForm: admixCalculatorForm ? admixCalculatorForm.values : {}
  };
};

const formConfig = {
  form: "admixCalculatorForm"
};

AdmixCalculator = reduxForm(formConfig)(AdmixCalculator);
AdmixCalculator = connect(mapStateToProps)(AdmixCalculator);

export default AdmixCalculator;
