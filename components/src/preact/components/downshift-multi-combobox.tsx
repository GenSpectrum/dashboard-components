import { useCombobox, useMultipleSelection } from 'downshift/preact';
import { type ComponentChild } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';

import { DeleteIcon } from '../shared/icons/DeleteIcon';

export function DownshiftMultiCombobox<Item>({
    allItems,
    value,
    filterItemsByInputValue,
    createEvent,
    itemToString,
    placeholderText,
    formatItemInList,
    formatSelectedItem,
    inputClassName = '',
}: {
    allItems: Item[];
    value: Item[];
    filterItemsByInputValue: (item: Item, value: string) => boolean;
    createEvent: (items: Item[]) => CustomEvent;
    itemToString: (item: Item | undefined | null) => string;
    placeholderText?: string;
    formatItemInList: (item: Item) => ComponentChild;
    formatSelectedItem?: (item: Item) => ComponentChild;
    inputClassName?: string;
}) {
    const [selectedItems, setSelectedItems] = useState<Item[]>(() => value);
    const [itemsFilter, setItemsFilter] = useState('');

    useEffect(() => {
        setSelectedItems(value);
    }, [value]);

    const availableItems = useMemo(() => {
        return allItems.filter((item) => {
            const notAlreadySelected = !selectedItems.find(
                (selectedItem) => itemToString(selectedItem) === itemToString(item),
            );
            const matchesFilter = filterItemsByInputValue(item, itemsFilter);
            return notAlreadySelected && matchesFilter;
        });
    }, [allItems, selectedItems, filterItemsByInputValue, itemsFilter, itemToString]);

    const divRef = useRef<HTMLDivElement>(null);

    const dispatchEvent = (items: Item[]) => {
        setSelectedItems(items);
        divRef.current?.dispatchEvent(createEvent(items));
    };

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

    const { getDropdownProps, removeSelectedItem } = useMultipleSelection({
        selectedItems,
        onStateChange({ selectedItems: newSelectedItems, type }) {
            switch (type) {
                case useMultipleSelection.stateChangeTypes.FunctionRemoveSelectedItem:
                    dispatchEvent(newSelectedItems ?? []);
                    break;
                default:
                    break;
            }
        },
        environment,
    });

    const { isOpen, getMenuProps, getInputProps, highlightedIndex, getItemProps, closeMenu } = useCombobox({
        items: availableItems,
        itemToString(item) {
            return itemToString(item);
        },
        inputValue: itemsFilter,
        onStateChange({ inputValue: newInputValue, type, selectedItem: newSelectedItem }) {
            switch (type) {
                case useCombobox.stateChangeTypes.InputKeyDownEnter:
                case useCombobox.stateChangeTypes.ItemClick:
                    if (newSelectedItem) {
                        dispatchEvent([...selectedItems, newSelectedItem]);
                        setItemsFilter('');
                    }
                    break;
                case useCombobox.stateChangeTypes.InputChange:
                    setItemsFilter(newInputValue?.trim() ?? '');
                    break;
                default:
                    break;
            }
        },
        stateReducer(state, actionAndChanges) {
            const { changes, type } = actionAndChanges;
            switch (type) {
                case useCombobox.stateChangeTypes.InputKeyDownEnter:
                case useCombobox.stateChangeTypes.ItemClick:
                    return {
                        ...changes,
                        isOpen: true,
                        highlightedIndex: state.highlightedIndex,
                        inputValue: '',
                    };
                default:
                    return changes;
            }
        },
        environment,
    });

    const clearAll = () => {
        dispatchEvent([]);
        setItemsFilter('');
    };

    const buttonRef = useRef(null);

    return (
        <div ref={divRef} className={'relative w-full'}>
            <div className='w-full flex flex-col gap-1'>
                <div
                    className={`flex gap-1 flex-wrap p-1.5 input min-w-32 w-full ${inputClassName}`}
                    onBlur={(event) => {
                        if (event.relatedTarget != buttonRef.current) {
                            closeMenu();
                        }
                    }}
                >
                    {selectedItems.map((selectedItem, index) => (
                        <span
                            key={`${itemToString(selectedItem)}-${index}`}
                            className='inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-black rounded'
                        >
                            {formatSelectedItem ? formatSelectedItem(selectedItem) : itemToString(selectedItem)}
                            <button
                                aria-label={`remove ${itemToString(selectedItem)}`}
                                className='cursor-pointer hover:text-red-600'
                                type='button'
                                onClick={() => removeSelectedItem(selectedItem)}
                                tabIndex={-1}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                    <div className='flex gap-0.5 grow min-w-32'>
                        <input
                            placeholder={placeholderText}
                            className='w-full px-1 py-0.5 focus:outline-none min-w-24'
                            {...getInputProps(getDropdownProps({ preventKeyAction: isOpen }))}
                        />
                        <button
                            aria-label='clear all selections'
                            className={`px-2 ${selectedItems.length === 0 && 'hidden'}`}
                            type='button'
                            onClick={clearAll}
                            tabIndex={-1}
                        >
                            <DeleteIcon />
                        </button>
                        <button
                            aria-label='toggle menu'
                            className='px-2'
                            type='button'
                            ref={buttonRef}
                            onClick={() => {
                                if (!isOpen) {
                                    getInputProps().onFocus?.({} as any);
                                }
                            }}
                        >
                            {isOpen ? <>↑</> : <>↓</>}
                        </button>
                    </div>
                </div>
            </div>
            <ul
                className={`absolute bg-white mt-1 shadow-md max-h-80 overflow-scroll z-10 w-full min-w-32 ${isOpen ? '' : 'hidden'}`}
                {...getMenuProps()}
            >
                {availableItems.length > 0 ? (
                    availableItems.map((item, index) => (
                        <li
                            className={`${highlightedIndex === index ? 'bg-blue-300' : ''} py-2 px-3 shadow-xs cursor-pointer`}
                            key={`${itemToString(item)}-${index}`}
                            {...getItemProps({ item, index })}
                        >
                            {formatItemInList(item)}
                        </li>
                    ))
                ) : (
                    <li className='py-2 px-3 shadow-xs'>
                        {selectedItems.length > 0 ? 'No more elements to select.' : 'No elements to select.'}
                    </li>
                )}
            </ul>
        </div>
    );
}
