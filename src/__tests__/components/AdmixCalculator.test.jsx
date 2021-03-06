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

/*
 * TEST INFO
 * Functionality: The AdmixCalculator component
 * Given: On the /info on the calculator tab
 */

const initialValues = {
  cpm: 20,
  mau: 0,
  session: 0,
  avg: 0
};

const props = {
  ...initialValues
};

const cpmTestInput = 23432;
const mauTestInput = 123423;
const avgTestInput = 123125;
const sessionTestInput = 23423532;

const impressionsTestRes = mauTestInput * avgTestInput * sessionTestInput;
const revenueTestRes = (impressionsTestRes * cpmTestInput) / 1000;
const admixCutTestRes = revenueTestRes / 5;
const expectTestRes = revenueTestRes - admixCutTestRes;

let wrapper, store, calculatorWrapper, cpm, mau, avg, session;

describe("------- <AdmixCalculator />", () => {
  beforeEach(() => {
    store = createStore(combineReducers({ form: formReducer }));
    wrapper = mount(
      <Provider store={store}>
        <AdmixCalculator {...props} />
      </Provider>
    );
    calculatorWrapper = wrapper.find("AdmixCalculator");
    cpm = calculatorWrapper.find("input[name='cpm']");
    mau = calculatorWrapper.find("input[name='mau']");
    avg = calculatorWrapper.find("input[name='avg']");
    session = calculatorWrapper.find("input[name='session']");

    cpm.instance().value = cpmTestInput;
    cpm.simulate("change");

    mau.instance().value = mauTestInput;
    mau.simulate("change");

    session.instance().value = sessionTestInput;
    session.simulate("change");

    avg.instance().value = avgTestInput;
    avg.simulate("change");
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it("renders Provider component which wrapps the AdmixCalculator component and holds the redux state properly", () => {
    /*
     * When: Initialization
     */
    expect(wrapper.length).toEqual(1);
  });

  it("render the proper inputs with their proper name", () => {
    /*
     * When: Initialization
     */
    expect(cpm.exists()).toBeTruthy();
    expect(mau.exists()).toBeTruthy();
    expect(session.exists()).toBeTruthy();
    expect(avg.exists()).toBeTruthy();
  });

  it("render the proper inputs with their proper id", () => {
    /*
     * When: Initialization
     */

    const impressions = calculatorWrapper.find("#impressions");
    expect(impressions.exists()).toBeTruthy();

    const revenue = calculatorWrapper.find("#revenue");
    expect(revenue.exists()).toBeTruthy();

    const admixCut = calculatorWrapper.find("#admixCut");
    expect(admixCut.exists()).toBeTruthy();

    const expected = calculatorWrapper.find("#expected");
    expect(expected.exists()).toBeTruthy();
  });

  // * ---------- Impressions

  it("shows impressions correctly on input", () => {
    /*
     * When: user inputs values the correct calculation is displayed
     */

    const impressions = calculatorWrapper.find("#impressions");
    const expectedResult = `${impressionsTestRes.toFixed(2)}`;
    expect(impressions.text()).toEqual(expectedResult);
  });

  // * ---------- Revenue

  it("shows revenue correctly on input", () => {
    /*
     * When: user inputs values the correct calculation is displayed
     */

    const revenue = calculatorWrapper.find("#revenue");
    const expectedResult = `$ ${revenueTestRes.toFixed(2)}`;
    expect(revenue.text()).toEqual(expectedResult);
  });

  // * ---------- Admix cut

  it("shows admixCut correctly on input", () => {
    /*
     * When: user inputs values the correct calculation is displayed
     */

    const admixCut = calculatorWrapper.find("#admixCut");
    const expectedResult = `$ ${admixCutTestRes.toFixed(2)}`;
    expect(admixCut.text()).toEqual(expectedResult);
  });

  // * ---------- Expected

  it("shows expected correctly on input", () => {
    /*
     * When: user inputs values the correct calculation is displayed
     */

    const expected = calculatorWrapper.find("#expected");
    const expectedResult = `$ ${expectTestRes.toFixed(2)}`;
    expect(expected.text()).toEqual(expectedResult);
  });
});
