import { type FunctionComponent } from 'preact';
import { useContext, useRef, useState } from 'preact/hooks';

import { parseAndValidateMutation } from './parseAndValidateMutation';
import { type Deletion, type Insertion, type Mutation, type Substitution } from '../../utils/mutations';
import { ReferenceGenomeContext } from '../ReferenceGenomeContext';
import { singleGraphColorRGBByName } from '../shared/charts/colors';
import { AddIcon } from '../shared/icons/AddIcon';
import { DeleteIcon } from '../shared/icons/DeleteIcon';

export type MutationFilterProps = {};

export type SelectedFilters = {
    nucleotideMutations: (Substitution | Deletion)[];
    aminoAcidMutations: (Substitution | Deletion)[];
    nucleotideInsertions: Insertion[];
    aminoAcidInsertions: Insertion[];
};

export const MutationFilter: FunctionComponent<MutationFilterProps> = () => {
    const referenceGenome = useContext(ReferenceGenomeContext);
    const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
        nucleotideMutations: [],
        aminoAcidMutations: [],
        nucleotideInsertions: [],
        aminoAcidInsertions: [],
    });
    const [inputValue, setInputValue] = useState('');
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = (event: Event) => {
        event.preventDefault();

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
    };

    const fireChangeEvent = (selectedFilters: SelectedFilters) => {
        const detail = {
            aminoAcidMutations: selectedFilters.aminoAcidMutations.map((mutation) => mutation.toString()),
            nucleotideMutations: selectedFilters.nucleotideMutations.map((mutation) => mutation.toString()),
            aminoAcidInsertions: selectedFilters.aminoAcidInsertions.map((insertion) => insertion.toString()),
            nucleotideInsertions: selectedFilters.nucleotideInsertions.map((insertion) => insertion.toString()),
        };

        formRef.current?.dispatchEvent(
            new CustomEvent('gs-mutation-filter-changed', {
                detail,
                bubbles: true,
                composed: true,
            }),
        );
    };

    const handleOnBlur = () => {
        formRef.current?.dispatchEvent(
            new CustomEvent('gs-mutation-filter-on-blur', {
                bubbles: true,
                composed: true,
            }),
        );
    };

    const handleInputChange = (event: Event) => {
        setInputValue((event.target as HTMLInputElement).value);
    };

    return (
        <div class={`rounded-lg border border-gray-300 bg-white p-2`}>
            <SelectedMutationDisplay
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                fireChangeEvent={fireChangeEvent}
            />

            <form className='mt-2 w-full' onSubmit={handleSubmit} ref={formRef}>
                <label className='input input-bordered flex items-center gap-2'>
                    <input
                        className='grow min-w-0'
                        type='text'
                        value={inputValue}
                        onInput={handleInputChange}
                        placeholder={'Enter a mutation'}
                        onBlur={handleOnBlur}
                    />
                    <button>
                        <AddIcon />
                    </button>
                </label>
            </form>
        </div>
    );
};

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
            class='flex items-center flex-nowrap gap-1 rounded me-1 px-2.5 py-0.5 font-medium text-xs mb-1'
            style={{ backgroundColor, color: textColor }}
        >
            <div>{mutation.toString()}</div>
            <button onClick={() => onDelete(mutation)}>
                <DeleteIcon />
            </button>
        </div>
    );
};
