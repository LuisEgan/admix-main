import React from "react";

// [All options]
//[[Set of options]]

const regions = {
   eu: [["IBAN"]],
   uk: [["Sort Code", "Account Number"], ["IBAN"]],
   usa: [["Routing Number"]]
};

const BankDetails = ({ Field, renderField, region }) => {
   const details = regions[region].map((r, regionsIndex) => {
      let detail = [];

      r.forEach(setItem => {
         detail.push(
            <Field key={setItem} name={setItem} component={renderField} />
         );
      });

      if (regionsIndex !== regions[region].length - 1) {
         detail.push(
            <div
               className="or-separator"
               key={`${regions[region].length}-${regions[region]}`}
            >
               <h2 className="mb"> - OR - </h2>
            </div>
         );
      }

      return detail;
   });

   return <React.Fragment>{details}</React.Fragment>;
};

export default BankDetails;
