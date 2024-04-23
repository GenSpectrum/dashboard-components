export const substitutionAndDeletionRegex = /(?:([A-Za-z0-9]+):)?([A-Za-z])(\d+)([A-Za-z]|-|\*)/;

export const sortSubstitutionsAndDeletions = (a: string, b: string) => {
    const aMatch = a.match(substitutionAndDeletionRegex);
    const bMatch = b.match(substitutionAndDeletionRegex);

    if (aMatch && bMatch) {
        if (aMatch[1] !== bMatch[1]) {
            return aMatch[1].localeCompare(bMatch[1]);
        }
        if (aMatch[3] !== bMatch[3]) {
            return parseInt(aMatch[3], 10) - parseInt(bMatch[3], 10);
        }
        return aMatch[4].localeCompare(bMatch[4]);
    }
    throw new Error(`Invalid substitution or deletion: ${a} or ${b}`);
};
