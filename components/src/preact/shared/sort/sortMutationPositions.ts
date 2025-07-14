const pattern = /(?:([A-Za-z0-9]+):)?(\d+)$/;

export const sortMutationPositions = (a: string, b: string) => {
    const aMatch = pattern.exec(a);
    const bMatch = pattern.exec(b);

    if (aMatch && bMatch) {
        if (aMatch[1] !== bMatch[1]) {
            return aMatch[1].localeCompare(bMatch[1]);
        }
        return parseInt(aMatch[2], 10) - parseInt(bMatch[2], 10);
    }
    throw new Error(`Invalid mutation position: ${a} or ${b}`);
};
