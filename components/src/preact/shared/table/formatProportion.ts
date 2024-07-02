export const formatProportion = (proportion: number, digits: number = 2) => {
    return `${(proportion * 100).toFixed(digits)}%`;
};
