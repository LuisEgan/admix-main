import React from "react";

const ToggleButton = ({
   inputName,
   isChecked,
   onChange,
   root1class,
   root2class,
   labelClass,
   labelStyle
}) => {
   root1class = root1class ? root1class : "";
   root2class = root2class ? root2class : "";
   labelClass = labelClass ? labelClass : "";
   return (
      <div className={`toggleBtn ${root1class}`}>
         <div className={`toggles ${root2class}`}>
            <input
               type="checkbox"
               style={{ display: "none" }}
               name={inputName}
               id={inputName}
               className="ios-toggle"
               checked={isChecked}
               onChange={onChange}
            />
            <label
               htmlFor={inputName}
               className={`checkbox-label ${labelClass}`}
               style={labelStyle}
               //   data-on={dataOn}
               //   data-off="Inactive"
            />
         </div>
      </div>
   );
};

export default ToggleButton;
