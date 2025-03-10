import { type FunctionComponent } from 'preact';

import { Select } from './select';
import type { ScaleType } from '../shared/charts/getYAxisScale';

export type ScalingSelectorProps = {
    yAxisScaleType: ScaleType;
    setYAxisScaleType: (scaleType: ScaleType) => void;
    className?: string;
    enabledTypes?: ScaleType[];
};

const scaleTypeItem: { label: string; value: ScaleType }[] = [
    { label: 'Linear', value: 'linear' },
    { label: 'Logarithmic', value: 'logarithmic' },
    { label: 'Logit', value: 'logit' },
];

export const ScalingSelector: FunctionComponent<ScalingSelectorProps> = ({
    yAxisScaleType,
    setYAxisScaleType,
    className,
    enabledTypes,
}) => {
    const items = [
        { label: 'y axis scaling type', value: 'none', disabled: true },
        ...scaleTypeItem.filter((item) => enabledTypes === undefined || enabledTypes.includes(item.value)),
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
            selectStyle={`${className ?? ''} select-xs`}
        />
    );
};
