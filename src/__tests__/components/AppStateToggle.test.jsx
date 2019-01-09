import React from "react";
import { shallow } from "enzyme";
import AppStateToggle from "../../components/AppStateToggle";
import C from "../../utils/constants";

let mockApp = {
  appEngine: "Unity",
  appId: "0d36091c-5f1e-4bcf-b37e-bd446b316a89",
  appState: "inactive",
  bundle: "com.Company.ProductName",
  calculator: { cpm: 20, mau: null, session: null, avg: null },
  cat: [],
  createdAt: "1970-01-18T20:14:49.451Z",
  dau: "asd",
  geos: { eu: null, uk: null, us: null },
  isActive: false,
  metrics: { sessions: null, avgTimePerSession: null, mau: null, dau: "asd" },
  name: "test_1.5",
  platformName: "WindowsEditor",
  reviewed: false,
  scenes: [],
  storeurl: "google.com",
  updatedAt: "2018-11-08T15:07:36.301Z",
  userId: "ef02dcdd-38b1-476c-9d52-c22096c6f0ef",
  _id: "0d36091c-5f1e-4bcf-b37e-bd446b316a89"
};

describe("<AppStateToggle />", () => {
  it("renders", () => {
    const wrapper = shallow(<AppStateToggle />);
    expect(wrapper.find(".appStateToggle").exists()).toBe(true);
  });

  it("dispays live if app's live", () => {
    mockApp.appState = C.APP_STATES.live;
    const wrapper = shallow(<AppStateToggle app={mockApp} />);
    const liveText = wrapper.find("#AppStateToggle-liveText").text();
    expect(liveText).toBe("Live");
  });

  it("dispays pending if app's pending", () => {
    mockApp.appState = C.APP_STATES.pending;
    const wrapper = shallow(<AppStateToggle app={mockApp} />);
    const liveText = wrapper.find("#AppStateToggle-liveText").text();
    expect(liveText).toBe("Pending");
  });
});
