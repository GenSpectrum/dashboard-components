import { type FunctionComponent, type h } from 'preact';
import { type Dispatch, type StateUpdater, useCallback, useEffect, useState } from 'preact/hooks';

import { Dropdown } from './dropdown';
import { useRawMutationAnnotations } from '../MutationAnnotationsContext';
import { type MutationFilter } from '../mutationsOverTime/getFilteredMutationsOverTimeData';
import { DeleteIcon } from '../shared/icons/DeleteIcon';

export type MutationsOverTimeMutationsFilterProps = {
    setFilterValue: Dispatch<StateUpdater<MutationFilter>>;
    value: MutationFilter;
};

export function MutationsOverTimeMutationsFilter({ setFilterValue, value }: MutationsOverTimeMutationsFilterProps) {
    return (
        <div className={'w-28 inline-flex'}>
            <Dropdown buttonTitle={getButtonTitle(value)} placement={'bottom-start'}>
                <TextInput value={value} setFilterValue={setFilterValue} />
                <AnnotationCheckboxes value={value} setFilterValue={setFilterValue} />
            </Dropdown>
        </div>
    );
}

function getButtonTitle(value: MutationFilter) {
    if (value.textFilter === '' && value.annotationNameFilter.size === 0) {
        return `Filter mutations`;
    }

    return [value.textFilter, ...value.annotationNameFilter].filter((it) => it !== '').join(', ');
}

const TextInput: FunctionComponent<MutationsOverTimeMutationsFilterProps> = ({ setFilterValue, value }) => {
    const onInput = useCallback(
        (newValue: string) => {
            setFilterValue((previousFilter) => ({
                ...previousFilter,
                textFilter: newValue,
            }));
        },
        [setFilterValue],
    );

    const onDeleteClick = () => {
        setFilterValue((previousFilter) => ({
            ...previousFilter,
            textFilter: '',
        }));
    };

    return (
        <div>
            <label className='flex gap-1 input input-xs'>
                <DebouncedInput placeholder={'Filter'} onInput={onInput} value={value.textFilter} type='text' />
                {value.textFilter !== '' && (
                    <button className={'cursor-pointer'} onClick={onDeleteClick}>
                        <DeleteIcon />
                    </button>
                )}
            </label>
        </div>
    );
};

function DebouncedInput({
    value: initialValue,
    onInput,
    debounce = 500,
    ...props
}: {
    onInput: (value: string) => void;
    debounce?: number;
    value?: string;
} & Omit<h.JSX.IntrinsicElements['input'], 'onInput'>) {
    const [value, setValue] = useState<string | undefined>(initialValue);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            onInput(value ?? '');
        }, debounce);

        return () => clearTimeout(timeout);
    }, [value, debounce, onInput]);

    const onChangeInput = useCallback((event: h.JSX.TargetedEvent<HTMLInputElement>) => {
        setValue(event.currentTarget.value);
    }, []);

    return <input {...props} value={value} onInput={onChangeInput} />;
}

const AnnotationCheckboxes: FunctionComponent<MutationsOverTimeMutationsFilterProps> = ({ value, setFilterValue }) => {
    const mutationAnnotations = useRawMutationAnnotations();

    if (mutationAnnotations.length === 0) {
        return null;
    }

    return (
        <>
            <div className='divider mt-0.5 mb-0' />
            <div className='text-sm'>
                <div className='font-bold mb-1'>Filter by annotations</div>
                {mutationAnnotations.map((annotation, index) => (
                    <li className='flex flex-row items-center' key={annotation.name}>
                        <label>
                            <input
                                className={'mr-2'}
                                type='checkbox'
                                id={`item-${index}`}
                                checked={value.annotationNameFilter.has(annotation.name)}
                                onChange={() => {
                                    setFilterValue((previousFilter) => {
                                        const newAnnotationFilter = previousFilter.annotationNameFilter.has(
                                            annotation.name,
                                        )
                                            ? [...previousFilter.annotationNameFilter].filter(
                                                  (name) => name !== annotation.name,
                                              )
                                            : [...previousFilter.annotationNameFilter, annotation.name];
                                        return {
                                            ...previousFilter,
                                            annotationNameFilter: new Set(newAnnotationFilter),
                                        };
                                    });
                                }}
                            />
                            {annotation.name} (<span className='text-red-600'>{annotation.symbol}</span>)
                        </label>
                    </li>
                ))}
            </div>
        </>
    );
};
