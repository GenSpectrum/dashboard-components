import { type FunctionComponent } from 'preact';

import { Select } from './select';
import type { ScaleType } from '../shared/charts/getYAxisScale';

export type ScalingSelectorProps = {
    yAxisScaleType: ScaleType;
    setYAxisScaleType: (scaleType: ScaleType) => void;
    className?: string;
};

export const ScalingSelector: FunctionComponent<ScalingSelectorProps> = ({
    yAxisScaleType,
    setYAxisScaleType,
    className,
}) => {
    const items = [
        { label: 'y axis scaling type', value: 'none', disabled: true },
        { label: 'Linear', value: 'linear' },
        { label: 'Logarithmic', value: 'logarithmic' },
        { label: 'Logit', value: 'logit' },
    ];

    return (
        <Select
            items={items}
            selected={yAxisScaleType}
            onChange={(event: Event) => {
                const select = event.target as HTMLSelectElement;
                const value = select.value as ScaleType;
                setYAxisScaleType(value);
            }}
            selectStyle={`${className} select-xs select-bordered`}
        />
    );
};
