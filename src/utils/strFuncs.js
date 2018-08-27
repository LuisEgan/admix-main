import C from './constants';

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
    return /^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/.test(str);
    //    return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(
    //       str
    //    );
};

const capitalizeFirstLetter = str => {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const withoutPrefix = str => {
    return str.replace(
        C.ADMIX_OBJ_PREFIX,
        ""
    );
}

const getFirstUpper = str => {
    for (let i = 0; i < str.length; i++) {
       if (str.charAt(i) === str.charAt(i).toUpperCase()) {
          return i;
       }
    }
    return -1;
 };

 const numberWithCommas = x => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
 };

export default {
    isAtleast,
    hasLetter,
    hasOnlyLetters,
    hasNumber,
    isValidEmail,
    capitalizeFirstLetter,
    withoutPrefix,
    getFirstUpper,
    numberWithCommas
};