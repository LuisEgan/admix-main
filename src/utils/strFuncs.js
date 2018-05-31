const isAtleast = (str, limit) => {
   return str.length >= limit;
};

const hasLetter = str => {
   return /[a-z]/i.test(str);
};

const hasOnlyLetters = str => {
   return !/[^a-z]/i.test(str);
};

const hasNumber = str => {
   return /\d/.test(str);
};

const isValidEmail = str => {
   return /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(
      str
   );
   //    return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(
   //       str
   //    );
};

export default {
   isAtleast,
   hasLetter,
   hasOnlyLetters,
   hasNumber,
   isValidEmail
};
