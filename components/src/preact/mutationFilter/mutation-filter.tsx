import { useCombobox, useMultipleSelection } from 'downshift/preact';
import { type FunctionComponent } from 'preact';
import { useContext, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import z from 'zod';

import { getExampleMutation } from './ExampleMutation';
import { MutationFilterInfo } from './mutation-filter-info';
import { parseAndValidateMutation } from './parseAndValidateMutation';
import { type ReferenceGenome } from '../../lapisApi/ReferenceGenome';
import { type MutationsFilter, mutationsFilterSchema } from '../../types';
import { gsEventNames } from '../../utils/gsEventNames';
import { type DeletionClass, type InsertionClass, type SubstitutionClass } from '../../utils/mutations';
import { ReferenceGenomeContext } from '../ReferenceGenomeContext';
import { ErrorBoundary } from '../components/error-boundary';
import { UserFacingError } from '../components/error-display';
import { singleGraphColorRGBByName } from '../shared/charts/colors';

const mutationTypeSchema = z.enum([
    'nucleotideMutations',
    'aminoAcidMutations',
    'nucleotideInsertions',
    'aminoAcidInsertions',
]);

export type MutationType = z.infer<typeof mutationTypeSchema>;

const mutationFilterInnerPropsSchema = z.object({
    initialValue: z.union([mutationsFilterSchema.optional(), z.array(z.string()), z.undefined()]),
    enabledMutationTypes: z.array(mutationTypeSchema).optional(),
});

const mutationFilterPropsSchema = mutationFilterInnerPropsSchema.extend({
    width: z.string(),
});

export type MutationFilterInnerProps = z.infer<typeof mutationFilterInnerPropsSchema>;
export type MutationFilterProps = z.infer<typeof mutationFilterPropsSchema>;

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

export type MutationFilterItem =
    | SelectedNucleotideMutation
    | SelectedAminoAcidMutation
    | SelectedNucleotideInsertion
    | SelectedAminoAcidInsertion;

export const MutationFilter: FunctionComponent<MutationFilterProps> = (props) => {
    const { width, initialValue, enabledMutationTypes } = props;
    return (
        <ErrorBoundary
            size={{ height: '40px', width }}
            layout='horizontal'
            schema={mutationFilterPropsSchema}
            componentProps={props}
        >
            <div style={{ width }}>
                <MutationFilterInner initialValue={initialValue} enabledMutationTypes={enabledMutationTypes} />
            </div>
        </ErrorBoundary>
    );
};

function MutationFilterInner({
    initialValue,
    enabledMutationTypes = ['nucleotideMutations', 'nucleotideInsertions', 'aminoAcidMutations', 'aminoAcidInsertions'],
}: MutationFilterInnerProps) {
    const referenceGenome = useContext(ReferenceGenomeContext);
    const filterRef = useRef<HTMLDivElement>(null);
    const [inputValue, setInputValue] = useState('');

    const initialState = useMemo(() => {
        return getInitialState(initialValue, referenceGenome, enabledMutationTypes);
    }, [initialValue, referenceGenome, enabledMutationTypes]);

    const [selectedItems, setSelectedItems] = useState<MutationFilterItem[]>(initialState);
    const [itemCandidate, setItemCandidate] = useState<MutationFilterItem | null>(null);
    const [showErrorIndicator, setShowErrorIndicator] = useState(false);

    const items = itemCandidate ? [itemCandidate] : [];

    useEffect(() => {
        setSelectedItems((prevSelectedItems) =>
            prevSelectedItems.filter((mutFilterItem) => enabledMutationTypes.includes(mutFilterItem.type)),
        );
    }, [enabledMutationTypes, selectedItems]);

    const fireChangeEvent = (selectedFilters: MutationFilterItem[]) => {
        const detail = mapToMutationFilterStrings(selectedFilters);

        filterRef.current?.dispatchEvent(
            new CustomEvent<MutationsFilter>(gsEventNames.mutationFilterChanged, {
                detail,
                bubbles: true,
                composed: true,
            }),
        );
    };

    const handleSelectedItemsChanged = (newSelectedItems: MutationFilterItem[]) => {
        fireChangeEvent(newSelectedItems);
        setSelectedItems(newSelectedItems);
    };

    const handleNewSelectedItem = (selectedItem: MutationFilterItem | null | undefined) => {
        if (selectedItem) {
            handleSelectedItemsChanged([...selectedItems, selectedItem]);
            setInputValue('');
            setItemCandidate(null);
            setShowErrorIndicator(false);
        }
    };

    const handleInputChange = (newInputValue: string | undefined) => {
        setShowErrorIndicator(false);
        if (newInputValue?.includes(',')) {
            const values = newInputValue.split(',').map((value) => {
                return { value, parsedValue: parseAndValidateMutation(value.trim(), referenceGenome) };
            });

            const validEntries: MutationFilterItem[] = [];
            const rejected: string[] = [];

            for (const v of values) {
                if (v.parsedValue === null) {
                    rejected.push(v.value.trim());
                } else if (enabledMutationTypes.includes(v.parsedValue.type)) {
                    validEntries.push(v.parsedValue);
                } else {
                    rejected.push(v.parsedValue.value.code);
                }
            }

            const selectedItemCandidates = [...selectedItems, ...validEntries];

            handleSelectedItemsChanged(extractUniqueValues(selectedItemCandidates));
            setInputValue(rejected.join(','));
            setItemCandidate(null);
        } else {
            setInputValue(newInputValue ?? '');
            if (newInputValue !== undefined) {
                const candidate = parseAndValidateMutation(newInputValue, referenceGenome);
                const alreadyExists = selectedItems.find(
                    (selectedItem) => selectedItem.value.code === candidate?.value.code,
                );
                const allowedType = candidate !== null && enabledMutationTypes.includes(candidate.type);
                if (!alreadyExists && allowedType) {
                    setItemCandidate(candidate);
                }
            }
        }
    };

    const shadowRoot = filterRef.current?.shadowRoot ?? undefined;

    const environment =
        shadowRoot !== undefined
            ? {
                  addEventListener: window.addEventListener.bind(window),
                  removeEventListener: window.removeEventListener.bind(window),
                  document: shadowRoot.ownerDocument,
                  Node: window.Node,
              }
            : undefined;

    const { getDropdownProps, removeSelectedItem } = useMultipleSelection({
        selectedItems,
        onStateChange({ selectedItems: newSelectedItems, type }) {
            switch (type) {
                case useMultipleSelection.stateChangeTypes.FunctionRemoveSelectedItem:
                    handleSelectedItemsChanged(newSelectedItems ?? []);
                    break;
                default:
                    break;
            }
        },
        environment,
    });

    const { isOpen, getMenuProps, getInputProps, highlightedIndex, getItemProps, selectedItem } = useCombobox({
        items,
        itemToString(item: MutationFilterItem | undefined | null) {
            return item ? item.value.code : '';
        },
        defaultHighlightedIndex: 0,
        inputValue,
        onStateChange({ inputValue: newInputValue, type, selectedItem: newSelectedItem }) {
            switch (type) {
                case useCombobox.stateChangeTypes.InputKeyDownEnter:
                case useCombobox.stateChangeTypes.ItemClick:
                case useCombobox.stateChangeTypes.InputBlur:
                    handleNewSelectedItem(newSelectedItem);
                    break;

                case useCombobox.stateChangeTypes.InputChange: {
                    handleInputChange(newInputValue);
                    break;
                }
                default:
                    break;
            }
        },
        environment,
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
                        placeholder={getPlaceholder(referenceGenome, enabledMutationTypes)}
                        className='w-full focus:outline-none min-w-8'
                        {...getInputProps(getDropdownProps({ preventKeyAction: isOpen }))}
                        onBlur={() => {
                            setShowErrorIndicator(inputValue !== '');
                        }}
                        size={10}
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

function extractUniqueValues(newSelectedItems: MutationFilterItem[]) {
    const uniqueMutationsMap = new Map<string, MutationFilterItem>();
    for (const mutation of newSelectedItems) {
        if (!uniqueMutationsMap.has(mutation.value.code)) {
            uniqueMutationsMap.set(mutation.value.code, mutation);
        }
    }

    return Array.from(uniqueMutationsMap.values());
}

function getInitialState(
    initialValue: MutationsFilter | string[] | undefined,
    referenceGenome: ReferenceGenome,
    enabledMutationTypes: MutationType[],
) {
    if (initialValue === undefined) {
        return [];
    }

    const values = Array.isArray(initialValue) ? initialValue : Object.values(initialValue).flatMap((it) => it);

    return values
        .map((value) => parseAndValidateMutation(value, referenceGenome))
        .filter((parsedMutation): parsedMutation is MutationFilterItem => parsedMutation !== null)
        .filter((mutation) => enabledMutationTypes.includes(mutation.type));
}

function getPlaceholder(referenceGenome: ReferenceGenome, enabledMutationTypes: MutationType[]) {
    const exampleMutationList = [];

    if (enabledMutationTypes.includes('nucleotideMutations')) {
        exampleMutationList.push(getExampleMutation(referenceGenome, 'nucleotide', 'substitution'));
    }
    if (enabledMutationTypes.includes('nucleotideInsertions')) {
        exampleMutationList.push(getExampleMutation(referenceGenome, 'nucleotide', 'insertion'));
    }
    if (enabledMutationTypes.includes('aminoAcidMutations')) {
        exampleMutationList.push(getExampleMutation(referenceGenome, 'amino acid', 'substitution'));
    }
    if (enabledMutationTypes.includes('aminoAcidInsertions')) {
        exampleMutationList.push(getExampleMutation(referenceGenome, 'amino acid', 'insertion'));
    }

    const exampleMutations = exampleMutationList.filter((example) => example !== '').join(', ');

    return `Enter a mutation (e.g. ${exampleMutations})`;
}

const backgroundColorMap = (data: MutationFilterItem, alpha: number = 0.4) => {
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
    handleRemoveValue: (mutation: MutationFilterItem) => void;
    mutationFilter: MutationFilterItem;
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
            <button
                className='ml-1 cursor-pointer'
                aria-label={`remove mutation filter ${mutationFilter.value.code}`}
                onClick={() => handleRemoveValue(mutationFilter)}
            >
                ×
            </button>
        </span>
    );
};

function mapToMutationFilterStrings(selectedFilters: MutationFilterItem[]) {
    return selectedFilters.reduce<MutationsFilter>(
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
        },
    );
}
