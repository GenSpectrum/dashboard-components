import z from 'zod';

/*
 * calculateWilsonInterval calculates the Wilson score interval for 95% confidence.
 *This function is based on https://github.com/erikfox/wilson-interval, but without high precision math.
 * observed - number of observed positive outcomes
 * sample - number of experiments or size of the sample
 */
export function wilson95PercentConfidenceInterval(observed: number, sample: number) {
    const p = observed / sample;
    const n = sample;
    const z = 1.9599639715843482;

    const numerator = p + (z * z) / (2 * n);
    const w_plus_minus = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * (n * n)));
    const denominator = 1 + (z * z) / n;

    return {
        lowerLimit: (numerator - w_plus_minus) / denominator,
        upperLimit: (numerator + w_plus_minus) / denominator,
    };
}

export const confidenceIntervalDataLabel = (
    value: number,
    lowerLimit?: number,
    upperLimit?: number,
    prefix?: string,
) => {
    const label = prefix ? `${prefix}: ` : '';

    return `${label}${value.toFixed(3)} (${lowerLimit?.toFixed(3)} - ${upperLimit?.toFixed(3)})`;
};

export const confidenceIntervalMethodSchema = z.union([z.literal('wilson'), z.literal('none')]);
export type ConfidenceIntervalMethod = z.infer<typeof confidenceIntervalMethodSchema>;
