import { FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';
import { MinMaxRangeSlider } from './min-max-range-slider';
import { PercentInput } from './percent-intput';

export interface ProportionSelectorProps {}

export const ProportionSelector: FunctionComponent<ProportionSelectorProps> = () => {
    const [minProportion, setMinProportion] = useState(0);
    const [maxProportion, setMaxProportion] = useState(1);

    return (
        <div class='flex flex-col w-64'>
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
