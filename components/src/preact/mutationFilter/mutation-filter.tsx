import { type FunctionComponent } from 'preact';
import { useContext, useRef, useState } from 'preact/hooks';
import { type GroupBase, type CSSObjectWithLabel, type StylesConfig } from 'react-select';
import AysncSelect from 'react-select/async';

import { MutationFilterInfo } from './mutation-filter-info';
import { type SearchOption, type SearchType, parseAndValidateMutation, createLoadOptions } from './parseAndValidateMutation';
import { type ReferenceGenome } from '../../lapisApi/ReferenceGenome';
import {
    type DeletionClass,
    type InsertionClass,
    type SubstitutionClass,
} from '../../utils/mutations';
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

const backgroundColor: { [key in SearchType]: string } = {
    'aa-mutation': singleGraphColorRGBByName('teal', 0.4),
    'nuc-mutation': singleGraphColorRGBByName('green', 0.4),
    'aa-insertion': singleGraphColorRGBByName('purple', 0.4),
    'nuc-insertion': singleGraphColorRGBByName('indigo', 0.4),
    'nuc-deletion': singleGraphColorRGBByName('olive', 0.4),
    'aa-deletion': singleGraphColorRGBByName('sand', 0.4),
};

const colorStyles: Partial<StylesConfig<SearchOption, true, GroupBase<SearchOption>>> = {
    control: (styles: CSSObjectWithLabel) => ({ ...styles, backgroundColor: 'white' }),
    multiValue: (styles: CSSObjectWithLabel, { data }: { data: SearchOption }) => {
        return {
            ...styles,
            backgroundColor: backgroundColor[data.type],
        };
    },
};

export const MutationFilterInner: FunctionComponent<MutationFilterInnerProps> = ({ initialValue }) => {
    const referenceGenome = useContext(ReferenceGenomeContext);
    const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>(
        getInitialState(initialValue, referenceGenome),
    );
    const [inputValue, setInputValue] = useState('');
    const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);
    const formRef = useRef<HTMLFormElement>(null);

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

    console.log(selectedFilters);

    const promiseOptions = (inputValue: string) => {
        const loadOptions = createLoadOptions(referenceGenome);
        return Promise.resolve(loadOptions(inputValue));
    };

    const handleInputChange = (newValue: string) => {
        setInputValue(newValue);
        setMenuIsOpen(true);
    };

    return (
        <div className='w-full border boder-gray-300 rounded-md relative'>
            <div className='absolute -top-3 -right-3'>
                <MutationFilterInfo />
            </div>

            <AysncSelect
                className='w-full p-2'
                placeholder={getPlaceholder(referenceGenome)}
                isMulti
                loadOptions={promiseOptions}
                onInputChange={handleInputChange}
                inputValue={inputValue}
                onChange={(_, change) => {
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
                        setMenuIsOpen(false);
                    } else if (change.action === 'remove-value' || change.action === 'pop-value') {
                        //TODO: write custom function for filtering out value from selectedFilters
                    }
                }}
                menuIsOpen={menuIsOpen}
                styles={colorStyles}
                onBlur={handleOnBlur}
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
