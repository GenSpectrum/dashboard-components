import { FunctionComponent } from 'preact';
import { Select } from './select';
import type { ScaleType } from '../../components/charts/getYAxisScale';

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
    return (
        <Select
            items={[
                { label: 'Linear', value: 'linear' },
                { label: 'Logarithmic', value: 'logarithmic' },
                { label: 'Logit', value: 'logit' },
            ]}
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
