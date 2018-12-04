export const onlyNums = value => {
    if (!value) {
        return value
    }

    return value.replace(/[^\d]/g, '');
}