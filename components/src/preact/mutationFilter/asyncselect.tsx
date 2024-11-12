import { h } from 'preact';
import { type CSSProperties } from 'preact/compat';
import { useState, useEffect, useRef } from 'preact/hooks';

import { type SearchOption } from './parseAndValidateMutation';

type AsyncSelectProps = {
    className?: string;
    placeholder?: string;
    isMulti?: boolean;
    loadOptions: (inputValue: string) => Promise<SearchOption[]>;
    onInputChange: (value: string) => void;
    inputValue: string;
    onChange: (
        actionMeta: { action: string; removedValue?: SearchOption },
        value?: SearchOption | SearchOption[],
    ) => void;
    menuIsOpen?: boolean;
    styles?: {
        input?: CSSProperties;
        menu?: CSSProperties;
        option?: CSSProperties;
        selectedList?: CSSProperties;
        selectedItem?: CSSProperties;
        loading?: CSSProperties;
        multiValue?: (data: SearchOption) => CSSProperties;
    };
    onBlur?: () => void;
};

const AsyncSelect = ({
    className,
    placeholder,
    isMulti = false,
    loadOptions,
    onInputChange,
    inputValue,
    onChange,
    menuIsOpen = false,
    styles = {},
    onBlur,
}: AsyncSelectProps) => {
    const [options, setSearchOptions] = useState<SearchOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [menuVisible, setMenuVisible] = useState(menuIsOpen);
    const [selectedValues, setSelectedValues] = useState<SearchOption[]>([]);

    const wrapperRef = useRef<HTMLDivElement>(null);

    // Load options asynchronously based on input value
    useEffect(() => {
        const loadAsyncSearchOptions = async () => {
            setLoading(true);
            const result = await loadOptions(inputValue);
            setSearchOptions(result);
            setLoading(false);
        };

        if (inputValue) loadAsyncSearchOptions();
    }, [inputValue, loadOptions]);

    const handleSearchOptionClick = (option: SearchOption) => {
        if (isMulti) {
            const newSelectedValues = [...selectedValues, option];
            setSelectedValues(newSelectedValues);
            onChange({ action: 'select-option' });
            setSearchOptions([]);
            setMenuVisible(false);
        } else {
            setSelectedValues([option]);
            onChange({ action: 'select-option' });
            setSearchOptions([]);
            setMenuVisible(false);
        }
    };

    const handleRemoveValue = (option: SearchOption) => {
        const newSelectedValues = selectedValues.filter((val) => val.value !== option.value);
        setSelectedValues(newSelectedValues);
        onChange({ action: 'remove-value', removedValue: option });
    };

    const handleBlur = (event: FocusEvent) => {
        // Check if click was outside the wrapper
        if (!wrapperRef.current?.contains(event.relatedTarget as Node)) {
            onBlur?.();
            setMenuVisible(false);
        }
    };

    return (
        <div className={className} style={{ position: 'relative' }} ref={wrapperRef} tabIndex={-1}>
            <input
                type='text'
                className={className}
                placeholder={placeholder}
                value={inputValue}
                onInput={(e: Event) => onInputChange((e.target as HTMLInputElement).value)}
                onFocus={() => setMenuVisible(true)}
                onBlur={handleBlur}
                style={styles.input}
            />
            {menuVisible && (
                <ul style={{ ...styles.menu, position: 'absolute' }}>
                    {loading ? (
                        <li style={styles.loading}>Loading...</li>
                    ) : (
                        options.map((option) => (
                            <li
                                key={option.value}
                                role='option'
                                style={styles.option}
                                onClick={() => handleSearchOptionClick(option)}
                            >
                                {option.label}
                            </li>
                        ))
                    )}
                </ul>
            )}
            {isMulti && (
                <div style={styles.selectedList}>
                    {selectedValues.map((selected) => (
                        <span
                            key={selected.value}
                            style={{
                                ...(styles.multiValue ? styles.multiValue(selected) : {}),
                                display: 'inline-flex',
                                alignItems: 'center',
                            }}
                            name={selected.value}
                            onClick={() => handleRemoveValue(selected)}
                        >
                            {selected.label} &times;
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AsyncSelect;
