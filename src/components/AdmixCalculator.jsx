import React from "react";
import { connect } from "react-redux";
import { Field, reduxForm } from "redux-form";
import Input from "./inputs/TextInput";
import { onlyNums } from "../utils/normalizers";
import STR from "../utils/strFuncs";

export class AdmixCalculator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      impressions: 0,
      revenue: 0,
      admixCut: 0,
      expected: 0,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let newState = {};

    const { admixCalculatorForm } = nextProps;
    const values = { ...admixCalculatorForm };
    const { cpm, mau, session, avg } = values;
    console.log("cpm: ", cpm);

    if (
      cpm !== prevState.cpm &&
      mau !== prevState.mau &&
      session !== prevState.session &&
      avg !== prevState.avg
    ) {
      newState.impressions = Math.round(mau * session * avg) * 0.25;
      newState.revenue = Math.round((newState.impressions * cpm) / 1000);
      newState.admixCut = Math.round(newState.revenue / 5);
      newState.expected = Math.round(newState.revenue - newState.admixCut);
    }

    return newState;
  }

  renderField(field) {
    const { input } = field;

    return <Input {...input} id={input.name} />;
  }

  render() {
    const { impressions, revenue, admixCut, expected } = this.state;

    return (
      <div className="admix-calculator">
        <div>Monthly Active Users for this app</div>
        <div>
          <Field component={this.renderField} name="mau" normalize={onlyNums} />
        </div>

        <div>Average number of Session / User / Month</div>
        <div>
          <Field
            component={this.renderField}
            name="session"
            normalize={onlyNums}
          />
        </div>

        <div>Number of ads placed in your app</div>
        <div>
          <Field component={this.renderField} name="avg" normalize={onlyNums} />
        </div>

        <div id="admixCalc-impressions">Average Impressions generated</div>
        <div id="impressions">{STR.numberWithCommas(impressions)}</div>

        <div>Gross revenue ($)</div>
        <div id="revenue">$ {STR.numberWithCommas(revenue)}</div>

        <div>Admix 20% cut ($)</div>
        <div id="admixCut">$ {STR.numberWithCommas(admixCut)}</div>

        <div id="admixCalc-expected">Your expected monthly revenue</div>
        <div id="expected">$ {STR.numberWithCommas(expected)}</div>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  const { initialValues } = props;
  const {
    form: { admixCalculatorForm },
  } = state;

  return {
    initialValues: {
      mau: 0,
      session: 0,
      avg: 0,
      ...initialValues,
      cpm: 10,
    },
    admixCalculatorForm: admixCalculatorForm ? admixCalculatorForm.values : {},
  };
};

const formConfig = {
  form: "admixCalculatorForm",
};

AdmixCalculator = reduxForm(formConfig)(AdmixCalculator);
AdmixCalculator = connect(mapStateToProps)(AdmixCalculator);

export default AdmixCalculator;
