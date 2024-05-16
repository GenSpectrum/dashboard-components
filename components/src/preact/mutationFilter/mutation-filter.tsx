import { type FunctionComponent } from 'preact';
import { useContext, useRef, useState } from 'preact/hooks';

import { parseAndValidateMutation } from './parseAndValidateMutation';
import { type ReferenceGenome } from '../../lapisApi/ReferenceGenome';
import { type Deletion, type Insertion, type Mutation, type Substitution } from '../../utils/mutations';
import { ReferenceGenomeContext } from '../ReferenceGenomeContext';
import { ErrorBoundary } from '../components/error-boundary';
import Info from '../components/info';
import { ResizeContainer } from '../components/resize-container';
import { singleGraphColorRGBByName } from '../shared/charts/colors';
import { DeleteIcon } from '../shared/icons/DeleteIcon';

export interface MutationFilterInnerProps {
    initialValue?: SelectedMutationFilterStrings | string[] | undefined;
}

export interface MutationFilterProps extends MutationFilterInnerProps {
    width: string;
    height: string;
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

export const MutationFilter: FunctionComponent<MutationFilterProps> = ({ initialValue, width, height }) => {
    const size = { height, width };

    return (
        <ErrorBoundary size={size}>
            <ResizeContainer size={size}>
                <MutationFilterInner initialValue={initialValue} />
            </ResizeContainer>
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
        <div class={`h-full w-full rounded-lg border border-gray-300 bg-white p-2 overflow-scroll`}>
            <div class='flex justify-between'>
                <SelectedMutationDisplay
                    selectedFilters={selectedFilters}
                    setSelectedFilters={setSelectedFilters}
                    fireChangeEvent={fireChangeEvent}
                />
                <Info>Info for mutation filter</Info>
            </div>

            <form className='mt-2 w-full' onSubmit={handleSubmit} ref={formRef}>
                <label className={`input flex items-center gap-2 ${isError ? 'input-error' : 'input-bordered'}`}>
                    <input
                        className='grow min-w-0'
                        type='text'
                        value={inputValue}
                        onInput={handleInputChange}
                        placeholder={getPlaceholder(referenceGenome)}
                        onBlur={handleOnBlur}
                    />
                    <button className='btn btn-sm'>+</button>
                </label>
            </form>
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
        <ul class='flex flex-wrap'>
            {selectedFilters.nucleotideMutations.map((mutation) => (
                <li key={mutation.toString()}>
                    <SelectedNucleotideMutation
                        mutation={mutation}
                        onDelete={(mutation: Substitution | Deletion) =>
                            onSelectedRemoved(mutation, 'nucleotideMutations')
                        }
                    />
                </li>
            ))}
            {selectedFilters.aminoAcidMutations.map((mutation) => (
                <li key={mutation.toString()}>
                    <SelectedAminoAcidMutation
                        mutation={mutation}
                        onDelete={(mutation: Substitution | Deletion) =>
                            onSelectedRemoved(mutation, 'aminoAcidMutations')
                        }
                    />
                </li>
            ))}
            {selectedFilters.nucleotideInsertions.map((insertion) => (
                <li key={insertion.toString()}>
                    <SelectedNucleotideInsertion
                        insertion={insertion}
                        onDelete={(insertion) => onSelectedRemoved(insertion, 'nucleotideInsertions')}
                    />
                </li>
            ))}
            {selectedFilters.aminoAcidInsertions.map((insertion) => (
                <li key={insertion.toString()}>
                    <SelectedAminoAcidInsertion
                        insertion={insertion}
                        onDelete={(insertion: Insertion) => onSelectedRemoved(insertion, 'aminoAcidInsertions')}
                    />
                </li>
            ))}
        </ul>
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
        <div
            class='flex items-center flex-nowrap gap-1 rounded me-1 px-2.5 py-0.5 font-medium text-xs mb-1 min-w-max'
            style={{ backgroundColor, color: textColor }}
        >
            <div className='whitespace-nowrap min-w-max'>{mutation.toString()}</div>
            <button type='button' onClick={() => onDelete(mutation)}>
                <DeleteIcon />
            </button>
        </div>
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
