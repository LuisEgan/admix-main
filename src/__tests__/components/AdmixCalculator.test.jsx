import React from "react";
import { shallow, mount } from "enzyme";
import configureMockStore from "redux-mock-store";
import { reducer as formReducer } from "redux-form";
import { Provider } from "react-redux";
import { createStore, combineReducers } from "redux";
import { reduxForm } from "redux-form";
import thunk from "redux-thunk";
import __conn_AdmixCalculator, {
  AdmixCalculator
} from "../../components/AdmixCalculator";

let wrapper, store;

const initialValues = {
  cpm: 20,
  mau: 0,
  session: 0,
  avg: 0
};

const props = {
  ...initialValues
};

const Test = () => {
  return (
    <div>
      <div id="a">
        <input type="text" name="input_a" />
        <input type="text" name="input_b" value="20" />
      </div>
    </div>
  );
};

describe("------- <AdmixCalculator />", () => {
  beforeEach(() => {
    store = createStore(combineReducers({ form: formReducer }));
    wrapper = mount(
      <Provider store={store}>
        <AdmixCalculator {...props} />
      </Provider>
    );
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it("renders properly", () => {
    expect(wrapper.length).toEqual(1);
  });

  it("calcs impressions correctly on input", () => {
    const calculatorWrapper = wrapper.find("AdmixCalculator");

    const cpm = calculatorWrapper.find("input[name='cpm']");
    expect(cpm.exists()).toBeTruthy();

    const mau = calculatorWrapper.find("input[name='mau']");
    expect(mau.exists()).toBeTruthy();

    const session = calculatorWrapper.find("input[name='session']");
    expect(session.exists()).toBeTruthy();

    const avg = calculatorWrapper.find("input[name='avg']");
    expect(avg.exists()).toBeTruthy();

    const impressions = calculatorWrapper.find("#impressions-generated");
    expect(impressions.exists()).toBeTruthy();

    cpm.instance().value = 90;
    cpm.simulate("change");

    mau.instance().value = 90;
    mau.simulate("change");

    session.instance().value = 90;
    session.simulate("change");

    avg.instance().value = 90;
    avg.simulate("change");

    expect(impressions.text()).toEqual((90 * 90 * 90).toString());
  });


  it("calcs impressions generated", () => {
    const impressionsResult = wrapper.find("#impressions-generated").text();
    expect(impressionsResult).toEqual("0");
  });
});
