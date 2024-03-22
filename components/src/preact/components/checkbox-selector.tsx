import { FunctionComponent } from 'preact';

export type CheckboxItem = {
    label: string;
    checked: boolean;
};

export interface CheckboxSelectorProps {
    items: CheckboxItem[];
    label: string;
    setItems: (items: CheckboxItem[]) => void;
}

export const CheckboxSelector: FunctionComponent<CheckboxSelectorProps> = ({ items, label, setItems }) => {
    return (
        <div class='dropdown'>
            <div tabIndex={0} role='button' class='btn btn-xs text-nowrap'>
                {label}
            </div>
            <ul tabIndex={0} class='p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box'>
                {items.map((item, index) => (
                    <li class='flex flex-row items-center' key={item.label}>
                        <label>
                            <input
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
        </div>
    );
};
