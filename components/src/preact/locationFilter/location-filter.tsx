import { type FunctionComponent } from 'preact';
import { useContext, useRef, useState } from 'preact/hooks';
import { type JSXInternal } from 'preact/src/jsx';
import z from 'zod';

import { fetchAutocompletionList } from './fetchAutocompletionList';
import { LapisUrlContext } from '../LapisUrlContext';
import { ErrorBoundary } from '../components/error-boundary';
import { LoadingDisplay } from '../components/loading-display';
import { ResizeContainer } from '../components/resize-container';
import { useQuery } from '../useQuery';

const lineageFilterInnerPropsSchema = z.object({
    initialValue: z.string().optional(),
    placeholderText: z.string().optional(),
    fields: z.array(z.string()).min(1),
});

const lineageFilterPropsSchema = lineageFilterInnerPropsSchema.extend({
    width: z.string(),
});

export type LocationFilterInnerProps = z.infer<typeof lineageFilterInnerPropsSchema>;
export type LocationFilterProps = z.infer<typeof lineageFilterPropsSchema>;

export const LocationFilter: FunctionComponent<LocationFilterProps> = (props) => {
    const { width, ...innerProps } = props;
    const size = { width, height: '3rem' };

    return (
        <ErrorBoundary size={size} layout='horizontal' componentProps={props} schema={lineageFilterPropsSchema}>
            <ResizeContainer size={size}>
                <LocationFilterInner {...innerProps} />
            </ResizeContainer>
        </ErrorBoundary>
    );
};

export const LocationFilterInner = ({ initialValue, fields, placeholderText }: LocationFilterInnerProps) => {
    const lapis = useContext(LapisUrlContext);

    const [value, setValue] = useState(initialValue ?? '');
    const [unknownLocation, setUnknownLocation] = useState(false);

    const divRef = useRef<HTMLDivElement>(null);

    const { data, error, isLoading } = useQuery(() => fetchAutocompletionList(fields, lapis), [fields, lapis]);

    if (isLoading) {
        return <LoadingDisplay />;
    }
    if (error) {
        throw error;
    }

    const onInput = (event: JSXInternal.TargetedInputEvent<HTMLInputElement>) => {
        const inputValue = event.currentTarget.value;
        setValue(inputValue);
        if (inputValue.trim() === value.trim() && inputValue !== '') {
            return;
        }
        const eventDetail = parseLocation(inputValue, fields);
        if (hasAllUndefined(eventDetail) || hasMatchingEntry(data, eventDetail)) {
            divRef.current?.dispatchEvent(
                new CustomEvent('gs-location-changed', {
                    detail: eventDetail,
                    bubbles: true,
                    composed: true,
                }),
            );
            setUnknownLocation(false);
        } else {
            setUnknownLocation(true);
        }
    };

    return (
        <div class='flex w-full' ref={divRef}>
            <input
                type='text'
                class={`input input-bordered grow ${unknownLocation ? 'border-2 border-error' : ''}`}
                value={value}
                onInput={onInput}
                list='countries'
                placeholder={placeholderText}
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
        </div>
    );
};

const parseLocation = (location: string, fields: string[]) => {
    if (location === '') {
        return fields.reduce((acc, field) => ({ ...acc, [field]: undefined }), {});
    }
    const fieldValues = location.split('/').map((part) => part.trim());

    return fields.reduce((acc, field, i) => ({ ...acc, [field]: fieldValues[i] }), {});
};

const hasAllUndefined = (obj: Record<string, string | undefined>) =>
    Object.values(obj).every((value) => value === undefined);

const hasMatchingEntry = (data: Record<string, string>[] | null, eventDetail: Record<string, string>) => {
    if (data === null) {
        return false;
    }

    const matchingEntries = Object.entries(eventDetail)
        .filter(([, value]) => value !== undefined)
        .reduce((filteredData, [key, value]) => filteredData.filter((it) => it[key] === value), data);

    return matchingEntries.length > 0;
};
