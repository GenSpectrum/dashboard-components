import { type FunctionComponent } from 'preact';
import { useContext, useRef, useState } from 'preact/hooks';

import { fetchAutocompletionList } from './fetchAutocompletionList';
import { LapisUrlContext } from '../LapisUrlContext';
import { ErrorBoundary } from '../components/error-boundary';
import { ErrorDisplay } from '../components/error-display';
import { LoadingDisplay } from '../components/loading-display';
import { ResizeContainer } from '../components/resize-container';
import { useQuery } from '../useQuery';

export interface LocationFilterInnerProps {
    initialValue?: string;
    fields: string[];
}

export interface LocationFilterProps extends LocationFilterInnerProps {
    width?: string;
}

export const LocationFilter: FunctionComponent<LocationFilterProps> = ({ width, initialValue, fields }) => {
    const defaultSize = { width: '100%', height: '3rem' };
    const size = width === undefined ? undefined : { width, height: defaultSize.height };

    return (
        <ErrorBoundary defaultSize={defaultSize} size={size}>
            <ResizeContainer size={size} defaultSize={defaultSize}>
                <LocationFilterInner initialValue={initialValue} fields={fields} />
            </ResizeContainer>
        </ErrorBoundary>
    );
};

export const LocationFilterInner = ({ initialValue, fields }: LocationFilterInnerProps) => {
    const lapis = useContext(LapisUrlContext);

    const [value, setValue] = useState(initialValue ?? '');
    const [unknownLocation, setUnknownLocation] = useState(false);

    const formRef = useRef<HTMLFormElement>(null);

    const { data, error, isLoading } = useQuery(() => fetchAutocompletionList(fields, lapis), [fields, lapis]);

    if (isLoading) {
        return <LoadingDisplay />;
    }
    if (error) {
        return <ErrorDisplay error={error} />;
    }

    const onInput = (event: InputEvent) => {
        if (event.target instanceof HTMLInputElement) {
            const inputValue = event.target.value;
            setValue(inputValue);
            if (unknownLocation) {
                const eventDetail = parseLocation(inputValue, fields);
                if (hasMatchingEntry(data, eventDetail)) {
                    setUnknownLocation(false);
                }
            }
        }
    };

    const submit = (event: SubmitEvent) => {
        event.preventDefault();
        const eventDetail = parseLocation(value, fields);

        if (hasMatchingEntry(data, eventDetail)) {
            setUnknownLocation(false);

            formRef.current?.dispatchEvent(
                new CustomEvent('gs-location-changed', {
                    detail: eventDetail,
                    bubbles: true,
                    composed: true,
                }),
            );
        } else {
            setUnknownLocation(true);
        }
    };

    return (
        <form class='flex w-full' onSubmit={submit} ref={formRef}>
            <input
                type='text'
                class={`input input-bordered grow ${unknownLocation ? 'border-2 border-error' : ''}`}
                value={value}
                onInput={onInput}
                list='countries'
            />
            <datalist id='countries'>
                {data?.map((v) => {
                    const value = fields
                        .map((field) => v[field])
                        .filter((value) => value !== null)
                        .join(' / ');
                    return <option key={value} value={value} />;
                })}
            </datalist>
            <button class='btn btn-primary ml-1' type='submit'>
                Submit
            </button>
        </form>
    );
};

const parseLocation = (location: string, fields: string[]) => {
    const fieldValues = location.split('/').map((part) => part.trim());
    return fieldValues.reduce((acc, fieldValue, i) => ({ ...acc, [fields[i]]: fieldValue }), {});
};

const hasMatchingEntry = (data: Record<string, string>[] | null, eventDetail: Record<string, string>) => {
    if (data === null) {
        return false;
    }

    const matchingEntries = Object.entries(eventDetail)
        .filter(([, value]) => value !== undefined)
        .reduce((filteredData, [key, value]) => filteredData.filter((it) => it[key] === value), data);

    return matchingEntries.length > 0;
};
