import { type BaseCell } from './mutations-grid';
import type { SequenceType, SubstitutionOrDeletionEntry } from '../../types';
import { bases } from '../../utils/mutations';
import { type ProportionInterval } from '../components/proportion-selector';
import { sortMutationPositions } from '../shared/sort/sortMutationPositions';

export const getMutationsGridData = (
    data: SubstitutionOrDeletionEntry[],
    sequenceType: SequenceType,
    proportionInterval: ProportionInterval,
) => {
    return accumulateByPosition(data, sequenceType).filter((row) => byProportion(row, proportionInterval));
};

const accumulateByPosition = (data: SubstitutionOrDeletionEntry[], sequenceType: SequenceType) => {
    const basesOfView = bases[sequenceType];
    const positionsToProportionAtBase = new Map<string, Map<string, number>>();
    const referenceBases = new Map<string, string>();

    for (const mutationEntry of data) {
        const position =
            (mutationEntry.mutation.segment ? `${mutationEntry.mutation.segment}:` : '') +
            mutationEntry.mutation.position;
        referenceBases.set(position, mutationEntry.mutation.valueAtReference);

        const initiallyFillPositionsToProportionAtBase = () => {
            if (!positionsToProportionAtBase.has(position)) {
                const empty = new Map();
                basesOfView.forEach((base) => empty.set(base, 0));
                empty.set(mutationEntry.mutation.valueAtReference, 1);
                positionsToProportionAtBase.set(position, empty);
            }
        };
        initiallyFillPositionsToProportionAtBase();

        const substitutionValue =
            mutationEntry.type === 'substitution' ? mutationEntry.mutation.substitutionValue : '-';

        const subtractSubstitutionValue = () => {
            const proportionAtBase = positionsToProportionAtBase.get(position)!;
            proportionAtBase.set(substitutionValue, mutationEntry.proportion);
            proportionAtBase.set(
                mutationEntry.mutation.valueAtReference,
                proportionAtBase.get(mutationEntry.mutation.valueAtReference)! - mutationEntry.proportion,
            );
        };
        subtractSubstitutionValue();
    }
    const orderedPositionsToProportionAtBase = [...positionsToProportionAtBase.entries()]
        .map(([position, proportionsAtBase]) => ({ position, proportions: proportionsAtBase }))
        .sort((a, b) => {
            return sortMutationPositions(a.position, b.position);
        });

    return orderedPositionsToProportionAtBase.map((proportionsForBaseAtPosition) => {
        const proportions = bases[sequenceType].map((base) => {
            return {
                [base]: {
                    proportion: proportionsForBaseAtPosition.proportions.get(base)!,
                    isReference: base === referenceBases.get(proportionsForBaseAtPosition.position),
                },
            };
        });

        return {
            position: proportionsForBaseAtPosition.position,
            ...proportions.reduce((acc, curr) => ({ ...acc, ...curr }), {}),
        } as MutationsGridDataRow;
    });
};

export type BasesData = {
    [base: string]: BaseCell;
};
export type MutationsGridDataRow = BasesData & { position: string };

const byProportion = (row: MutationsGridDataRow, proportionInterval: ProportionInterval) => {
    const numbersAndIsReference = Object.values(row).filter(
        (
            cell,
        ): cell is {
            proportion: number;
            isReference: boolean;
        } => typeof cell === 'object',
    );

    return numbersAndIsReference.some((cell) => {
        return (
            !cell.isReference && cell.proportion >= proportionInterval.min && cell.proportion <= proportionInterval.max
        );
    });
};
