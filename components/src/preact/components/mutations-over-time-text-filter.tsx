import type { h } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';

import { Dropdown } from './dropdown';
import { DeleteIcon } from '../shared/icons/DeleteIcon';

export type TextFilterProps = { setFilterValue: (newValue: string) => void; value: string };

export function MutationsOverTimeTextFilter({ setFilterValue, value }: TextFilterProps) {
    const onInput = (newValue: string) => {
        setFilterValue(newValue);
    };

    const onDeleteClick = () => setFilterValue('');

    return (
        <div className={'w-28 inline-flex'}>
            <Dropdown buttonTitle={value === '' ? `Filter mutations` : value} placement={'bottom-start'}>
                <div>
                    <label className='flex gap-1 input input-xs'>
                        <DebouncedInput placeholder={'Filter'} onInput={onInput} value={value} type='text' />
                        {value !== undefined && value !== '' && (
                            <button className={'cursor-pointer'} onClick={onDeleteClick}>
                                <DeleteIcon />
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
    onInput,
    debounce = 500,
    ...props
}: {
    onInput: (value: string) => void;
    debounce?: number;
    value?: string;
} & Omit<h.JSX.IntrinsicElements['input'], 'onInput'>) {
    const [value, setValue] = useState<string | undefined>(initialValue);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            onInput(value ?? '');
        }, debounce);

        return () => clearTimeout(timeout);
    }, [value, debounce, onInput]);

    const onChangeInput = useCallback((event: h.JSX.TargetedEvent<HTMLInputElement>) => {
        setValue(event.currentTarget.value);
    }, []);

    return <input {...props} value={value} onInput={onChangeInput} />;
}
