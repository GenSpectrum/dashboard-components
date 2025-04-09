import flatpickr from 'flatpickr';
import { useEffect, useRef, useState } from 'preact/hooks';

import { type WithClassName } from '../shared/WithClassName/WithClassName';

export function DatePicker({
    onChange,
    value,
    minDate,
    maxDate,
    placeholderText,
    className,
}: WithClassName<{
    onChange?: (date: Date | undefined) => void;
    value?: Date;
    minDate?: Date;
    maxDate?: Date;
    placeholderText?: string;
}>) {
    const inputRef = useRef<HTMLInputElement>(null);

    const [datePicker, setDatePicker] = useState<flatpickr.Instance | null>(null);

    const calendarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!inputRef.current || !calendarRef.current) {
            return;
        }

        const instance = flatpickr(inputRef.current, {
            allowInput: true,
            dateFormat: 'Y-m-d',
            defaultDate: value,
            minDate,
            maxDate,
            appendTo: calendarRef.current,
        });

        setDatePicker(instance);

        return () => {
            instance.destroy();
        };
    }, [maxDate, minDate, onChange, value]);

    if (value === undefined && inputRef.current) {
        inputRef.current.value = '';
    }

    const handleChange = () => {
        const newValue = datePicker?.selectedDates[0];
        if (onChange) {
            onChange(newValue);
        }
    };

    return (
        <div className={'w-full'}>
            <input
                className={`input w-full ${className}`}
                type='text'
                placeholder={placeholderText}
                ref={inputRef}
                onChange={handleChange}
                onBlur={handleChange}
            />
            <div ref={calendarRef} />
        </div>
    );
}
