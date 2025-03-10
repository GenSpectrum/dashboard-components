import { type ChangeEvent } from 'preact/compat';
import { useEffect, useState } from 'preact/hooks';

import { type WithClassName } from '../shared/WithClassName/WithClassName';
import { DeleteIcon } from '../shared/icons/DeleteIcon';

export const undefinedValue = '__undefined__';

export type ClearableSelectProps = {
    items: string[];
    initiallySelectedItem?: string | null;
    onChange?: (item: string | null) => void;
    placeholderText?: string;
    value?: string | null;
    selectClassName?: string;
};

export function ClearableSelect({
    items,
    initiallySelectedItem,
    onChange,
    placeholderText,
    className,
    value,
    selectClassName,
}: WithClassName<ClearableSelectProps>) {
    const [selectedOption, setSelectedOption] = useState<string | null>(initiallySelectedItem ?? null);

    useEffect(() => {
        if (value !== undefined) {
            setSelectedOption(value);
        }
    }, [value]);

    const handleClear = () => {
        setSelectedOption(null);
        if (onChange) {
            onChange(null);
        }
    };

    const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const newValue = event.currentTarget.value;
        setSelectedOption(newValue);
        if (onChange) {
            onChange(newValue);
        }
    };

    return (
        <div className={`relative inline min-w-24 ${className}`}>
            <select
                className={`w-full select pr-14 ${selectClassName}`}
                value={selectedOption ?? undefinedValue}
                onChange={handleChange}
            >
                <option value={undefinedValue} disabled>
                    {placeholderText ?? 'Select an option'}
                </option>
                {items.map((item) => (
                    <option key={item} value={item}>
                        {item}
                    </option>
                ))}
            </select>
            {selectedOption && (
                <button
                    onClick={handleClear}
                    className='absolute right-10 top-1/2 -translate-y-1/2 bg-transparent border-0 cursor-pointer'
                >
                    <DeleteIcon />
                </button>
            )}
        </div>
    );
}
