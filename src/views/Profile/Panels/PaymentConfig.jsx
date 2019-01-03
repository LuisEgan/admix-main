import React from "react";
import { Field } from "redux-form";

import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import Select from "@material-ui/core/Select";
import Input from "@material-ui/core/Input";
import { KeyboardArrowDown } from "@material-ui/icons";
import Checkbox from "@material-ui/core/Checkbox";
import Tooltip from "@material-ui/core/Tooltip";

import FontAwesomeIcon from "@fortawesome/react-fontawesome";

import CSS from "../../../utils/InLineCSS";

import BankDetails from "../BankDetails";
import paypal from "../../../assets/img/paypal.png";

const regions = [
  { title: <em>Please select a region</em>, value: "" },
  { title: "United States of America", value: "usa" },
  { title: "United Kingdom", value: "uk" },
  { title: "Europe", value: "eu" }
];

export default class PaymentConfig extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      invoiceCheck: false,
      oninvoiceCheck: false
    };

    this.handleInvoiceCheck = this.handleInvoiceCheck.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // TODO update invoiceCheck state from DB value
    return null;
  }

  handleInvoiceCheck() {
    const { invoiceCheck } = this.state;
    this.setState({ invoiceCheck: !invoiceCheck });
  }

  render() {
    const {
      renderField,
      paymentChange,
      payment,
      paypalEmailStyle,
      payBanksStyle,
      payBanksDetailsStyle
    } = this.props;

    const { invoiceCheck, oninvoiceCheck } = this.state;

    return (
      <React.Fragment>
        <Tooltip
          title="By ticking this box you’ll be paid automatically every month if your
       balance exceeds $500"
          placement="right"
          classes={{ tooltip: { maxWidth: "50px" } }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={invoiceCheck}
                onChange={this.handleInvoiceCheck}
                value="invoiceCheck"
                color="primary"
              />
            }
            label="Generate automatic invoices"
          />
        </Tooltip>

        <RadioGroup
          aria-label="paymentOpts"
          name="paymentOpts"
          value={payment.option}
          onChange={paymentChange.bind(null, "option")}
          className="paymentOpts"
        >
          <FormControlLabel
            value="paypal"
            control={<Radio className="mui-radio-btn" />}
            label={<img src={paypal} alt="paypal" />}
          />
          <FormControlLabel
            value="bank"
            control={<Radio className="mui-radio-btn" />}
            label={
              <React.Fragment>
                <FontAwesomeIcon icon="university" /> Bank
              </React.Fragment>
            }
          />
        </RadioGroup>

        <div style={paypalEmailStyle}>
          <Field name="paypalEmail" component={renderField} />
        </div>

        <div id="profile-pay-banks" style={payBanksStyle} className="fadeIn mb">
          <FormControl>
            <div className="input-label">Region</div>
            <Select
              value={payment.region}
              onChange={paymentChange.bind(null, "region")}
              input={<Input name="region" id="region-helper" />}
              classes={{ root: "mui-select-root" }}
              disableUnderline={true}
              IconComponent={KeyboardArrowDown}
              style={CSS.mb}
            >
              {regions.map(region => (
                <MenuItem
                  key={region.value}
                  style={CSS.mb}
                  value={region.value}
                >
                  {region.title}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              Don't see your country yet? You can always use PayPal in the
              meantime{" "}
              <span role="img" aria-label="thumbs-up">
                👍
              </span>
            </FormHelperText>
          </FormControl>

          {payment.region !== "" && (
            <div
              id="profile-pay-banks-details"
              style={payBanksDetailsStyle}
              className="fadeIn"
            >
              <BankDetails
                Field={Field}
                renderField={renderField}
                region={payment.region}
              />
            </div>
          )}
        </div>
      </React.Fragment>
    );
  }
}
