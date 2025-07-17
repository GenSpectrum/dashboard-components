import { type FunctionComponent, type JSX } from 'preact';
import { useState } from 'preact/hooks';

export interface MinMaxPercentSliderProps {
    min: number;
    max: number;
    setMin: (min: number) => void;
    setMax: (max: number) => void;
    onDrop?: () => void;
    rangeMin?: number;
    rangeMax?: number;
    step?: number;
}

export const MinMaxRangeSlider: FunctionComponent<MinMaxPercentSliderProps> = ({
    min,
    max,
    setMin,
    setMax,
    onDrop,
    rangeMin = 0,
    rangeMax = 100,
    step = 0.1,
}) => {
    const sliderColor = '#C6C6C6';
    const rangeColor = '#387bbe';

    const [zIndexTo, setZIndexTo] = useState(0);

    const onMinChange = (event: JSX.TargetedInputEvent<HTMLInputElement>) => {
        const input = event.target as HTMLInputElement;
        const minValue = Number(input.value);

        if (minValue > max) {
            setMax(minValue);
            setMin(minValue);
        } else {
            setMin(minValue);
        }
    };

    const onMaxChange = (event: JSX.TargetedInputEvent<HTMLInputElement>) => {
        const input = event.target as HTMLInputElement;
        const maxValue = Number(input.value);

        if (maxValue <= 0) {
            setZIndexTo(2);
        } else {
            setZIndexTo(0);
        }

        if (maxValue < min) {
            setMin(maxValue);
            setMax(maxValue);
        } else {
            setMax(maxValue);
        }
    };

    const lowerBoundary = getGradientBoundary(min, rangeMin, rangeMax);
    const upperBoundary = getGradientBoundary(max, rangeMin, rangeMax);
    const background = `
        linear-gradient(
            to right,
            ${sliderColor} 0%,
            ${sliderColor} ${lowerBoundary}%,
            ${rangeColor} ${lowerBoundary}%,
            ${rangeColor} ${upperBoundary}%,
            ${sliderColor} ${upperBoundary}%,
            ${sliderColor} 100%)
    `;

    return (
        <div className='my-4 relative w-full h-full'>
            <input
                id='fromSlider'
                type='range'
                value={min}
                onInput={onMinChange}
                onMouseUp={() => onDrop?.()}
                onTouchEnd={() => onDrop?.()}
                min={`${rangeMin}`}
                max={`${rangeMax}`}
                step={step}
                style={{ background, zIndex: 1, height: 0 }}
            />
            <input
                id='toSlider'
                type='range'
                value={max}
                min={`${rangeMin}`}
                max={`${rangeMax}`}
                step={step}
                onInput={onMaxChange}
                onMouseUp={() => onDrop?.()}
                onTouchEnd={() => onDrop?.()}
                style={{ background, zIndex: zIndexTo }}
            />
        </div>
    );
};

/**
 * This is a linear function that returns 0 for x = lowerBound and 100 for x = upperBound.
 */
function getGradientBoundary(x: number, lowerBound: number, upperBound: number) {
    return ((x - lowerBound) / (upperBound - lowerBound)) * 100;
}
