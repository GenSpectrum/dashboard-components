import { useCombobox, useMultipleSelection } from 'downshift/preact';
import { type ComponentChild } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';

import { DeleteIcon } from '../shared/icons/DeleteIcon';

export function DownshiftCombobox<Item>({
    allItems,
    value,
    filterItemsByInputValue,
    createEvent,
    itemToString,
    placeholderText,
    formatItemInList,
    inputClassName = '',
}: {
    allItems: Item[];
    value: Item | null;
    filterItemsByInputValue: (item: Item, value: string) => boolean;
    createEvent: (item: Item | null) => CustomEvent;
    itemToString: (item: Item | undefined | null) => string;
    placeholderText?: string;
    formatItemInList: (item: Item) => ComponentChild;
    inputClassName?: string;
}) {
    const [selectedItem, setSelectedItem] = useState<Item | null>(() => value);
    const [itemsFilter, setItemsFilter] = useState(() => itemToString(selectedItem));

    useEffect(() => {
        setSelectedItem(value);
        setItemsFilter(itemToString(value));
    }, [itemToString, value]);

    const items = useMemo(
        () => allItems.filter((item) => filterItemsByInputValue(item, itemsFilter)),
        [allItems, filterItemsByInputValue, itemsFilter],
    );
    const divRef = useRef<HTMLDivElement>(null);
    const [inputIsInvalid, setInputIsInvalid] = useState(false);

    const selectItem = (item: Item | null) => {
        setSelectedItem(item);
        divRef.current?.dispatchEvent(createEvent(item));
    };

    const environment = useShadowEnvironment(divRef);

    const {
        isOpen,
        getToggleButtonProps,
        getMenuProps,
        getInputProps,
        highlightedIndex,
        getItemProps,
        inputValue,
        closeMenu,
        reset,
    } = useCombobox({
        onInputValueChange({ inputValue }) {
            setInputIsInvalid(false);
            setItemsFilter(inputValue.trim());
        },
        onSelectedItemChange({ selectedItem }) {
            selectItem(selectedItem);
        },
        items,
        itemToString(item) {
            return itemToString(item);
        },
        selectedItem,
        environment,
    });

    const onInputBlur = () => {
        if (inputValue === '') {
            selectItem(null);
            return;
        }

        const trimmedInput = inputValue.trim();
        const matchingItem = items.find((item) => itemToString(item) === trimmedInput);
        if (matchingItem !== undefined) {
            selectItem(matchingItem);
            return;
        }

        setInputIsInvalid(true);
    };

    const clearInput = () => {
        reset();
    };

    const buttonRef = useRef(null);

    return (
        <div ref={divRef} className={'relative w-full'}>
            <div className='w-full flex flex-col gap-1'>
                <div
                    className={`flex gap-0.5 input min-w-32 w-full ${inputClassName} ${inputIsInvalid ? 'input-error' : ''}`}
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
                    <ClearButton onClick={clearInput} isHidden={inputValue === ''} />
                    <ToggleButton isOpen={isOpen} buttonRef={buttonRef} getToggleButtonProps={getToggleButtonProps} />
                </div>
            </div>
            <DropdownMenu
                isOpen={isOpen}
                getMenuProps={getMenuProps}
                items={items}
                highlightedIndex={highlightedIndex}
                getItemProps={getItemProps}
                formatItemInList={formatItemInList}
                itemToString={itemToString}
                selectedItem={selectedItem}
                emptyMessage='No elements to select.'
            />
        </div>
    );
}

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

    const environment = useShadowEnvironment(divRef);

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

    const { isOpen, getToggleButtonProps, getMenuProps, getInputProps, highlightedIndex, getItemProps, closeMenu } =
        useCombobox({
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
                    className={`flex gap-1 flex-wrap p-1.5 input min-w-24 h-fit w-full ${inputClassName}`}
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
                        <ClearButton onClick={clearAll} isHidden={selectedItems.length === 0} />
                        <ToggleButton
                            isOpen={isOpen}
                            buttonRef={buttonRef}
                            getToggleButtonProps={getToggleButtonProps}
                        />
                    </div>
                </div>
            </div>
            <DropdownMenu
                isOpen={isOpen}
                getMenuProps={getMenuProps}
                items={availableItems}
                highlightedIndex={highlightedIndex}
                getItemProps={getItemProps}
                formatItemInList={formatItemInList}
                itemToString={itemToString}
                selectedItem={selectedItems}
                emptyMessage={selectedItems.length > 0 ? 'No more elements to select.' : 'No elements to select.'}
            />
        </div>
    );
}

function useShadowEnvironment(divRef: React.RefObject<HTMLDivElement>) {
    const shadowRoot = divRef.current?.shadowRoot ?? undefined;

    return shadowRoot !== undefined
        ? {
              addEventListener: window.addEventListener.bind(window),
              removeEventListener: window.removeEventListener.bind(window),
              document: shadowRoot.ownerDocument,
              Node: window.Node,
          }
        : undefined;
}

function ToggleButton({
    isOpen,
    buttonRef,
    getToggleButtonProps,
    onClick,
}: {
    isOpen: boolean;
    buttonRef?: React.Ref<HTMLButtonElement>;
    getToggleButtonProps?: () => Record<string, unknown>;
    onClick?: () => void;
}) {
    const props = getToggleButtonProps ? getToggleButtonProps() : { onClick };
    return (
        <button aria-label='toggle menu' className='px-2' type='button' {...props} ref={buttonRef}>
            {isOpen ? <>↑</> : <>↓</>}
        </button>
    );
}

function ClearButton({ onClick, isHidden }: { onClick: () => void; isHidden: boolean }) {
    return (
        <button
            aria-label='clear selection'
            className={`px-2 ${isHidden ? 'hidden' : ''}`}
            type='button'
            onClick={onClick}
            tabIndex={-1}
        >
            <DeleteIcon />
        </button>
    );
}

function DropdownMenu<Item>({
    isOpen,
    getMenuProps,
    items,
    highlightedIndex,
    getItemProps,
    formatItemInList,
    itemToString,
    selectedItem,
    emptyMessage,
}: {
    isOpen: boolean;
    getMenuProps: () => Record<string, unknown>;
    items: Item[];
    highlightedIndex: number;
    getItemProps: (options: { item: Item; index: number }) => Record<string, unknown>;
    formatItemInList: (item: Item) => ComponentChild;
    itemToString: (item: Item) => string;
    selectedItem?: Item | Item[] | null;
    emptyMessage: string;
}) {
    const isItemSelected = (item: Item) => {
        if (Array.isArray(selectedItem)) {
            return selectedItem.some((selected) => itemToString(selected) === itemToString(item));
        }
        return selectedItem !== null && selectedItem !== undefined && itemToString(selectedItem) === itemToString(item);
    };

    return (
        <ul
            className={`absolute bg-white mt-1 shadow-md max-h-80 overflow-scroll z-10 w-full min-w-32 ${isOpen ? '' : 'hidden'}`}
            {...getMenuProps()}
        >
            {items.length > 0 ? (
                items.map((item, index) => (
                    <li
                        className={`${highlightedIndex === index ? 'bg-blue-300' : ''} ${isItemSelected(item) ? 'font-bold' : ''} py-2 px-3 shadow-xs cursor-pointer`}
                        key={itemToString(item)}
                        {...getItemProps({ item, index })}
                    >
                        {formatItemInList(item)}
                    </li>
                ))
            ) : (
                <li className='py-2 px-3 shadow-xs'>{emptyMessage}</li>
            )}
        </ul>
    );
}
