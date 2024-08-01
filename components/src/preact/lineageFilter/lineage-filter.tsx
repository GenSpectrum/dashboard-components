import { type FunctionComponent } from 'preact';
import { useContext, useRef } from 'preact/hooks';

import { fetchLineageAutocompleteList } from './fetchLineageAutocompleteList';
import { LapisUrlContext } from '../LapisUrlContext';
import { ErrorBoundary } from '../components/error-boundary';
import { ErrorDisplay } from '../components/error-display';
import { LoadingDisplay } from '../components/loading-display';
import { NoDataDisplay } from '../components/no-data-display';
import { ResizeContainer } from '../components/resize-container';
import { useQuery } from '../useQuery';

export interface LineageFilterInnerProps {
    lapisField: string;
    placeholderText: string;
    initialValue: string;
}

export interface LineageFilterProps extends LineageFilterInnerProps {
    width: string;
}

export const LineageFilter: FunctionComponent<LineageFilterProps> = ({ width, ...innerProps }) => {
    const size = { width, height: '3rem' };

    return (
        <ErrorBoundary size={size}>
            <ResizeContainer size={size}>
                <LineageFilterInner {...innerProps} />
            </ResizeContainer>
        </ErrorBoundary>
    );
};

const LineageFilterInner: FunctionComponent<LineageFilterInnerProps> = ({
    lapisField,
    placeholderText,
    initialValue,
}) => {
    const lapis = useContext(LapisUrlContext);

    const inputRef = useRef<HTMLInputElement>(null);

    const { data, error, isLoading } = useQuery(
        () => fetchLineageAutocompleteList(lapis, lapisField),
        [lapisField, lapis],
    );

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
                new CustomEvent('gs-lineage-filter-changed', {
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
