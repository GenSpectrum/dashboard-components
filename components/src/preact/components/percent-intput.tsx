import { type FunctionComponent, type JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';

export type PercentInputProps = {
    percentage: number;
    setPercentage: (percentage: number) => void;
    indicateError?: boolean;
};

const percentageInRange = (percentage: number) => {
    return percentage <= 100 && percentage >= 0;
};

export const PercentInput: FunctionComponent<PercentInputProps> = ({
    percentage,
    setPercentage,
    indicateError = false,
}) => {
    const [internalPercentage, setInternalPercentage] = useState(percentage);

    useEffect(() => {
        setInternalPercentage(percentage);
    }, [percentage]);

    const handleInputChange = (event: JSX.TargetedInputEvent<HTMLInputElement>) => {
        const input = event.target as HTMLInputElement;
        const value = Number(input.value);

        if (value === internalPercentage || input.value === '') {
            return;
        }

        const inRange = percentageInRange(value);

        if (inRange) {
            setPercentage(value);
        }
        setInternalPercentage(value);
    };

    const isError = indicateError || !percentageInRange(internalPercentage);
    return (
        <label className={`input input-bordered flex items-center gap-2 w-32 ${isError ? 'input-error' : ''}`}>
            <input
                type='number'
                step={0.1}
                min='0'
                max='100'
                value={internalPercentage}
                onInput={handleInputChange}
                lang='en'
                className={`grow w-16`}
            />
            %
        </label>
    );
};
