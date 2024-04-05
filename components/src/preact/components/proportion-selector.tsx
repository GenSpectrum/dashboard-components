import { type FunctionComponent } from 'preact';

import { MinMaxRangeSlider } from './min-max-range-slider';
import { PercentInput } from './percent-intput';

export type ProportionInterval = { min: number; max: number };

export interface ProportionSelectorProps {
    proportionInterval: ProportionInterval;
    setMinProportion: (minProportion: number) => void;
    setMaxProportion: (maxProportion: number) => void;
}

export const ProportionSelector: FunctionComponent<ProportionSelectorProps> = ({
    proportionInterval,
    setMinProportion,
    setMaxProportion,
}) => {
    const { min: minProportion, max: maxProportion } = proportionInterval;
    return (
        <div class='flex flex-col w-64 mb-2'>
            <div class='flex items-center '>
                <PercentInput
                    percentage={minProportion * 100}
                    setPercentage={(percentage) => setMinProportion(percentage / 100)}
                />
                <div class='m-2'>-</div>
                <PercentInput
                    percentage={maxProportion * 100}
                    setPercentage={(percentage) => setMaxProportion(percentage / 100)}
                />
            </div>
            <div class='my-1'>
                <MinMaxRangeSlider
                    min={minProportion * 100}
                    max={maxProportion * 100}
                    setMin={(percentage) => setMinProportion(percentage / 100)}
                    setMax={(percentage) => setMaxProportion(percentage / 100)}
                />
            </div>
        </div>
    );
};
