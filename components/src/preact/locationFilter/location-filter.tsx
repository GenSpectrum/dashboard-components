import { type FunctionComponent } from 'preact';
import { useContext, useMemo, useRef, useState } from 'preact/hooks';
import z from 'zod';

import { fetchAutocompletionList } from './fetchAutocompletionList';
import { LapisUrlContext } from '../LapisUrlContext';
import { ErrorBoundary } from '../components/error-boundary';
import { LoadingDisplay } from '../components/loading-display';
import { ResizeContainer } from '../components/resize-container';
import { useQuery } from '../useQuery';
import Select from 'react-select';

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

    const divRef = useRef<HTMLDivElement>(null);

    const { data, error, isLoading } = useQuery(() => fetchAutocompletionList(fields, lapis), [fields, lapis]);

    if (isLoading) {
        return <LoadingDisplay />;
    }
    if (error) {
        throw error;
    }

    const selectOptions = data?.map((v) => {
        const value = fields
            .map((field) => v[field])
            .filter((value) => value !== null)
            .join(' / ');

        const lastNonUndefinedValue = Object.values(v)
            .filter((value) => value !== null)
            .pop();

        return {
            value,
            label: lastNonUndefinedValue,
            description: `${value}`,
        };
    });

    const formatOptionLabel = (
        data: {
            value: string;
            label: string | null | undefined;
            description: string;
        },
        formatOptionLabelMeta: { context: 'menu' | 'value' },
    ) => {
        if (formatOptionLabelMeta.context === 'menu') {
            return (
                <div class='flex flex-col justify-between'>
                    <span>{data.label}</span>
                    <span class='text-gray-500 text-sm'>{data.description}</span>
                </div>
            );
        }

        return data.label;
    };

    const defaultInputValue = useMemo(
        () => selectOptions?.find((option) => option.value === initialValue)?.value,
        [selectOptions, initialValue],
    );

    return (
        <div ref={divRef}>
            <Select
                defaultInputValue={defaultInputValue}
                options={selectOptions}
                formatOptionLabel={formatOptionLabel}
                isClearable={true}
                isSearchable={true}
                placeholder={placeholderText}
                onChange={(option) => {
                    if (option === null) {
                        return;
                    }
                    const eventDetail = parseLocation(option.value, fields);
                    if (hasAllUndefined(eventDetail) || hasMatchingEntry(data, eventDetail)) {
                        divRef.current?.dispatchEvent(
                            new CustomEvent('gs-location-changed', {
                                detail: eventDetail,
                                bubbles: true,
                                composed: true,
                            }),
                        );
                    }
                }}
            />
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

const hasMatchingEntry = (data: Record<string, string | null>[] | null, eventDetail: Record<string, string>) => {
    if (data === null) {
        return false;
    }

    const matchingEntries = Object.entries(eventDetail)
        .filter(([, value]) => value !== undefined)
        .reduce((filteredData, [key, value]) => filteredData.filter((it) => it[key] === value), data);

    return matchingEntries.length > 0;
};
