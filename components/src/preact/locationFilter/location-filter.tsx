import { type FunctionComponent } from 'preact';
import { useContext, useMemo } from 'preact/hooks';
import z from 'zod';

import { fetchAutocompletionList } from './fetchAutocompletionList';
import { LapisUrlContext } from '../LapisUrlContext';
import { LocationChangedEvent } from './LocationChangedEvent';
import { lapisFilterSchema, type LapisLocationFilter, lapisLocationFilterSchema } from '../../types';
import { DownshiftCombobox } from '../components/downshift-combobox';
import { ErrorBoundary } from '../components/error-boundary';
import { LoadingDisplay } from '../components/loading-display';
import { ResizeContainer } from '../components/resize-container';
import { useQuery } from '../useQuery';

const locationSelectorPropsSchema = z.object({
    value: lapisLocationFilterSchema.optional(),
    placeholderText: z.string().optional(),
    fields: z.array(z.string()).min(1),
});
const locationFilterInnerPropsSchema = locationSelectorPropsSchema.extend({ lapisFilter: lapisFilterSchema });
const locationFilterPropsSchema = locationFilterInnerPropsSchema.extend({
    width: z.string(),
});

export type LocationFilterInnerProps = z.infer<typeof locationFilterInnerPropsSchema>;
export type LocationFilterProps = z.infer<typeof locationFilterPropsSchema>;
type LocationSelectorProps = z.infer<typeof locationSelectorPropsSchema>;

export const LocationFilter: FunctionComponent<LocationFilterProps> = (props) => {
    const { width, ...innerProps } = props;
    const size = { width, height: '3rem' };

    return (
        <ErrorBoundary size={size} layout='horizontal' componentProps={props} schema={locationFilterPropsSchema}>
            <ResizeContainer size={size}>
                <LocationFilterInner {...innerProps} />
            </ResizeContainer>
        </ErrorBoundary>
    );
};

export const LocationFilterInner = ({ value, fields, placeholderText, lapisFilter }: LocationFilterInnerProps) => {
    const lapis = useContext(LapisUrlContext);

    const { data, error, isLoading } = useQuery(
        () => fetchAutocompletionList({ fields, lapis, lapisFilter }),
        [fields, lapis, lapisFilter],
    );

    if (isLoading) {
        return <LoadingDisplay />;
    }
    if (error) {
        throw error;
    }

    return <LocationSelector fields={fields} value={value} placeholderText={placeholderText} locationData={data} />;
};

type SelectItem = {
    lapisFilter: LapisLocationFilter;
    label: string | null | undefined;
    description: string;
};

const LocationSelector = ({
    fields,
    value,
    placeholderText,
    locationData,
}: LocationSelectorProps & {
    locationData: LapisLocationFilter[];
}) => {
    const allItems = useMemo(() => {
        return locationData
            .map((location) => toSelectItem(location, fields))
            .filter((item): item is SelectItem => item !== undefined);
    }, [fields, locationData]);

    const selectedItem = useMemo(() => {
        return value !== undefined ? toSelectItem(value, fields) : undefined;
    }, [fields, value]);

    return (
        <DownshiftCombobox
            allItems={allItems}
            value={selectedItem}
            filterItemsByInputValue={filterByInputValue}
            createEvent={(item: SelectItem | null) =>
                new LocationChangedEvent(item?.lapisFilter ?? emptyLocationFilter(fields))
            }
            itemToString={(item: SelectItem | undefined | null) => item?.label ?? ''}
            placeholderText={placeholderText}
            formatItemInList={(item: SelectItem) => {
                return (
                    <>
                        <span>{item.label}</span>
                        <span className='text-sm text-gray-500'>{item.description}</span>
                    </>
                );
            }}
        />
    );
};

function filterByInputValue(item: SelectItem, inputValue: string | undefined | null) {
    if (inputValue === undefined || inputValue === null) {
        return true;
    }
    return (
        item?.label?.toLowerCase().includes(inputValue.toLowerCase()) ||
        item?.description.toLowerCase().includes(inputValue.toLowerCase())
    );
}

function toSelectItem(locationFilter: LapisLocationFilter, fields: string[]): SelectItem | undefined {
    const concatenatedLocation = concatenateLocation(locationFilter, fields);

    const lastNonUndefinedField = [...fields]
        .reverse()
        .find((field) => locationFilter[field] !== undefined && locationFilter[field] !== null);

    if (lastNonUndefinedField === undefined) {
        return undefined;
    }

    return {
        lapisFilter: locationFilter,
        label: locationFilter[lastNonUndefinedField],
        description: concatenatedLocation,
    };
}

function concatenateLocation(locationFilter: LapisLocationFilter, fields: string[]) {
    return fields
        .map((field) => locationFilter[field])
        .filter((value) => value !== null && value !== undefined)
        .join(' / ');
}

function emptyLocationFilter(fields: string[]) {
    return fields.reduce((acc, field) => {
        acc[field] = undefined;
        return acc;
    }, {} as LapisLocationFilter);
}
