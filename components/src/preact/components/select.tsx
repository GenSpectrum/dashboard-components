import { type FunctionComponent } from 'preact';
import { type JSXInternal } from 'preact/src/jsx';

export interface SelectProps {
    items: { label: string; value: string; disabled?: boolean }[];
    selected: string;
    onChange: JSXInternal.GenericEventHandler<HTMLSelectElement>;
    selectStyle?: string;
}

export const Select: FunctionComponent<SelectProps> = ({ items, selected, onChange, selectStyle }) => {
    return (
        <select className={`select ${selectStyle} w-fit`} value={selected} onChange={onChange}>
            {items.map((item) => (
                <option key={item.value} value={item.value} disabled={item.disabled}>
                    {item.label}
                </option>
            ))}
        </select>
    );
};
