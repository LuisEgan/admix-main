import React from "react";

class Input extends React.Component {
   constructor(props) {
      super(props);

      this.state = {
         focused: false
      };

      this.onFocus = this.onFocus.bind(this);
   }

   onFocus() {
      const { onFocus, onBlur } = this.props;
      const { focused } = this.state;

      onFocus && onFocus();
      onBlur && onBlur();

      this.setState({ focused: !focused });
   }

   render() {
      const { icon, rootstyle } = this.props;
      const { focused } = this.state;
      const inputStyle = focused ? { borderColor: "#14B9BE" } : rootstyle;

      return (
         <div className="input" style={inputStyle}>
            {icon && <div id="input-icon">{icon}</div>}
            <div>
               <input
                  {...this.props}
                  onFocus={this.onFocus}
                  onBlur={this.onFocus}
               />
            </div>
         </div>
      );
   }
}

export default Input;
