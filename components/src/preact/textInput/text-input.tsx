import { useCombobox } from 'downshift/preact';
import { type FunctionComponent } from 'preact';
import { useContext, useRef, useState } from 'preact/hooks';
import z from 'zod';

import { fetchAutocompleteList } from './fetchAutocompleteList';
import { LapisUrlContext } from '../LapisUrlContext';
import { TextChangedEvent } from './TextChangedEvent';
import { ErrorBoundary } from '../components/error-boundary';
import { LoadingDisplay } from '../components/loading-display';
import { NoDataDisplay } from '../components/no-data-display';
import { ResizeContainer } from '../components/resize-container';
import { useQuery } from '../useQuery';

const textInputInnerPropsSchema = z.object({
    lapisField: z.string().min(1),
    placeholderText: z.string().optional(),
    initialValue: z.string().optional(),
});

const textInputPropsSchema = textInputInnerPropsSchema.extend({
    width: z.string(),
});

export type TextInputInnerProps = z.infer<typeof textInputInnerPropsSchema>;
export type TextInputProps = z.infer<typeof textInputPropsSchema>;

export const TextInput: FunctionComponent<TextInputProps> = (props) => {
    const { width, ...innerProps } = props;
    const size = { width, height: '3rem' };

    return (
        <ErrorBoundary size={size} layout='horizontal' componentProps={props} schema={textInputPropsSchema}>
            <ResizeContainer size={size}>
                <TextInputInner {...innerProps} />
            </ResizeContainer>
        </ErrorBoundary>
    );
};

const TextInputInner: FunctionComponent<TextInputInnerProps> = ({ initialValue, lapisField, placeholderText }) => {
    const lapis = useContext(LapisUrlContext);

    const { data, error, isLoading } = useQuery(() => fetchAutocompleteList(lapis, lapisField), [lapisField, lapis]);

    if (isLoading) {
        return <LoadingDisplay />;
    }

    if (error !== null) {
        throw error;
    }

    if (data === null) {
        return <NoDataDisplay />;
    }

    return (
        <TextSelector
            lapisField={lapisField}
            initialValue={initialValue}
            placeholderText={placeholderText}
            data={data}
        />
    );
};

const TextSelector = ({
    lapisField,
    initialValue,
    placeholderText,
    data,
}: TextInputInnerProps & {
    data: string[];
}) => {
    const [items, setItems] = useState(data.filter((item) => filterByInputValue(item, initialValue)));

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

    function filterByInputValue(item: string, inputValue: string | undefined | null) {
        if (inputValue === undefined || inputValue === null || inputValue === '') {
            return true;
        }
        return item === inputValue;
    }

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
            setItems(data.filter((item) => filterByInputValue(item, inputValue)));
        },
        onSelectedItemChange({ selectedItem }) {
            if (selectedItem !== null) {
                divRef.current?.dispatchEvent(new TextChangedEvent({ [lapisField]: selectedItem }));
            }
        },
        items,
        itemToString(item) {
            return item || '';
        },
        initialSelectedItem: initialValue,
        environment,
    });

    const onInputBlur = () => {
        if (inputValue === '') {
            divRef.current?.dispatchEvent(new TextChangedEvent({ [lapisField]: null }));
            selectItem(null);
        } else if (inputValue !== selectedItem) {
            setInputValue(selectedItem || '');
        }
    };

    const clearInput = () => {
        divRef.current?.dispatchEvent(new TextChangedEvent({ [lapisField]: null }));
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
                            className={`${highlightedIndex === index && 'bg-blue-300'} ${selectedItem !== null} py-2 px-3 shadow-sm flex flex-col`}
                            key={item}
                            {...getItemProps({ item, index })}
                        >
                            <span>{item}</span>
                        </li>
                    ))}
            </ul>
        </div>
    );
};
