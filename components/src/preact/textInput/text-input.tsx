import { type FunctionComponent } from 'preact';
import { useContext, useRef } from 'preact/hooks';

import { fetchAutocompleteList } from './fetchAutocompleteList';
import { LapisUrlContext } from '../LapisUrlContext';
import { ErrorBoundary } from '../components/error-boundary';
import { ErrorDisplay } from '../components/error-display';
import { LoadingDisplay } from '../components/loading-display';
import { NoDataDisplay } from '../components/no-data-display';
import { ResizeContainer } from '../components/resize-container';
import { useQuery } from '../useQuery';

export interface TextInputInnerProps {
    lapisField: string;
    placeholderText?: string;
    initialValue?: string;
}

export interface TextInputProps extends TextInputInnerProps {
    width: string;
}

export const TextInput: FunctionComponent<TextInputProps> = ({ width, lapisField, placeholderText, initialValue }) => {
    const size = { width, height: '3rem' };

    return (
        <ErrorBoundary size={size}>
            <ResizeContainer size={size}>
                <TextInputInner lapisField={lapisField} placeholderText={placeholderText} initialValue={initialValue} />
            </ResizeContainer>
        </ErrorBoundary>
    );
};

export const TextInputInner: FunctionComponent<TextInputInnerProps> = ({
    lapisField,
    placeholderText,
    initialValue,
}) => {
    const lapis = useContext(LapisUrlContext);

    const inputRef = useRef<HTMLInputElement>(null);

    const { data, error, isLoading } = useQuery(() => fetchAutocompleteList(lapis, lapisField), [lapisField, lapis]);

    if (isLoading) {
        return <LoadingDisplay />;
    }

    if (error !== null) {
        return <ErrorDisplay error={error} />;
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
        }
    };

    const isValidValue = (value: string | undefined) => {
        if (value === undefined) {
            return true;
        }
        return data.includes(value);
    };

    return (
        <>
            <input
                type='text'
                class='input input-bordered w-full'
                placeholder={placeholderText !== undefined ? placeholderText : lapisField}
                onInput={onInput}
                ref={inputRef}
                list={lapisField}
                value={initialValue}
            />
            <datalist id={lapisField}>
                {data.map((item) => (
                    <option value={item} key={item} />
                ))}
            </datalist>
        </>
    );
};
