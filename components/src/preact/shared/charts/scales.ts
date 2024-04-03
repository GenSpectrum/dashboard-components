export type ScaleType = 'linear' | 'logarithmic' | 'logit';

export function getYAxisScale(scaleType: ScaleType) {
    switch (scaleType) {
        case 'linear': {
            return { beginAtZero: true, type: 'linear' as const };
        }
        case 'logarithmic': {
            return { type: 'logarithmic' as const };
        }
        case 'logit':
            return { type: 'logit' as const };
        default:
            return { beginAtZero: true, type: 'linear' as const };
    }
}
