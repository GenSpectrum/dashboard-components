import { type FunctionComponent } from 'preact';
import { useContext, useRef, useState } from 'preact/hooks';
import z from 'zod';

import { fetchAutocompleteList } from './fetchAutocompleteList';
import { LapisUrlContext } from '../LapisUrlContext';
import { ErrorBoundary } from '../components/error-boundary';
import { LoadingDisplay } from '../components/loading-display';
import { NoDataDisplay } from '../components/no-data-display';
import { ResizeContainer } from '../components/resize-container';
import { useQuery } from '../useQuery';

const textInputInnerPropsSchema = z.object({
    lapisField: z.string().min(1),
    placeholderText: z.string().optional(),
    initialValue: z.string().optional(),
});

const textInputPropsSchema = textInputInnerPropsSchema.extend({
    width: z.string(),
});

export type TextInputInnerProps = z.infer<typeof textInputInnerPropsSchema>;
export type TextInputProps = z.infer<typeof textInputPropsSchema>;

export const TextInput: FunctionComponent<TextInputProps> = (props) => {
    const { width, ...innerProps } = props;
    const size = { width, height: '3rem' };

    return (
        <ErrorBoundary size={size} layout='horizontal' componentProps={props} schema={textInputPropsSchema}>
            <ResizeContainer size={size}>
                <TextInputInner {...innerProps} />
            </ResizeContainer>
        </ErrorBoundary>
    );
};

const TextInputInner: FunctionComponent<TextInputInnerProps> = ({ lapisField, placeholderText, initialValue }) => {
    const lapis = useContext(LapisUrlContext);

    const inputRef = useRef<HTMLInputElement>(null);

    const [hasInput, setHasInput] = useState<boolean>(!!initialValue);
    const [inputValue, setInputValue] = useState(initialValue || '');

    const { data, error, isLoading } = useQuery(() => fetchAutocompleteList(lapis, lapisField), [lapisField, lapis]);

    if (isLoading) {
        return <LoadingDisplay />;
    }

    if (error !== null) {
        throw error;
    }

    if (data === null) {
        return <NoDataDisplay />;
    }

    const onInput = () => {
        const value = inputRef.current?.value === '' ? undefined : inputRef.current?.value;

        if (isValidValue(value)) {
            inputRef.current?.dispatchEvent(
                new CustomEvent('gs-text-input-changed', {
                    detail: { [lapisField]: value },
                    bubbles: true,
                    composed: true,
                }),
            );
            setHasInput(value !== undefined);
            setInputValue(value || '');
        }
    };

    const isValidValue = (value: string | undefined) => {
        if (value === undefined) {
            return true;
        }
        return data.map((item) => item[lapisField]).includes(value);
    };

    return (
        <>
            <div className='relative w-full'>
                <input
                    type='text'
                    className='input input-bordered w-full pr-10'
                    placeholder={placeholderText ?? lapisField}
                    onInput={onInput}
                    ref={inputRef}
                    list={lapisField}
                    value={inputValue}
                />
                {hasInput && (
                    <button
                        type='button'
                        name='✕'
                        className='absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
                        onClick={() => {
                            if (inputRef.current) {
                                inputRef.current.value = '';
                                onInput();
                            }
                        }}
                    >
                        ✕
                    </button>
                )}
            </div>
            <datalist id={lapisField}>
                {data.map((item) => (
                    <option
                        value={item[lapisField]}
                        key={item[lapisField]}
                        style='white-space: nowrap;'
                    >{`${item[lapisField]} (${item['count']})`}</option>
                ))}
            </datalist>
        </>
    );
};
