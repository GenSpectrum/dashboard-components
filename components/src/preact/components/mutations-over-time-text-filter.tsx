import type { h } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';

import { Dropdown } from './dropdown';

export type TextFilterProps = { setFilterValue: (newValue: string) => void; value: string };

export function MutationsOverTimeTextFilter({ setFilterValue, value }: TextFilterProps) {
    return (
        <div className={'w-24 inline-flex'}>
            <Dropdown buttonTitle={value === '' ? `Filter mutations` : value} placement={'bottom-start'}>
                <div>
                    <label className='flex gap-1 input input-xs'>
                        <DebouncedInput
                            placeholder={'Filter'}
                            onChange={(newValue) => {
                                setFilterValue(newValue);
                            }}
                            value={value}
                            type='text'
                        />
                        {value !== undefined && value !== '' && (
                            <button className={'cursor-pointer'} onClick={() => setFilterValue('')}>
                                x
                            </button>
                        )}
                    </label>
                </div>
            </Dropdown>
        </div>
    );
}

function DebouncedInput({
    value: initialValue,
    onChange,
    debounce = 500,
    ...props
}: {
    onChange: (value: string) => void;
    debounce?: number;
    value?: string;
} & Omit<h.JSX.IntrinsicElements['input'], 'onChange'>) {
    const [value, setValue] = useState<string | undefined>(initialValue);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            onChange(value ?? '');
        }, debounce);

        return () => clearTimeout(timeout);
    }, [value, debounce, onChange]);

    const onChangeInput = useCallback((event: h.JSX.TargetedEvent<HTMLInputElement>) => {
        setValue(event.currentTarget.value);
    }, []);

    return <input {...props} value={value} onChange={onChangeInput} />;
}
