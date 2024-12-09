import z from 'zod';

export interface YAxisMaxConfig {
    linear?: AxisMax;
    logarithmic?: AxisMax;
}

export const axisMaxSchema = z.union([z.literal('maxInData'), z.literal('limitTo1'), z.number()]);
export type AxisMax = z.infer<typeof axisMaxSchema>;

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
