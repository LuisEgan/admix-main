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

const formatDate = date => {
    return `${date.getDate()} / ${date.getMonth()+1} / ${date.getFullYear()}`
}

const formatSceneDate = date => {
    const zSplit = date.split("Z");
    const tSplit = zSplit[0].split("T");
    const colonSplit = tSplit[1].split(":");
    return `${tSplit[0]} @${colonSplit[0]}:${colonSplit[1]}`
}

const parsePathName = path => {
    return capitalizeFirstLetter(path.split("/")[1]);
}

const appStateToNumber = appState => {
    return appState === "inactive" ? 0 : appState === "live" ? 1 : 2;
}

export default {
    isAtleast,
    hasLetter,
    hasOnlyLetters,
    hasNumber,
    isValidEmail,
    capitalizeFirstLetter,
    withoutPrefix,
    getFirstUpper,
    numberWithCommas,
    formatDate,
    formatSceneDate,
    parsePathName,
    appStateToNumber
};