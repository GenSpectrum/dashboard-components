import { useCombobox } from 'downshift/preact';
import { type FunctionComponent } from 'preact';
import { useContext, useMemo, useRef, useState } from 'preact/hooks';
import z from 'zod';

import { fetchAutocompletionList } from './fetchAutocompletionList';
import { LapisUrlContext } from '../LapisUrlContext';
import { type LapisLocationFilter, LocationChangedEvent } from './LocationChangedEvent';
import { ErrorBoundary } from '../components/error-boundary';
import { LoadingDisplay } from '../components/loading-display';
import { ResizeContainer } from '../components/resize-container';
import { useQuery } from '../useQuery';

const lineageFilterInnerPropsSchema = z.object({
    value: z.record(z.string().nullable().optional()).optional(),
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
    const divRef = useRef<HTMLDivElement>(null);

    const shadowRoot = divRef.current?.shadowRoot ?? undefined;

    const environment =
        shadowRoot !== undefined
            ? {
                  addEventListener: window.addEventListener.bind(window),
                  removeEventListener: window.removeEventListener.bind(window),
                  document: shadowRoot.ownerDocument,
                  Node: window.Node,
              }
            : undefined;

    const {
        isOpen,
        getToggleButtonProps,
        getMenuProps,
        getInputProps,
        highlightedIndex,
        getItemProps,
        selectedItem,
        inputValue,
        selectItem,
        setInputValue,
        closeMenu,
    } = useCombobox({
        onInputValueChange({ inputValue }) {
            setItems(allItems.filter((item) => filterByInputValue(item, inputValue)));
        },
        onSelectedItemChange({ selectedItem }) {
            if (selectedItem !== null) {
                divRef.current?.dispatchEvent(new LocationChangedEvent(selectedItem.lapisFilter));
            }
        },
        items,
        itemToString(item) {
            return item?.label ?? '';
        },
        initialSelectedItem,
        environment,
    });

    const onInputBlur = () => {
        if (inputValue === '') {
            divRef.current?.dispatchEvent(new LocationChangedEvent(emptyLocationFilter(fields)));
            selectItem(null);
        } else if (inputValue !== selectedItem?.label) {
            setInputValue(selectedItem?.label || '');
        }
    };

    const clearInput = () => {
        divRef.current?.dispatchEvent(new LocationChangedEvent(emptyLocationFilter(fields)));
        selectItem(null);
    };

    const buttonRef = useRef(null);

    return (
        <div ref={divRef} className={'relative w-full'}>
            <div className='w-full flex flex-col gap-1'>
                <div
                    className='flex gap-0.5 input input-bordered min-w-32'
                    onBlur={(event) => {
                        if (event.relatedTarget != buttonRef.current) {
                            closeMenu();
                        }
                    }}
                >
                    <input
                        placeholder={placeholderText}
                        className='w-full p-1.5'
                        {...getInputProps()}
                        onBlur={onInputBlur}
                    />
                    <button
                        aria-label='clear selection'
                        className={`px-2 ${inputValue === '' && 'hidden'}`}
                        type='button'
                        onClick={clearInput}
                        tabIndex={-1}
                    >
                        ×
                    </button>
                    <button
                        aria-label='toggle menu'
                        className='px-2'
                        type='button'
                        {...getToggleButtonProps()}
                        ref={buttonRef}
                    >
                        {isOpen ? <>↑</> : <>↓</>}
                    </button>
                </div>
            </div>
            <ul
                className={`absolute bg-white mt-1 shadow-md max-h-80 overflow-scroll z-10 w-full min-w-32  ${
                    !(isOpen && items.length > 0) && 'hidden'
                }`}
                {...getMenuProps()}
            >
                {isOpen &&
                    items.map((item, index) => (
                        <li
                            className={`${highlightedIndex === index && 'bg-blue-300'} ${selectedItem !== null && selectedItem.description === item.description && 'font-bold'} py-2 px-3 shadow-sm flex flex-col`}
                            key={item.description}
                            {...getItemProps({ item, index })}
                        >
                            <span>{item.label}</span>
                            <span className='text-sm text-gray-500'>{item.description}</span>
                        </li>
                    ))}
            </ul>
        </div>
    );
};

function filterByInputValue(item: SelectItem, inputValue: string | undefined | null) {
    if (inputValue === undefined || inputValue === null) {
        return true;
    }
    return (
        item?.label.toLowerCase().includes(inputValue.toLowerCase()) ||
        item?.description.toLowerCase().includes(inputValue.toLowerCase())
    );
}

function toSelectOption(locationFilter: LapisLocationFilter, fields: string[]) {
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
