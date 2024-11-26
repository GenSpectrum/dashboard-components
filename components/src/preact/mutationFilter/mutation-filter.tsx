import { type FunctionComponent } from 'preact';
import { useContext, useState, useRef } from 'preact/hooks';

import { MutationFilterInfo } from './mutation-filter-info';
import { parseAndValidateMutation, type ParsedMutationFilter } from './parseAndValidateMutation';
import { type ReferenceGenome } from '../../lapisApi/ReferenceGenome';
import { type DeletionClass, type InsertionClass, type SubstitutionClass } from '../../utils/mutations';
import { ReferenceGenomeContext } from '../ReferenceGenomeContext';
import { ErrorBoundary } from '../components/error-boundary';
import { singleGraphColorRGBByName } from '../shared/charts/colors';

export interface MutationFilterInnerProps {
    initialValue?: SelectedMutationFilterStrings | string[] | undefined;
}

export interface MutationFilterProps extends MutationFilterInnerProps {
    width: string;
}

export type SelectedFilters = {
    nucleotideMutations: (SubstitutionClass | DeletionClass)[];
    aminoAcidMutations: (SubstitutionClass | DeletionClass)[];
    nucleotideInsertions: InsertionClass[];
    aminoAcidInsertions: InsertionClass[];
};

export type SelectedMutationFilterStrings = {
    [Key in keyof SelectedFilters]: string[];
};

export const MutationFilter: FunctionComponent<MutationFilterProps> = ({ initialValue, width }) => {
    return (
        <ErrorBoundary size={{ height: '3.375rem', width }} layout='horizontal'>
            <div style={width}>
                <MutationFilterInner initialValue={initialValue} />
            </div>
        </ErrorBoundary>
    );
};

export const MutationFilterInner: FunctionComponent<MutationFilterInnerProps> = ({ initialValue }) => {
    const referenceGenome = useContext(ReferenceGenomeContext);
    const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>(
        getInitialState(initialValue, referenceGenome),
    );

    const filterRef = useRef<HTMLDivElement>(null);

    const handleRemoveValue = (option: ParsedMutationFilter) => {
        const newSelectedFilters = {
            ...selectedFilters,
            [option.type]: selectedFilters[option.type].filter((i) => option.value.toString() != i.toString()),
        };

        setSelectedFilters(newSelectedFilters);
        fireChangeEvent(newSelectedFilters);
    };

    const fireChangeEvent = (selectedFilters: SelectedFilters) => {
        const detail = mapToMutationFilterStrings(selectedFilters);

        filterRef.current?.dispatchEvent(
            new CustomEvent<SelectedMutationFilterStrings>('gs-mutation-filter-changed', {
                detail,
                bubbles: true,
                composed: true,
            }),
        );
    };

    return (
        <div className='w-full border border-gray-300 rounded-md relative' ref={filterRef}>
            <div className='absolute -top-3 -right-3 z-10'>
                <MutationFilterInfo />
            </div>

            <div className='relative w-full p-1'>
                <MutationFilterSelector
                    referenceGenome={referenceGenome}
                    setSelectedFilters={(newSelectedFilters) => {
                        setSelectedFilters(newSelectedFilters);
                        fireChangeEvent(newSelectedFilters);
                    }}
                    selectedFilters={selectedFilters}
                />
                <SelectedMutationFilterDisplay
                    selectedFilters={selectedFilters}
                    handleRemoveValue={handleRemoveValue}
                />
            </div>
        </div>
    );
};

function getInitialState(
    initialValue: SelectedMutationFilterStrings | string[] | undefined,
    referenceGenome: ReferenceGenome,
) {
    if (initialValue === undefined) {
        return {
            nucleotideMutations: [],
            aminoAcidMutations: [],
            nucleotideInsertions: [],
            aminoAcidInsertions: [],
        };
    }

    const values = Array.isArray(initialValue) ? initialValue : Object.values(initialValue).flatMap((it) => it);

    return values.reduce(
        (selectedFilters, value) => {
            const parsedMutation = parseAndValidateMutation(value, referenceGenome);
            if (parsedMutation === null) {
                return selectedFilters;
            }

            return {
                ...selectedFilters,
                [parsedMutation.type]: [...selectedFilters[parsedMutation.type], parsedMutation.value],
            };
        },
        {
            nucleotideMutations: [],
            aminoAcidMutations: [],
            nucleotideInsertions: [],
            aminoAcidInsertions: [],
        } as SelectedFilters,
    );
}

const MutationFilterSelector: FunctionComponent<{
    referenceGenome: ReferenceGenome;
    setSelectedFilters: (option: SelectedFilters) => void;
    selectedFilters: SelectedFilters;
}> = ({ referenceGenome, setSelectedFilters, selectedFilters }) => {
    const [option, setOption] = useState<ParsedMutationFilter | null>(null);
    const [inputValue, setInputValue] = useState('');

    const selectorRef = useRef<HTMLDivElement>(null);

    const handleInputChange = (newValue: string) => {
        if (newValue.includes(',') || newValue.includes(';')) {
            handleCommaSeparatedInput(newValue);
        } else {
            setInputValue(newValue);
            const result = parseAndValidateMutation(newValue, referenceGenome);
            setOption(result);
        }
    };

    const handleCommaSeparatedInput = (inputValue: string) => {
        const inputValues = inputValue.split(/[,;]/);
        let newSelectedOptions = selectedFilters;
        let updated: boolean = false;
        const invalidQueries: string[] = [];
        for (const value of inputValues) {
            const trimmedValue = value.trim();
            const parsedMutation = parseAndValidateMutation(trimmedValue, referenceGenome);
            if (parsedMutation) {
                const type = parsedMutation.type;
                if (!selectedFilters[type].some((i) => parsedMutation.value.toString() === i.toString())) {
                    newSelectedOptions = {
                        ...newSelectedOptions,
                        [parsedMutation.type]: [...newSelectedOptions[parsedMutation.type], parsedMutation.value],
                    };
                    updated = true;
                }
            } else {
                invalidQueries.push(trimmedValue);
            }
        }

        setInputValue(invalidQueries.join(','));

        if (updated) {
            setSelectedFilters(newSelectedOptions);
            setOption(null);
        }
    };

    const handleOptionClick = () => {
        if (option === null) {
            return;
        }

        const type = option.type;

        if (!selectedFilters[type].some((i) => option.value.toString() === i.toString())) {
            const newSelectedValues = {
                ...selectedFilters,
                [option?.type]: [...selectedFilters[option?.type], option?.value],
            };
            setSelectedFilters(newSelectedValues);
        }

        setInputValue('');
        setOption(null);
    };

    const handleEnterPress = (event: KeyboardEvent) => {
        if (event.key === 'Enter' && option !== null) {
            handleOptionClick();
        }
    };

    const handleBlur = (event: FocusEvent) => {
        // Check if click was inside the selector
        if (!selectorRef.current?.contains(event.relatedTarget as Node)) {
            setOption(null);
        }
    };

    return (
        <div ref={selectorRef} tabIndex={-1}>
            <input
                type='text'
                className='w-full p-2 border-gray-300 border rounded-md'
                placeholder={getPlaceholder(referenceGenome)}
                value={inputValue}
                onInput={(e: Event) => {
                    handleInputChange((e.target as HTMLInputElement).value);
                }}
                onKeyDown={(e) => handleEnterPress(e)}
                onFocus={() => handleInputChange(inputValue)}
                onBlur={handleBlur}
            />
            {option != null && (
                <div
                    role='option'
                    className='hover:bg-gray-300 absolute cursor-pointer p-2 border-1 border-slate-500 bg-slate-200'
                    onClick={() => handleOptionClick()}
                >
                    {option.value.toString()}
                </div>
            )}
        </div>
    );
};

function getPlaceholder(referenceGenome: ReferenceGenome) {
    const segmentPrefix =
        referenceGenome.nucleotideSequences.length > 1 ? `${referenceGenome.nucleotideSequences[0].name}:` : '';
    const firstGene = referenceGenome.genes[0].name;

    return `Enter a mutation (e.g. ${segmentPrefix}A123T, ins_${segmentPrefix}123:AT, ${firstGene}:M123E, ins_${firstGene}:123:ME)`;
}

const backgroundColor: { [key in keyof SelectedFilters]: string } = {
    aminoAcidMutations: singleGraphColorRGBByName('teal', 0.4),
    nucleotideMutations: singleGraphColorRGBByName('green', 0.4),
    aminoAcidInsertions: singleGraphColorRGBByName('purple', 0.4),
    nucleotideInsertions: singleGraphColorRGBByName('indigo', 0.4),
};

const backgroundColorMap = (data: ParsedMutationFilter) => {
    return backgroundColor[data.type] || 'lightgray';
};

const SelectedMutationFilterDisplay: FunctionComponent<{
    selectedFilters: SelectedFilters;
    handleRemoveValue: (option: ParsedMutationFilter) => void;
}> = ({ selectedFilters, handleRemoveValue }) => {
    return (
        <div className='flex flex-wrap'>
            {selectedFilters.nucleotideMutations.map((mutation) => (
                <SelectedFilter
                    key={mutation.toString()}
                    handleRemoveValue={handleRemoveValue}
                    mutationFilter={{ type: 'nucleotideMutations', value: mutation }}
                />
            ))}
            {selectedFilters.aminoAcidMutations.map((mutation) => (
                <SelectedFilter
                    key={mutation.toString()}
                    handleRemoveValue={handleRemoveValue}
                    mutationFilter={{ type: 'aminoAcidMutations', value: mutation }}
                />
            ))}
            {selectedFilters.nucleotideInsertions.map((mutation) => (
                <SelectedFilter
                    key={mutation.toString()}
                    handleRemoveValue={handleRemoveValue}
                    mutationFilter={{ type: 'nucleotideInsertions', value: mutation }}
                />
            ))}
            {selectedFilters.aminoAcidInsertions.map((mutation) => (
                <SelectedFilter
                    key={mutation.toString()}
                    handleRemoveValue={handleRemoveValue}
                    mutationFilter={{ type: 'aminoAcidInsertions', value: mutation }}
                />
            ))}
        </div>
    );
};

type SelectedFilterProps = {
    handleRemoveValue: (mutation: ParsedMutationFilter) => void;
    mutationFilter: ParsedMutationFilter;
};

const SelectedFilter = ({ handleRemoveValue, mutationFilter }: SelectedFilterProps) => {
    return (
        <span
            key={mutationFilter.value.toString()}
            className='center p-2 m-1 inline-flex text-black rounded-md'
            style={{
                backgroundColor: backgroundColorMap(mutationFilter),
            }}
        >
            {mutationFilter.value.toString()}
            <button className='ml-1' onClick={() => handleRemoveValue(mutationFilter)}>
                ×
            </button>
        </span>
    );
};

function mapToMutationFilterStrings(selectedFilters: SelectedFilters) {
    return {
        aminoAcidMutations: selectedFilters.aminoAcidMutations.map((mutation) => mutation.toString()),
        nucleotideMutations: selectedFilters.nucleotideMutations.map((mutation) => mutation.toString()),
        aminoAcidInsertions: selectedFilters.aminoAcidInsertions.map((insertion) => insertion.toString()),
        nucleotideInsertions: selectedFilters.nucleotideInsertions.map((insertion) => insertion.toString()),
    };
}
