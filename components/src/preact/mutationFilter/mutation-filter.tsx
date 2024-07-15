import { type FunctionComponent } from 'preact';
import { useContext, useRef, useState } from 'preact/hooks';

import { MutationFilterInfo } from './mutation-filter-info';
import { parseAndValidateMutation } from './parseAndValidateMutation';
import { type ReferenceGenome } from '../../lapisApi/ReferenceGenome';
import { type Deletion, type Insertion, type Mutation, type Substitution } from '../../utils/mutations';
import { ReferenceGenomeContext } from '../ReferenceGenomeContext';
import { ErrorBoundary } from '../components/error-boundary';
import { singleGraphColorRGBByName } from '../shared/charts/colors';
import { DeleteIcon } from '../shared/icons/DeleteIcon';

export interface MutationFilterInnerProps {
    initialValue?: SelectedMutationFilterStrings | string[] | undefined;
}

export interface MutationFilterProps extends MutationFilterInnerProps {
    width: string;
}

export type SelectedFilters = {
    nucleotideMutations: (Substitution | Deletion)[];
    aminoAcidMutations: (Substitution | Deletion)[];
    nucleotideInsertions: Insertion[];
    aminoAcidInsertions: Insertion[];
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

export const MutationFilterInner: FunctionComponent<MutationFilterInnerProps> = ({ initialValue }) => {
    const referenceGenome = useContext(ReferenceGenomeContext);
    const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>(
        getInitialState(initialValue, referenceGenome),
    );
    const [inputValue, setInputValue] = useState('');
    const [isError, setIsError] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = (event: Event) => {
        event.preventDefault();
        if (inputValue === '') {
            return;
        }

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
    };

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

    const handleInputChange = (event: Event) => {
        setInputValue((event.target as HTMLInputElement).value);
        setIsError(false);
    };

    return (
        <form className='w-full border boder-gray-300 rounded-md relative' onSubmit={handleSubmit} ref={formRef}>
            <div className='absolute -top-3 -right-3'>
                <MutationFilterInfo />
            </div>
            <div className='w-full flex p-2 flex-wrap items-center'>
                <SelectedMutationDisplay
                    selectedFilters={selectedFilters}
                    setSelectedFilters={setSelectedFilters}
                    fireChangeEvent={fireChangeEvent}
                />
                <div
                    className={`w-full flex border ${isError ? 'border-red-500' : 'border-gray-300'} border-solid m-2 text-sm focus-within:border-gray-400 `}
                >
                    <input
                        className='grow flex-1 p-1 border-none focus:outline-none focus:ring-0'
                        type='text'
                        value={inputValue}
                        onInput={handleInputChange}
                        placeholder={getPlaceholder(referenceGenome)}
                        onBlur={handleOnBlur}
                    />
                    <button type='submit' className='btn btn-xs m-1'>
                        +
                    </button>
                </div>
            </div>
        </form>
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
                    onDelete={(mutation: Substitution | Deletion) => onSelectedRemoved(mutation, 'nucleotideMutations')}
                />
            ))}
            {selectedFilters.aminoAcidMutations.map((mutation) => (
                <SelectedAminoAcidMutation
                    key={mutation.toString()}
                    mutation={mutation}
                    onDelete={(mutation: Substitution | Deletion) => onSelectedRemoved(mutation, 'aminoAcidMutations')}
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
                    onDelete={(insertion: Insertion) => onSelectedRemoved(insertion, 'aminoAcidInsertions')}
                />
            ))}
        </>
    );
};

const SelectedAminoAcidInsertion: FunctionComponent<{
    insertion: Insertion;
    onDelete: (insertion: Insertion) => void;
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
    mutation: Substitution | Deletion;
    onDelete: (mutation: Substitution | Deletion) => void;
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
    mutation: Substitution | Deletion;
    onDelete: (insertion: Substitution | Deletion) => void;
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
    insertion: Insertion;
    onDelete: (insertion: Insertion) => void;
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

type SelectedFilterProps<MutationType extends Mutation> = {
    mutation: MutationType;
    onDelete: (mutation: MutationType) => void;
    backgroundColor: string;
    textColor: string;
};

const SelectedFilter = <MutationType extends Mutation>({
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
            <button type='button' onClick={() => onDelete(mutation)}>
                <DeleteIcon />
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
