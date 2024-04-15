// colorblind friendly colors taken from https://personal.sron.nl/~pault/

const ColorsRGB = [
    [51, 34, 136],
    [17, 119, 51],
    [136, 204, 238],
    [68, 170, 153],
    [153, 153, 51],
    [221, 204, 119],
    [204, 102, 119],
    [136, 34, 85],
    [170, 68, 153],
];

export const singleGraphColorRGBA = (id: number, alpha = 1) => {
    return `rgba(${ColorsRGB[id % ColorsRGB.length].join(',')},${alpha})`;
};
