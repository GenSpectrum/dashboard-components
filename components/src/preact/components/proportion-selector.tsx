import { type FunctionComponent } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

import { MinMaxRangeSlider } from './min-max-range-slider';
import { PercentInput } from './percent-intput';

export type ProportionInterval = { min: number; max: number };

export interface ProportionSelectorProps {
    proportionInterval: ProportionInterval;
    setMinProportion: (minProportion: number) => void;
    setMaxProportion: (maxProportion: number) => void;
}

function useUpdateExternalValueInIntervals(
    setExternalValue: (minProportion: number) => void,
    updateIntervalInMs: number,
    internalValue: number,
) {
    const hasMounted = useRef(false);

    useEffect(() => {
        if (!hasMounted.current) {
            hasMounted.current = true;
            return;
        }

        const minTimeout = setTimeout(() => {
            setExternalValue(internalValue);
        }, updateIntervalInMs);

        return () => clearTimeout(minTimeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- We only want to run this effect when the internal value changes
    }, [internalValue]);
}

export const ProportionSelector: FunctionComponent<ProportionSelectorProps> = ({
    proportionInterval,
    setMinProportion,
    setMaxProportion,
}) => {
    const updateIntervalInMs = 300;
    const { min: minProportion, max: maxProportion } = proportionInterval;

    const [internalMinProportion, setInternalMinProportion] = useState(minProportion);
    const [internalMaxProportion, setInternalMaxProportion] = useState(maxProportion);

    useUpdateExternalValueInIntervals(setMinProportion, updateIntervalInMs, internalMinProportion);
    const updateMinPercentage = (minPercentage: number) => {
        const newMinProportion = minPercentage / 100;
        setInternalMinProportion(newMinProportion);
    };

    useUpdateExternalValueInIntervals(setMaxProportion, updateIntervalInMs, internalMaxProportion);
    const updateMaxPercentage = (maxPercentage: number) => {
        const newMaxProportion = maxPercentage / 100;
        setInternalMaxProportion(newMaxProportion);
    };

    const indicateError = internalMinProportion > internalMaxProportion;

    return (
        <div class='flex flex-col w-64 mb-2'>
            <div class='flex items-center '>
                <PercentInput
                    percentage={internalMinProportion * 100}
                    setPercentage={updateMinPercentage}
                    indicateError={indicateError}
                />
                <div class='m-2'>-</div>
                <PercentInput
                    percentage={internalMaxProportion * 100}
                    setPercentage={updateMaxPercentage}
                    indicateError={indicateError}
                />
            </div>
            <div class='my-1'>
                <MinMaxRangeSlider
                    min={internalMinProportion * 100}
                    max={internalMaxProportion * 100}
                    setMin={updateMinPercentage}
                    setMax={updateMaxPercentage}
                />
            </div>
        </div>
    );
};
