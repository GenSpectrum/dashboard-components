import { type FunctionComponent } from 'preact';
import { useContext, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import z from 'zod';

import { fetchAutocompletionList } from './fetchAutocompletionList';
import { LapisUrlContext } from '../LapisUrlContext';
import { type LapisLocationFilter, LocationChangedEvent } from './location-filter-event';
import { ErrorBoundary } from '../components/error-boundary';
import { LoadingDisplay } from '../components/loading-display';
import { NoDataDisplay } from '../components/no-data-display';
import { ResizeContainer } from '../components/resize-container';
import { useQuery } from '../useQuery';

const lineageFilterInnerPropsSchema = z.object({
    value: z.record(z.string().nullable()).optional(),
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

export const LocationFilterInner = ({ value, fields, placeholderText }: LocationFilterInnerProps) => {
    const lapis = useContext(LapisUrlContext);

    const { data, error, isLoading } = useQuery(() => fetchAutocompletionList(fields, lapis), [fields, lapis]);

    if (isLoading) {
        return <LoadingDisplay />;
    }
    if (error) {
        throw error;
    }
    if (data === undefined) {
        return <NoDataDisplay />;
    }

    return <LocationSelector fields={fields} value={value} placeholderText={placeholderText} locationData={data} />;
};

type SelectItem = {
    lapisFilter: LapisLocationFilter;
    label: string;
    description: string;
};

const LocationSelector = ({
    fields,
    value,
    placeholderText,
    locationData,
}: LocationFilterInnerProps & {
    locationData: LapisLocationFilter[];
}) => {
    const allItems = useMemo(
        () =>
            locationData
                .map((locationFilter) => {
                    return toSelectOption(locationFilter, fields);
                })
                .filter((item): item is SelectItem => item !== undefined),
        [locationData, fields],
    );

    const initialSelectedItem = useMemo(
        () => (value !== undefined ? toSelectOption(value, fields) : null),
        [value, fields],
    );
    const [items, setItems] = useState(allItems.filter((item) => filterByInputValue(item, initialSelectedItem?.label)));

    const [selectedItem, setSelectedItem] = useState<SelectItem | null>(null);
    const [textInput, setTextInput] = useState('');

    const divRef = useRef<HTMLDivElement>(null);
    const [openDropdown, setOpenDropdown] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpenDropdown(false);
            }
        };

        const currentDiv = divRef.current;
        if (currentDiv) {
            currentDiv.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            if (currentDiv) {
                currentDiv.removeEventListener('keydown', handleKeyDown);
            }
        };
    }, []);

    return (
        <div
            className='border-2 rounded-md relative'
            tabIndex={0}
            ref={divRef}
            onBlur={(event) => {
                if (!divRef.current?.contains(event.relatedTarget as Node)) {
                    setOpenDropdown(false);
                }
            }}
        >
            <div className='flex items-center'>
                <div className='font-medium p-2 cursor-pointer grow' onClick={() => setOpenDropdown(!openDropdown)}>
                    {selectedItem?.label ?? placeholderText}
                </div>
                <button
                    aria-label='clear selection'
                    className={`px-2 ${selectedItem === null ? 'hidden' : ''}`}
                    type='button'
                    onClick={() => {
                        setSelectedItem(null);
                    }}
                >
                    ×
                </button>
                <button
                    aria-label='toggle menu'
                    className='px-2'
                    type='button'
                    onClick={() => setOpenDropdown(!openDropdown)}
                >
                    {openDropdown ? <>↑</> : <>↓</>}
                </button>
            </div>
            <div className={`absolute left-0 right-0 bg-white border-2 ${openDropdown ? 'block' : 'hidden'}`}>
                <input
                    className='w-full p-2 border-b-2'
                    type='text'
                    onInput={(event) => {
                        const inputValue = event.target?.value ?? '';
                        setItems(allItems.filter((item) => filterByInputValue(item, inputValue)));
                        setTextInput(event.target?.value ?? '');
                    }}
                    placeholder={'Search'}
                    value={textInput}
                />
                <div className='max-h-60 overflow-scroll bg-white'>
                    {items.length === 0 && <div className='p-2'>No locations found</div>}
                    {items.map((item) => {
                        const isSelected = selectedItem?.description === item.description;
                        return (
                            <div
                                key={item.description}
                                className={`flex flex-col p-2 cursor-pointer transition-colors ${isSelected ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
                                onClick={() => {
                                    setSelectedItem(item);
                                    setTextInput('');
                                    divRef.current?.dispatchEvent(
                                        new LocationChangedEvent(
                                            selectedItem?.lapisFilter ?? emptyLocationFilter(fields),
                                        ),
                                    );
                                }}
                            >
                                <div className='font-bold'>{item.label}</div>
                                <div>{item.description}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

function filterByInputValue(item: SelectItem, inputValue: string | undefined) {
    if (inputValue === undefined) {
        return true;
    }
    return (
        item?.label.toLowerCase().includes(inputValue.toLowerCase()) ||
        item?.description.toLowerCase().includes(inputValue.toLowerCase())
    );
}

function toSelectOption(locationFilter: LapisLocationFilter, fields: string[]) {
    const concatenatedLocation = concatenateLocation(locationFilter, fields);

    const lastNonUndefinedValue = Object.values(locationFilter)
        .filter((value) => value !== null)
        .pop();

    if (lastNonUndefinedValue === undefined || lastNonUndefinedValue === null) {
        return undefined;
    }

    return {
        lapisFilter: locationFilter,
        label: lastNonUndefinedValue,
        description: `${concatenatedLocation}`,
    };
}

function concatenateLocation(locationFilter: LapisLocationFilter, fields: string[]) {
    return fields
        .map((field) => locationFilter[field])
        .filter((value) => value !== null)
        .join(' / ');
}

function emptyLocationFilter(fields: string[]) {
    return fields.reduce(
        (acc, field) => {
            acc[field] = null;
            return acc;
        },
        {} as Record<string, string | null>,
    );
}
