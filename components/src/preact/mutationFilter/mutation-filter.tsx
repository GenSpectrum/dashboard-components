import { useCombobox, useMultipleSelection } from 'downshift/preact';
import { type FunctionComponent } from 'preact';
import { useContext, useMemo, useRef, useState } from 'preact/hooks';
import z from 'zod';

import { getExampleMutation } from './ExampleMutation';
import { MutationFilterInfo } from './mutation-filter-info';
import { parseAndValidateMutation, type ParsedMutationFilter } from './parseAndValidateMutation';
import { type ReferenceGenome } from '../../lapisApi/ReferenceGenome';
import { type MutationsFilter, mutationsFilterSchema } from '../../types';
import { type DeletionClass, type InsertionClass, type SubstitutionClass } from '../../utils/mutations';
import { ReferenceGenomeContext } from '../ReferenceGenomeContext';
import { ErrorBoundary } from '../components/error-boundary';
import { UserFacingError } from '../components/error-display';
import { singleGraphColorRGBByName } from '../shared/charts/colors';

const mutationFilterInnerPropsSchema = z.object({
    initialValue: z.union([mutationsFilterSchema.optional(), z.array(z.string()), z.undefined()]),
});

const mutationFilterPropsSchema = mutationFilterInnerPropsSchema.extend({
    width: z.string(),
});

export type MutationFilterInnerProps = z.infer<typeof mutationFilterInnerPropsSchema>;
export type MutationFilterProps = z.infer<typeof mutationFilterPropsSchema>;

export type SelectedFilters = {
    nucleotideMutations: (SubstitutionClass | DeletionClass)[];
    aminoAcidMutations: (SubstitutionClass | DeletionClass)[];
    nucleotideInsertions: InsertionClass[];
    aminoAcidInsertions: InsertionClass[];
};

type SelectedNucleotideMutation = {
    type: 'nucleotideMutations';
    value: SubstitutionClass | DeletionClass;
};

type SelectedAminoAcidMutation = {
    type: 'aminoAcidMutations';
    value: SubstitutionClass | DeletionClass;
};

type SelectedNucleotideInsertion = {
    type: 'nucleotideInsertions';
    value: InsertionClass;
};

type SelectedAminoAcidInsertion = {
    type: 'aminoAcidInsertions';
    value: InsertionClass;
};

type SelectedItem =
    | SelectedNucleotideMutation
    | SelectedAminoAcidMutation
    | SelectedNucleotideInsertion
    | SelectedAminoAcidInsertion;

export const MutationFilter: FunctionComponent<MutationFilterProps> = (props) => {
    const { width, initialValue } = props;
    return (
        <ErrorBoundary
            size={{ height: '40px', width }}
            layout='horizontal'
            schema={mutationFilterPropsSchema}
            componentProps={props}
        >
            <div style={width}>
                <MutationFilterNewInner initialValue={initialValue} />
            </div>
        </ErrorBoundary>
    );
};

function MutationFilterNewInner({ initialValue }: MutationFilterInnerProps) {
    const referenceGenome = useContext(ReferenceGenomeContext);
    const filterRef = useRef<HTMLDivElement>(null);
    const [inputValue, setInputValue] = useState('');
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>(getInitialState(initialValue, referenceGenome));
    const [itemCandidate, setItemCandidate] = useState<SelectedItem | null>(null);
    const [showErrorIndicator, setShowErrorIndicator] = useState(false);

    const items = useMemo(() => {
        return itemCandidate ? [itemCandidate] : [];
    }, [itemCandidate]);

    const fireChangeEvent = (selectedFilters: SelectedItem[]) => {
        const detail = mapToMutationFilterStrings(selectedFilters);

        filterRef.current?.dispatchEvent(
            new CustomEvent<MutationsFilter>('gs-mutation-filter-changed', {
                detail,
                bubbles: true,
                composed: true,
            }),
        );
    };

    const handleSelectedItemsChanged = (newSelectedItems: SelectedItem[]) => {
        fireChangeEvent(newSelectedItems);
        setSelectedItems(newSelectedItems);
    };

    const { getDropdownProps, removeSelectedItem } = useMultipleSelection({
        selectedItems,
        onStateChange({ selectedItems: newSelectedItems, type }) {
            switch (type) {
                case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownBackspace:
                case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownDelete:
                case useMultipleSelection.stateChangeTypes.DropdownKeyDownBackspace:
                case useMultipleSelection.stateChangeTypes.FunctionRemoveSelectedItem:
                    handleSelectedItemsChanged(newSelectedItems ?? []);
                    break;
                default:
                    break;
            }
        },
    });

    const { isOpen, getMenuProps, getInputProps, highlightedIndex, getItemProps, selectedItem } = useCombobox({
        items,
        itemToString(item: SelectedItem | undefined | null) {
            return item ? item.value.code : '';
        },
        defaultHighlightedIndex: 0,
        selectedItem: null,
        inputValue,
        onStateChange({ inputValue: newInputValue, type, selectedItem: newSelectedItem }) {
            switch (type) {
                case useCombobox.stateChangeTypes.InputKeyDownEnter:
                case useCombobox.stateChangeTypes.ItemClick:
                case useCombobox.stateChangeTypes.InputBlur:
                    if (newSelectedItem) {
                        handleSelectedItemsChanged([...selectedItems, newSelectedItem]);
                        setInputValue('');
                        setItemCandidate(null);
                        setShowErrorIndicator(false);
                    }
                    break;

                case useCombobox.stateChangeTypes.InputChange: {
                    setShowErrorIndicator(false);
                    if (newInputValue?.includes(',')) {
                        const values = newInputValue?.split(',').map((value) => {
                            return { value, parsedValue: parseAndValidateMutation(value.trim(), referenceGenome) };
                        });
                        const validEntries = values.map((value) => value.parsedValue).filter((value) => value !== null);
                        const invalidInput = values
                            .filter((value) => value.parsedValue === null)
                            .map((value) => value.value.trim())
                            .join(',');

                        handleSelectedItemsChanged([...selectedItems, ...validEntries]);
                        setInputValue(invalidInput);
                        setItemCandidate(null);
                    } else {
                        setInputValue(newInputValue ?? '');
                        if (newInputValue !== undefined) {
                            const candidate = parseAndValidateMutation(newInputValue, referenceGenome);
                            if (candidate) {
                                setItemCandidate(candidate);
                            } else {
                                setItemCandidate(null);
                            }
                        }
                    }

                    break;
                }
                default:
                    break;
            }
        },
    });

    if (referenceGenome.nucleotideSequences.length === 0 && referenceGenome.genes.length === 0) {
        throw new UserFacingError(
            'No reference sequences available',
            'This organism has neither nucleotide nor amino acid sequences configured in its reference genome. You cannot filter by mutations.',
        );
    }

    return (
        <div className='w-full' ref={filterRef}>
            <div className={`flex gap-x-1 flex-wrap p-1 input h-fit w-full ${showErrorIndicator ? 'input-error' : ''}`}>
                {selectedItems.map((selectedItemForRender, index) => {
                    return (
                        <div className='my-1' key={`selected-item-${index}`}>
                            <SelectedFilter
                                handleRemoveValue={() => {
                                    removeSelectedItem(selectedItemForRender);
                                }}
                                mutationFilter={selectedItemForRender}
                            />
                        </div>
                    );
                })}
                <div className='flex gap-0.5 grow p-1'>
                    <input
                        placeholder={getPlaceholder(referenceGenome)}
                        className='w-full focus:outline-none min-w-8'
                        {...getInputProps(getDropdownProps({ preventKeyAction: isOpen }))}
                        onBlur={() => {
                            setShowErrorIndicator(inputValue !== '');
                        }}
                    />
                    <MutationFilterInfo />
                </div>
            </div>
            <ul
                className={`absolute w-inherit bg-white mt-1 shadow-md max-h-80 overflow-scroll p-0 z-10 ${
                    !isOpen && 'hidden'
                }`}
                {...getMenuProps()}
            >
                {items.map((item, index) => (
                    <li
                        className={`${highlightedIndex === index && 'bg-blue-300'} ${selectedItem === item && 'font-bold'} py-2 px-3 shadow-sm flex flex-col cursor-pointer`}
                        key={`${item.value.code}${index}`}
                        {...getItemProps({ item, index })}
                        style={{
                            backgroundColor: backgroundColorMap(item, highlightedIndex === index ? 0.4 : 0.2),
                        }}
                    >
                        <span>{item.value.code}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function getInitialState(initialValue: MutationsFilter | string[] | undefined, referenceGenome: ReferenceGenome) {
    if (initialValue === undefined) {
        return [];
    }

    const values = Array.isArray(initialValue) ? initialValue : Object.values(initialValue).flatMap((it) => it);

    return values.reduce((selectedItems, value) => {
        const parsedMutation = parseAndValidateMutation(value, referenceGenome);
        if (parsedMutation === null) {
            return selectedItems;
        }

        return [...selectedItems, parsedMutation];
    }, [] as SelectedItem[]);
}

function getPlaceholder(referenceGenome: ReferenceGenome) {
    const nucleotideSubstitution = getExampleMutation(referenceGenome, 'nucleotide', 'substitution');
    const nucleotideInsertion = getExampleMutation(referenceGenome, 'nucleotide', 'insertion');
    const aminoAcidSubstitution = getExampleMutation(referenceGenome, 'amino acid', 'substitution');
    const aminoAcidInsertion = getExampleMutation(referenceGenome, 'amino acid', 'insertion');

    const exampleMutations = [nucleotideSubstitution, nucleotideInsertion, aminoAcidSubstitution, aminoAcidInsertion]
        .filter((example) => example !== '')
        .join(', ');

    return `Enter a mutation (e.g. ${exampleMutations})`;
}

const backgroundColorMap = (data: ParsedMutationFilter, alpha: number = 0.4) => {
    switch (data.type) {
        case 'nucleotideMutations':
            return singleGraphColorRGBByName('green', alpha);
        case 'aminoAcidMutations':
            return singleGraphColorRGBByName('teal', alpha);
        case 'nucleotideInsertions':
            return singleGraphColorRGBByName('indigo', alpha);
        case 'aminoAcidInsertions':
            return singleGraphColorRGBByName('purple', alpha);
    }
};

type SelectedFilterProps = {
    handleRemoveValue: (mutation: ParsedMutationFilter) => void;
    mutationFilter: ParsedMutationFilter;
};

const SelectedFilter = ({ handleRemoveValue, mutationFilter }: SelectedFilterProps) => {
    return (
        <span
            key={mutationFilter.value.toString()}
            className='center px-2 py-1 inline-flex text-black rounded-md'
            style={{
                backgroundColor: backgroundColorMap(mutationFilter),
            }}
        >
            {mutationFilter.value.toString()}
            <button className='ml-1 cursor-pointer' onClick={() => handleRemoveValue(mutationFilter)}>
                ×
            </button>
        </span>
    );
};

function mapToMutationFilterStrings(selectedFilters: SelectedItem[]) {
    return selectedFilters.reduce(
        (acc, filter) => {
            switch (filter.type) {
                case 'nucleotideMutations':
                    return { ...acc, nucleotideMutations: [...acc.nucleotideMutations, filter.value.toString()] };
                case 'aminoAcidMutations':
                    return { ...acc, aminoAcidMutations: [...acc.aminoAcidMutations, filter.value.toString()] };
                case 'nucleotideInsertions':
                    return { ...acc, nucleotideInsertions: [...acc.nucleotideInsertions, filter.value.toString()] };
                case 'aminoAcidInsertions':
                    return { ...acc, aminoAcidInsertions: [...acc.aminoAcidInsertions, filter.value.toString()] };
            }
        },
        {
            aminoAcidMutations: [],
            nucleotideMutations: [],
            aminoAcidInsertions: [],
            nucleotideInsertions: [],
        } as {
            aminoAcidMutations: string[];
            nucleotideMutations: string[];
            aminoAcidInsertions: string[];
            nucleotideInsertions: string[];
        },
    );
}
