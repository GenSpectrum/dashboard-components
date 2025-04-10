import { useCombobox } from 'downshift/preact';
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
    value?: Item | null;
    filterItemsByInputValue: (item: Item, value: string) => boolean;
    createEvent: (item: Item | null) => CustomEvent;
    itemToString: (item: Item | undefined | null) => string;
    placeholderText?: string;
    formatItemInList: (item: Item) => ComponentChild;
    inputClassName?: string;
}) {
    const [selectedItem, setSelectedItem] = useState(() => value);
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
        inputValue,
        selectItem,
        closeMenu,
    } = useCombobox({
        onInputValueChange({ inputValue }) {
            setInputIsInvalid(false);
            setItemsFilter(inputValue.trim());
        },
        onSelectedItemChange({ selectedItem }) {
            setSelectedItem(selectedItem);
            if (selectedItem !== null) {
                divRef.current?.dispatchEvent(createEvent(selectedItem));
            }
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
            divRef.current?.dispatchEvent(createEvent(null));
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
        divRef.current?.dispatchEvent(createEvent(null));
        selectItem(null);
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
                    <button
                        aria-label='clear selection'
                        className={`px-2 ${inputValue === '' && 'hidden'}`}
                        type='button'
                        onClick={clearInput}
                        tabIndex={-1}
                    >
                        <DeleteIcon />
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
                className={`absolute bg-white mt-1 shadow-md max-h-80 overflow-scroll z-10 w-full min-w-32 ${isOpen ? '' : 'hidden'}`}
                {...getMenuProps()}
            >
                {items.length > 0 ? (
                    items.map((item, index) => (
                        <li
                            className={`${highlightedIndex === index ? 'bg-blue-300' : ''} ${selectedItem !== null && itemToString(selectedItem) === itemToString(item) ? 'font-bold' : ''} py-2 px-3 shadow-xs`}
                            key={itemToString(item)}
                            {...getItemProps({ item, index })}
                        >
                            {formatItemInList(item)}
                        </li>
                    ))
                ) : (
                    <li className='py-2 px-3 shadow-xs'>No elements to select.</li>
                )}
            </ul>
        </div>
    );
}
