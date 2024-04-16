import { insertionRegexp } from '../../../utils/mutations';

export const sortInsertions = (a: string, b: string) => {
    const aMatch = a.match(insertionRegexp);
    const bMatch = b.match(insertionRegexp);

    if (aMatch && bMatch) {
        if (aMatch[1] !== bMatch[1]) {
            return aMatch[1].localeCompare(bMatch[1]);
        }
        if (aMatch[2] !== bMatch[2]) {
            return parseInt(aMatch[2], 10) - parseInt(bMatch[2], 10);
        }
        return aMatch[3].localeCompare(bMatch[3]);
    }
    throw new Error(`Invalid insertion: ${a} or ${b}`);
};
