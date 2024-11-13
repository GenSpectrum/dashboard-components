import { h } from 'preact';
import { type CSSProperties } from 'preact/compat';
import { useState, useEffect, useRef } from 'preact/hooks';

export type Option<T extends string> = {
    label: string;
    value: string;
    type: T;
};

export type Action = 'select-option' | 'remove-value' | 'pop-value';

type AsyncSelectProps<T extends string> = {
    className?: string;
    placeholder?: string;
    isMulti?: boolean;
    loadOptions: (inputValue: string) => Promise<Option<T>[]>;
    onInputChange: (value: string) => void;
    inputValue: string;
    onChange: (actionMeta: { action: Action; removedValue?: Option<T> }, value?: Option<T> | Option<T>[]) => void;
    menuIsOpen?: boolean;
    styles?: {
        input?: CSSProperties;
        menu?: CSSProperties;
        option?: CSSProperties;
        selectedList?: CSSProperties;
        selectedItem?: CSSProperties;
        loading?: CSSProperties;
        multiValue?: (data: Option<T>) => CSSProperties;
    };
    onBlur?: () => void;
};

const AsyncSelect = <T extends string>({
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
}: AsyncSelectProps<T>) => {
    const [options, setOptions] = useState<Option<T>[]>([]);
    const [loading, setLoading] = useState(false);
    const [menuVisible, setMenuVisible] = useState(menuIsOpen);
    const [selectedValues, setSelectedValues] = useState<Option<T>[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const wrapperRef = useRef<HTMLDivElement>(null);

    // Load options asynchronously based on input value
    useEffect(() => {
        const loadAsyncOptions = async () => {
            setLoading(true);
            const result = await loadOptions(inputValue);
            setOptions(result);
            setLoading(false);
        };

        if (inputValue) {
            loadAsyncOptions();
        }
    }, [inputValue, loadOptions]);

    const handleEnterPress = (event: KeyboardEvent) => {
        if (event.key === 'Enter' && options.length > 0) {
            // Select the first item in the list if Enter is pressed
            handleOptionClick(options[0]);
            setMenuVisible(true);
        }
    };

    const handleOptionClick = (option: Option<T>) => {
        if (isMulti) {
            const newSelectedValues = [...selectedValues, option];
            setSelectedValues(newSelectedValues);
            onChange({ action: 'select-option' });
            setOptions([]);
            setMenuVisible(false);
        } else {
            setSelectedValues([option]);
            onChange({ action: 'select-option' });
            setOptions([]);
            setMenuVisible(false);
        }
    };

    const handleRemoveValue = (option: Option<T>) => {
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
        <div className={`relative ${className}`} ref={wrapperRef} tabIndex={-1}>
            <input
                type='text'
                ref={inputRef}
                className={className}
                placeholder={placeholder}
                value={inputValue}
                onInput={(e: Event) => onInputChange((e.target as HTMLInputElement).value)}
                onKeyDown={(e: Event) => handleEnterPress(e as KeyboardEvent)}
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
                                onClick={() => handleOptionClick(option)}
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
