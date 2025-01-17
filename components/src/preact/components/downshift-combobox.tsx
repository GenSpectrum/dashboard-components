import { useCombobox } from 'downshift/preact';
import { type ComponentChild } from 'preact';
import { useMemo, useRef, useState } from 'preact/hooks';

export function DownshiftCombobox<Item, Data>({
    allData,
    convertToItem,
    value,
    filterItemsByInputValue,
    createEvent,
    itemToString,
    placeholderText,
    formatItemInList,
}: {
    allData: Data[];
    convertToItem: (data: Data) => Item | undefined;
    value?: Data;
    filterItemsByInputValue: (item: Item, value: string) => boolean;
    createEvent: (item: Item | null) => CustomEvent;
    itemToString: (item: Item | undefined | null) => string;
    placeholderText?: string;
    formatItemInList: (item: Item) => ComponentChild;
}) {
    const allItems = useMemo(
        () =>
            allData
                .map((data) => {
                    return convertToItem(data);
                })
                .filter((item): item is Item => item !== undefined),
        [allData, convertToItem],
    );

    const initialSelectedItem = useMemo(
        () => (value !== undefined ? convertToItem(value) : null),
        [value, convertToItem],
    );

    const [items, setItems] = useState(
        allItems.filter((item) => filterItemsByInputValue(item, itemToString(initialSelectedItem))),
    );
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
            setItems(allItems.filter((item) => filterItemsByInputValue(item, inputValue)));
        },
        onSelectedItemChange({ selectedItem }) {
            if (selectedItem !== null) {
                divRef.current?.dispatchEvent(createEvent(selectedItem));
            }
        },
        items,
        itemToString(item) {
            return itemToString(item);
        },
        initialSelectedItem,
        environment,
    });

    const onInputBlur = () => {
        if (inputValue === '') {
            divRef.current?.dispatchEvent(createEvent(null));
            selectItem(null);
        } else if (inputValue !== itemToString(selectedItem)) {
            setInputValue(itemToString(selectedItem) || '');
        }
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
                            className={`${highlightedIndex === index && 'bg-blue-300'} ${selectedItem !== null && itemToString(selectedItem) === itemToString(item) && 'font-bold'} py-2 px-3 shadow-sm flex flex-col`}
                            key={itemToString(item)}
                            {...getItemProps({ item, index })}
                        >
                            {formatItemInList(item)}
                        </li>
                    ))}
            </ul>
        </div>
    );
}
