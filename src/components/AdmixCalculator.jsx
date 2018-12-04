import React from "react";
import { connect } from "react-redux";
import { Field, reduxForm } from "redux-form";
import Input from "./Input";

class AdmixCalculator extends React.Component {
   constructor(props) {
      super(props);

      this.impressions = 0;
      this.revenue = 0;
      this.admixCut = 0;
      this.expected = 0;

      this.changeInput = this.changeInput.bind(this);
   }

   changeInput(e) {
      const { state } = this;
      const { exportValuesOnChange } = this.props;
      const {
         target: { value, name }
      } = e;
      state[name] = +value;
      this.setState(state, () => {
         exportValuesOnChange(state);
      });
   }

   renderField(field) {
      const {
         input,
         meta: { error }
      } = field;

      return (
         <div className="redux-form-inputs-container">
            <Input
               {...input}
               id={input.name}
            />
         </div>
      );
   }

   render() {
      // this.impressions = mau * session * avg;
      // this.revenue = (this.impressions * cpm) / 1000;
      // this.admixCut = this.revenue / 5;
      // this.expected = this.revenue - this.admixCut;

      return (
         <div className="admix-calculator">
            <div>Expected CPM ($)</div>
            <div>
               <Field
                  component={this.renderField}
                  name="cpm"
               />
            </div>

            <div>MAU</div>
            <div>
            <Field
                  component={this.renderField}
                  name="mau"
               />
            </div>

            <div>Session per user / month</div>
            <div>
            <Field
                  component={this.renderField}
                  name="session"
               />
            </div>

            <div>Avg ads per session</div>
            <div>
            <Field
                  component={this.renderField}
                  name="avg"
               />
            </div>

            <div id="admixCalc-impressions">Impressions generated</div>
            <div>{this.impressions}</div>

            <div>Gross revenue ($)</div>
            <div>$ {this.revenue}</div>

            <div>Admix 20% cut ($)</div>
            <div>$ {this.admixCut}</div>

            <div id="admixCalc-expected">Your expected monthly revenue</div>
            <div>$ {this.expected}</div>
         </div>
      );
   }
}

const mapStateToProps = (state, props) => {
   const { initialValues } = props;

   return {
      initialValues: {
         cpm: 20,
         mau: 0,
         session: 0,
         avg: 0,
         ...initialValues
      }
   };
};

const formConfig = {
   form: "admixCalculatorForm"
};

AdmixCalculator = reduxForm(formConfig)(AdmixCalculator);
AdmixCalculator = connect(mapStateToProps)(AdmixCalculator);

export default AdmixCalculator;
