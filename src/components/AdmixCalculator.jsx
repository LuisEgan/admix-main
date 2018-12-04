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

      this.state = {
         cpm: 20,
         mau: 0,
         session: 0,
         avg: 0
      };

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

   render() {
      const { cpm, mau, session, avg } = this.state;

      this.impressions = mau * session * avg;
      this.revenue = (this.impressions * cpm) / 1000;
      this.admixCut = this.revenue / 5;
      this.expected = this.revenue - this.admixCut;

      return (
         <div className="admix-calculator">
            <div>Expected CPM ($)</div>
            <div>
               <Input
                  type="number"
                  name="cpm"
                  onChange={this.changeInput}
                  value={cpm}
               />
            </div>

            <div>MAU</div>
            <div>
               <Input
                  type="number"
                  name="mau"
                  onChange={this.changeInput}
                  value={mau}
               />
            </div>

            <div>Session per user / month</div>
            <div>
               <Input
                  type="number"
                  name="session"
                  onChange={this.changeInput}
                  value={session}
               />
            </div>

            <div>Avg ads per session</div>
            <div>
               <Input
                  type="number"
                  name="avg"
                  onChange={this.changeInput}
                  value={avg}
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
