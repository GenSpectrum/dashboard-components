import { type FunctionComponent } from 'preact';
import { useContext, useRef, useState } from 'preact/hooks';
import AysncSelect from 'react-select/async';
import { CSSObjectWithLabel, StylesConfig } from 'react-select';

import { MutationFilterInfo } from './mutation-filter-info';
import { SearchOption, SearchType, parseAndValidateMutation, createLoadOptions } from './parseAndValidateMutation';
import { type ReferenceGenome } from '../../lapisApi/ReferenceGenome';
import {
    type DeletionClass,
    type InsertionClass,
    type MutationClass,
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

const colorStyles: Partial<StylesConfig<any, true, any>> = {
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
    const [isError, setIsError] = useState(false);
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

    const openMenu = () => {
        setMenuIsOpen(!menuIsOpen);
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
                            setIsError(true);
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

const SelectedMutationDisplay: FunctionComponent<{
    selectedFilters: SelectedFilters;
    setSelectedFilters: (selectedFilters: SelectedFilters) => void;
    fireChangeEvent: (selectedFilters: SelectedFilters) => void;
}> = ({ selectedFilters, setSelectedFilters, fireChangeEvent }) => {
    const onSelectedRemoved = <MutationType extends keyof SelectedFilters>(
        mutation: SelectedFilters[MutationType][number],
        key: MutationType,
    ) => {
        const newSelectedValues = {
            ...selectedFilters,
            [key]: selectedFilters[key].filter((i) => !mutation.equals(i)),
        };

        setSelectedFilters(newSelectedValues);

        fireChangeEvent(newSelectedValues);
    };

    return (
        <>
            {selectedFilters.nucleotideMutations.map((mutation) => (
                <SelectedNucleotideMutation
                    key={mutation.toString()}
                    mutation={mutation}
                    onDelete={(mutation: SubstitutionClass | DeletionClass) =>
                        onSelectedRemoved(mutation, 'nucleotideMutations')
                    }
                />
            ))}
            {selectedFilters.aminoAcidMutations.map((mutation) => (
                <SelectedAminoAcidMutation
                    key={mutation.toString()}
                    mutation={mutation}
                    onDelete={(mutation: SubstitutionClass | DeletionClass) =>
                        onSelectedRemoved(mutation, 'aminoAcidMutations')
                    }
                />
            ))}
            {selectedFilters.nucleotideInsertions.map((insertion) => (
                <SelectedNucleotideInsertion
                    key={insertion.toString()}
                    insertion={insertion}
                    onDelete={(insertion) => onSelectedRemoved(insertion, 'nucleotideInsertions')}
                />
            ))}
            {selectedFilters.aminoAcidInsertions.map((insertion) => (
                <SelectedAminoAcidInsertion
                    key={insertion.toString()}
                    insertion={insertion}
                    onDelete={(insertion: InsertionClass) => onSelectedRemoved(insertion, 'aminoAcidInsertions')}
                />
            ))}
        </>
    );
};

const SelectedAminoAcidInsertion: FunctionComponent<{
    insertion: InsertionClass;
    onDelete: (insertion: InsertionClass) => void;
}> = ({ insertion, onDelete }) => {
    const backgroundColor = singleGraphColorRGBByName('teal', 0.3);
    const textColor = singleGraphColorRGBByName('teal', 1);
    return (
        <SelectedFilter
            mutation={insertion}
            onDelete={onDelete}
            backgroundColor={backgroundColor}
            textColor={textColor}
        />
    );
};

const SelectedAminoAcidMutation: FunctionComponent<{
    mutation: SubstitutionClass | DeletionClass;
    onDelete: (mutation: SubstitutionClass | DeletionClass) => void;
}> = ({ mutation, onDelete }) => {
    const backgroundColor = singleGraphColorRGBByName('rose', 0.3);
    const textColor = singleGraphColorRGBByName('rose', 1);
    return (
        <SelectedFilter
            mutation={mutation}
            onDelete={onDelete}
            backgroundColor={backgroundColor}
            textColor={textColor}
        />
    );
};

const SelectedNucleotideMutation: FunctionComponent<{
    mutation: SubstitutionClass | DeletionClass;
    onDelete: (insertion: SubstitutionClass | DeletionClass) => void;
}> = ({ mutation, onDelete }) => {
    const backgroundColor = singleGraphColorRGBByName('indigo', 0.3);
    const textColor = singleGraphColorRGBByName('indigo', 1);
    return (
        <SelectedFilter
            mutation={mutation}
            onDelete={onDelete}
            backgroundColor={backgroundColor}
            textColor={textColor}
        />
    );
};

const SelectedNucleotideInsertion: FunctionComponent<{
    insertion: InsertionClass;
    onDelete: (insertion: InsertionClass) => void;
}> = ({ insertion, onDelete }) => {
    const backgroundColor = singleGraphColorRGBByName('green', 0.3);
    const textColor = singleGraphColorRGBByName('green', 1);

    return (
        <SelectedFilter
            mutation={insertion}
            onDelete={onDelete}
            backgroundColor={backgroundColor}
            textColor={textColor}
        />
    );
};

type SelectedFilterProps<MutationType extends MutationClass> = {
    mutation: MutationType;
    onDelete: (mutation: MutationType) => void;
    backgroundColor: string;
    textColor: string;
};

const SelectedFilter = <MutationType extends MutationClass>({
    mutation,
    onDelete,
    backgroundColor,
    textColor,
}: SelectedFilterProps<MutationType>) => {
    return (
        <span
            class='inline-block mx-1 px-2 py-1 font-medium text-xs rounded-full'
            style={{ backgroundColor, color: textColor }}
        >
            {mutation.toString()}
            <button className='ml-1' type='button' onClick={() => onDelete(mutation)}>
                ✕
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
