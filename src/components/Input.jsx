import React from "react";

const Input = props => {
   const { icon } = props;
   return (
      <div className="input">
         {icon && <div id="input-icon">{icon}</div>}
         <div>
            <input {...props} />
         </div>
      </div>
   );
};

export default Input;
