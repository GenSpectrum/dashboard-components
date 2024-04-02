import { FunctionComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { ChangeEvent } from 'react';

export type PercentInputProps = {
    percentage: number;
    setPercentage: (percentage: number) => void;
};

const percentageInRange = (percentage: number) => {
    return percentage <= 100 && percentage >= 0;
};

export const PercentInput: FunctionComponent<PercentInputProps> = ({ percentage, setPercentage }) => {
    const [internalPercentage, setInternalPercentage] = useState(percentage);

    useEffect(() => {
        setInternalPercentage(percentage);
    }, [percentage]);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const input = event.target as HTMLInputElement;
        const value = Number(input.value);

        const inRange = percentageInRange(value);

        if (inRange) {
            setPercentage(value);
        }
        setInternalPercentage(value);
    };

    const isError = !percentageInRange(internalPercentage);
    return (
        <label className={`input input-bordered flex items-center gap-2 w-32 ${isError ? 'input-error' : ''}`}>
            <input
                type='number'
                step={0.1}
                min={0}
                max={100}
                value={internalPercentage}
                onInput={handleInputChange}
                lang='en'
                className={`grow w-16`}
            />
            %
        </label>
    );
};
