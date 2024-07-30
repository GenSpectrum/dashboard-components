import { Dropdown } from './dropdown';

export type CheckboxItem = {
    label: string;
    checked: boolean;
};

export interface CheckboxSelectorProps<Item extends CheckboxItem = CheckboxItem> {
    items: Item[];
    label: string;
    setItems: (items: Item[]) => void;
}

export const CheckboxSelector = <Item extends CheckboxItem>({
    items,
    label,
    setItems,
}: CheckboxSelectorProps<Item>) => {
    return (
        <Dropdown buttonTitle={label} placement={'bottom-start'}>
            <button
                className='btn btn-xs btn-ghost'
                onClick={() => {
                    const newItems = items.map((item) => ({ ...item, checked: true }));
                    setItems(newItems);
                }}
            >
                Select all
            </button>
            <button
                className='btn btn-xs btn-ghost'
                onClick={() => {
                    const newItems = items.map((item) => ({ ...item, checked: false }));
                    setItems(newItems);
                }}
            >
                Select none
            </button>
            <div className='divider mt-0 mb-0' />
            <ul>
                {items.map((item, index) => (
                    <li className='flex flex-row items-center' key={item.label}>
                        <label>
                            <input
                                className={'mr-2'}
                                type='checkbox'
                                id={`item-${index}`}
                                checked={item.checked}
                                onChange={() => {
                                    const newItems = items.map((item, i) =>
                                        i === index ? { ...item, checked: !item.checked } : item,
                                    );
                                    setItems(newItems);
                                }}
                            />
                            {item.label}
                        </label>
                    </li>
                ))}
            </ul>
        </Dropdown>
    );
};
