export type ScaleType = 'linear' | 'logarithmic' | 'logit';

export function getYAxisScale(scaleType: ScaleType) {
    switch (scaleType) {
        case 'linear': {
            return { beginAtZero: true, type: 'linear' as const, min: 0, max: 1 };
        }
        case 'logarithmic': {
            return { type: 'logarithmic' as const, max: 1 };
        }
        case 'logit':
            return { type: 'logit' as const };
    }
}
