import React from "react";
import { Field } from "redux-form";

export default ({
   renderField,
   handleUserUpdate,
   asyncLoading,
   clicked,
   changePassClicked
}) => {
   return (
      <React.Fragment>
         <div>
            <Field name="userName" component={renderField} />
            <Field name="email" component={renderField} />
            <Field name="Password" component={renderField} disabled={true} />
         </div>
         <div>
            <div />
            <div>
               <span className="profile-helper-text">
                  {/* <a onClick={handleUserUpdate.bind(null, "email")}>
                     {asyncLoading && clicked === "email"
                        ? " ...Loading"
                        : " Update email"}
                  </a> */}
               </span>
            </div>
            <div>
               <span className="profile-helper-text">
                  {!changePassClicked && (
                     <a onClick={handleUserUpdate.bind(null, "password")}>
                        {asyncLoading && clicked === "password"
                           ? " ...Loading"
                           : " Change password."}
                     </a>
                  )}

                  {changePassClicked && (
                     <span>
                        {asyncLoading && clicked === "password"
                           ? " ...Loading"
                           : " Check your inbox for the password reset link."}
                     </span>
                  )}
               </span>
            </div>
         </div>
      </React.Fragment>
   );
};
