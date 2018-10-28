import React from "react";

class Input extends React.Component {
   constructor(props) {
      super(props);

      this.state = {
         focused: false
      };

      this.onFocus = this.onFocus.bind(this);
      this.forceFocus = this.forceFocus.bind(this);
   }

   onFocus() {
      const { onFocus, onBlur } = this.props;
      const { focused } = this.state;

      onFocus && onFocus();
      onBlur && onBlur();

      this.setState({ focused: !focused });
   }

   forceFocus() {
      this.input.focus();
   }

   render() {
      const { icon, rootstyle } = this.props;
      const { focused } = this.state;
      const inputStyle = focused ? { borderColor: "#14B9BE" } : rootstyle;

      return (
         <div className="input" style={inputStyle} onClick={this.forceFocus}>
            {icon && <div id="input-icon">{icon}</div>}
            <div>
               <input
                  {...this.props}
                  ref={i => {
                     this.input = i;
                  }}
                  onFocus={this.onFocus}
                  onBlur={this.onFocus}
               />
            </div>
         </div>
      );
   }
}

export default Input;
