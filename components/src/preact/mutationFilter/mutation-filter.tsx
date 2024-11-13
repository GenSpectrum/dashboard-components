import { type FunctionComponent } from 'preact';
import { useContext, useState, useRef } from 'preact/hooks';

import AsyncSelect from './async-select';
import { MutationFilterInfo } from './mutation-filter-info';
import {
    type SearchOption,
    type SearchType,
    parseAndValidateMutation,
    createLoadOptions,
} from './parseAndValidateMutation';
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
        <ErrorBoundary size={{ height: '3.375rem', width }}>
            <div style={width}>
                <MutationFilterInner initialValue={initialValue} />
            </div>
        </ErrorBoundary>
    );
};

const selectedFiltersMap: { [key in SearchType]: keyof SelectedFilters } = {
    'nuc-mutation': 'nucleotideMutations',
    'nuc-deletion': 'nucleotideMutations',
    'aa-mutation': 'aminoAcidMutations',
    'aa-deletion': 'aminoAcidMutations',
    'nuc-insertion': 'nucleotideInsertions',
    'aa-insertion': 'aminoAcidInsertions',
};

const backgroundColor: { [key in SearchType]: string } = {
    'aa-mutation': singleGraphColorRGBByName('teal', 0.4),
    'nuc-mutation': singleGraphColorRGBByName('green', 0.4),
    'aa-insertion': singleGraphColorRGBByName('purple', 0.4),
    'nuc-insertion': singleGraphColorRGBByName('indigo', 0.4),
    'nuc-deletion': singleGraphColorRGBByName('olive', 0.4),
    'aa-deletion': singleGraphColorRGBByName('sand', 0.4),
};

export const MutationFilterInner: FunctionComponent<MutationFilterInnerProps> = ({ initialValue }) => {
    const referenceGenome = useContext(ReferenceGenomeContext);
    const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>(
        getInitialState(initialValue, referenceGenome),
    );
    const [inputValue, setInputValue] = useState('');
    const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);

    const formRef = useRef<HTMLDivElement>(null);

    const fireChangeEvent = (selectedFilters: SelectedFilters) => {
        const detail = mapToMutationFilterStrings(selectedFilters);

        formRef.current?.dispatchEvent(
            new CustomEvent<SelectedMutationFilterStrings>('gs-mutation-filter-changed', {
                detail,
                bubbles: true,
                composed: true,
            }),
        );
    };

    const onSelectedRemoved = (mutation: string, key: SearchType, selectedFilters: SelectedFilters) => {
        const newSelectedValues = {
            ...selectedFilters,
            [selectedFiltersMap[key]]: selectedFilters[selectedFiltersMap[key]].filter((i) => mutation != i.toString()),
        };

        setSelectedFilters(newSelectedValues);

        fireChangeEvent(newSelectedValues);
    };

    const handleOnBlur = () => {
        const detail = mapToMutationFilterStrings(selectedFilters);

        formRef.current?.dispatchEvent(
            new CustomEvent<SelectedMutationFilterStrings>('gs-mutation-filter-on-blur', {
                detail,
                bubbles: true,
                composed: true,
            }),
        );
    };

    const promiseOptions = (inputValue: string) => {
        const loadOptions = createLoadOptions(referenceGenome);
        return Promise.resolve(loadOptions(inputValue));
    };

    const colorStyles = {
        input: { padding: '8px', width: '100%' },
        menu: { backgroundColor: '#fff', border: '1px solid #ddd' },
        option: { padding: '8px', cursor: 'pointer', backgroundColor: '#999' },
        selectedList: { display: 'flex', flexWrap: 'wrap' },
        loading: { padding: '8px', color: '#999' },
        multiValue: (data: SearchOption) => ({
            backgroundColor: backgroundColor[data.type] || 'lightgray',
            color: 'black',
            padding: '4px 8px',
            borderRadius: '4px',
            margin: '2px',
        }),
    };

    const handleInputChange = (newValue: string) => {
        setInputValue(newValue);
        setMenuIsOpen(true);
    };

    const handleSelectChange = (change: { action: string; removedValue?: SearchOption }) => {
        if (change.action === 'select-option') {
            const parsedMutation = parseAndValidateMutation(inputValue, referenceGenome);

            if (parsedMutation === null) {
                return;
            }

            const newSelectedValues = {
                ...selectedFilters,
                [parsedMutation.type]: [...selectedFilters[parsedMutation.type], parsedMutation.value],
            };
            setSelectedFilters(newSelectedValues);
            fireChangeEvent(newSelectedValues);
            setInputValue('');
        } else if (change.action === 'remove-value' || change.action === 'pop-value') {
            if (change.removedValue) {
                onSelectedRemoved(change.removedValue.value, change.removedValue.type, selectedFilters);
            }
        }
    };

    return (
        <div className='w-full border boder-gray-300 rounded-md relative' ref={formRef}>
            <div className='absolute -top-3 -right-3 z-10'>
                <MutationFilterInfo />
            </div>

            <AsyncSelect
                className='w-full'
                placeholder={getPlaceholder(referenceGenome)}
                isMulti
                loadOptions={promiseOptions}
                onInputChange={handleInputChange}
                inputValue={inputValue}
                onChange={handleSelectChange}
                menuIsOpen={menuIsOpen}
                onBlur={handleOnBlur}
                styles={colorStyles}
            />
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

function getPlaceholder(referenceGenome: ReferenceGenome) {
    const segmentPrefix =
        referenceGenome.nucleotideSequences.length > 1 ? `${referenceGenome.nucleotideSequences[0].name}:` : '';
    const firstGene = referenceGenome.genes[0].name;

    return `Enter a mutation (e.g. ${segmentPrefix}A123T, ins_${segmentPrefix}123:AT, ${firstGene}:M123E, ins_${firstGene}:123:ME)`;
}

function mapToMutationFilterStrings(selectedFilters: SelectedFilters) {
    return {
        aminoAcidMutations: selectedFilters.aminoAcidMutations.map((mutation) => mutation.toString()),
        nucleotideMutations: selectedFilters.nucleotideMutations.map((mutation) => mutation.toString()),
        aminoAcidInsertions: selectedFilters.aminoAcidInsertions.map((insertion) => insertion.toString()),
        nucleotideInsertions: selectedFilters.nucleotideInsertions.map((insertion) => insertion.toString()),
    };
}
