import { FunctionComponent } from 'preact';
import { useContext, useRef } from 'preact/hooks';
import { LapisUrlContext } from '../LapisUrlContext';
import { useQuery } from '../useQuery';
import { fetchAutocompleteList } from './fetchAutocompleteList';
import { LoadingDisplay } from '../components/loading-display';
import { ErrorDisplay } from '../components/error-display';
import { NoDataDisplay } from '../components/no-data-display';

export interface TextInputProps {
    lapisField: string;
    placeholderText?: string;
}

export const TextInput: FunctionComponent<TextInputProps> = ({ lapisField, placeholderText }) => {
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
        const value = inputRef.current?.value;

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
            return false;
        }
        return data.includes(value);
    };

    return (
        <>
            <input
                type='text'
                class='input input-bordered'
                placeholder={placeholderText !== undefined ? placeholderText : lapisField}
                onInput={onInput}
                ref={inputRef}
                list={lapisField}
            />
            <datalist id={lapisField}>
                {data.map((item) => (
                    <option value={item} key={item} />
                ))}
            </datalist>
        </>
    );
};
