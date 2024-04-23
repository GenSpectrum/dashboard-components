import { Insertion } from '../../../utils/mutations';

export const sortInsertions = (a: string, b: string) => {
    const insertionA = Insertion.parse(a);
    const insertionB = Insertion.parse(b);

    if (insertionA && insertionB) {
        const segmentA = insertionA.segment;
        const segmentB = insertionB.segment;
        if (segmentA !== undefined && segmentB !== undefined && segmentA !== segmentB) {
            return segmentA.localeCompare(segmentB);
        }
        const positionA = insertionA.position;
        const positionB = insertionB.position;
        if (positionA !== positionB) {
            return positionA - positionB;
        }
        return insertionA.insertedSymbols.localeCompare(insertionB.insertedSymbols);
    }
    throw new Error(`Invalid insertion: ${a} or ${b}`);
};
