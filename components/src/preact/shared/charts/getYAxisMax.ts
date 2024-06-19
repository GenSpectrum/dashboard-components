export interface YAxisMaxConfig {
    linear?: AxisMax;
    logarithmic?: AxisMax;
}

export type AxisMax = 'maxInData' | 'limitTo1' | number;

export const getYAxisMax = (maxInData: number, axisMax?: AxisMax) => {
    if (!axisMax) {
        return 1;
    }

    switch (axisMax) {
        case 'limitTo1': {
            return maxInData > 1 ? 1 : maxInData;
        }
        case 'maxInData': {
            return maxInData;
        }
        default: {
            return axisMax;
        }
    }
};
