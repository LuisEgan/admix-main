export const onlyNums = value => {
  if (!value) {
    return value;
  }

  return +value.replace(/[^\d]/g, "");
};

export const lowerCase = value => value && value.toLowerCase();
