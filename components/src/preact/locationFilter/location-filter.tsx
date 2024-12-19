import { type FunctionComponent } from 'preact';
import { useContext, useMemo, useRef, useState } from 'preact/hooks';
import z from 'zod';

import { fetchAutocompletionList } from './fetchAutocompletionList';
import { LapisUrlContext } from '../LapisUrlContext';
import { ErrorBoundary } from '../components/error-boundary';
import { LoadingDisplay } from '../components/loading-display';
import { ResizeContainer } from '../components/resize-container';
import { useQuery } from '../useQuery';
import { useCombobox } from 'downshift';

const locationFilterValueSchema = z.record(z.string().nullable()).optional();
const lineageFilterInnerPropsSchema = z.object({
    value: locationFilterValueSchema,
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

type SelectItem = {
    lapisFilter: Record<string, string | null>;
    label: string;
    description: string;
};

export const LocationFilterInner = ({ value, fields, placeholderText }: LocationFilterInnerProps) => {
    const lapis = useContext(LapisUrlContext);

    const divRef = useRef<HTMLDivElement>(null);

    const { data, error, isLoading } = useQuery(() => fetchAutocompletionList(fields, lapis), [fields, lapis]);

    if (isLoading) {
        return <LoadingDisplay />;
    }
    if (error) {
        throw error;
    }

    const allItems = data
        ?.map((locationFilter) => {
            return toSelectOption(locationFilter, fields);
        })
        .filter((item): item is SelectItem => item !== undefined);

    const initialInputValue = useMemo(
        () => (value !== undefined ? toSelectOption(value, fields) : undefined)?.label ?? '',
        [value, fields],
    );

    function ComboBox() {
        const [items, setItems] = useState(allItems);
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
        } = useCombobox({
            onInputValueChange({ inputValue }) {
                if (inputValue === '') {
                    setItems(allItems);
                    return;
                }

                setItems(
                    allItems.filter((item) => {
                        return (
                            item?.label.toLowerCase().includes(inputValue.toLowerCase()) ||
                            item?.description.toLowerCase().includes(inputValue.toLowerCase())
                        );
                    }),
                );
            },
            onSelectedItemChange({ selectedItem }) {
                if (selectedItem !== null) {
                    divRef.current?.dispatchEvent(
                        new CustomEvent('gs-location-changed', {
                            detail: selectedItem.lapisFilter,
                            bubbles: true,
                            composed: true,
                        }),
                    );
                }
            },
            items,
            itemToString(item) {
                return item?.label ?? '';
            },
            initialInputValue,
        });

        // TODO: hide clear selection button when input is empty

        return (
            <div ref={divRef}>
                <div className='w-72 flex flex-col gap-1'>
                    <div className='flex shadow-sm bg-white gap-0.5'>
                        <input
                            placeholder={placeholderText}
                            className='w-full p-1.5'
                            {...getInputProps()}
                            onBlur={() => {
                                if (inputValue === '') {
                                    divRef.current?.dispatchEvent(
                                        new CustomEvent('gs-location-changed', {
                                            detail: { region: null, country: null, division: null, location: null },
                                            bubbles: true,
                                            composed: true,
                                        }),
                                    );
                                    selectItem(null);
                                    return;
                                }

                                if (selectedItem) {
                                    if (inputValue !== selectedItem.label) {
                                        setInputValue(selectedItem.label);
                                    }
                                }
                            }}
                        />
                        <button
                            aria-label='clear selection'
                            className='px-2'
                            type='button'
                            onClick={() => {
                                divRef.current?.dispatchEvent(
                                    new CustomEvent('gs-location-changed', {
                                        detail: { region: null, country: null, division: null, location: null },
                                        bubbles: true,
                                        composed: true,
                                    }),
                                );
                                selectItem(null);
                            }}
                            tabIndex={-1}
                        >
                            &#215;
                        </button>
                        <button aria-label='toggle menu' className='px-2' type='button' {...getToggleButtonProps()}>
                            {isOpen ? <>&#8593;</> : <>&#8595;</>}
                        </button>
                    </div>
                </div>
                <ul
                    className={`absolute w-72 bg-white mt-1 shadow-md max-h-80 overflow-scroll p-0 z-10 ${
                        !(isOpen && items.length) && 'hidden'
                    }`}
                    {...getMenuProps()}
                >
                    {isOpen &&
                        items.map((item, index) => (
                            <li
                                className={`${highlightedIndex === index && 'bg-blue-300'} ${selectedItem !== null && selectedItem === item && 'font-bold'} py-2 px-3 shadow-sm flex flex-col`}
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
    }

    return <ComboBox />;
};

function toSelectOption(locationFilter: Record<string, string | null>, fields: string[]) {
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

function concatenateLocation(locationFilter: Record<string, string | null>, fields: string[]) {
    return fields
        .map((field) => locationFilter[field])
        .filter((value) => value !== null)
        .join(' / ');
}

const hasAllUndefined = (obj: Record<string, string | null>) => Object.values(obj).every((value) => value === null);
