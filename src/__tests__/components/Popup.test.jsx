import React from "react";
import { shallow, mount } from "enzyme";
import Popup from "../../components/Popup";

describe("<Popup />", () => {
  it("does not render Popup initially", () => {
    const wrapper = shallow(<Popup />);
    expect(wrapper.find(".popup").exists()).toBe(false);
  });

  it("does render only when showPopup prop is true", () => {
    const wrapper = shallow(<Popup showPopup={false} />);
    expect(wrapper.get(0)).toBeNull();

    wrapper.setProps({ showPopup: true });
    expect(wrapper.find(".popup").length).toBe(1);
  });

  it("matches snapshot", () => {
    const wrapper = shallow(<Popup showPopup={true} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("runs togglePopup() when the background is clicked if togglePopup prop exists", () => {
    const mockTogglePopup = jest.fn();

    const wrapper = shallow(
      <Popup showPopup={true} togglePopup={mockTogglePopup} />
    );
    const bg = wrapper.find(".popup-bg");
    bg.simulate("click");

    expect(mockTogglePopup.mock.calls.length).toEqual(1);
  });
});
