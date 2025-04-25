// colorblind friendly colors taken from https://personal.sron.nl/~pault/

export const ColorsRGB = {
    indigo: [51, 34, 136],
    green: [17, 119, 51],
    cyan: [136, 204, 238],
    teal: [68, 170, 153],
    olive: [153, 153, 51],
    sand: [221, 204, 119],
    rose: [204, 102, 119],
    wine: [136, 34, 85],
    purple: [170, 68, 153],
};

export type GraphColor = keyof typeof ColorsRGB;

export const singleGraphColorRGBAById = (id: number, alpha = 1) => {
    const keys = Object.keys(ColorsRGB) as GraphColor[];
    const key = keys[id % keys.length];

    return singleGraphColorRGBByName(key, alpha);
};

export const singleGraphColorRGBByName = (name: GraphColor, alpha = 1) => {
    return `rgba(${ColorsRGB[name].join(',')},${alpha})`;
};
