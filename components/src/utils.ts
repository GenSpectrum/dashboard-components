export function getMinMaxNumber(values: Iterable<number>): [number, number] | null {
    let min = null;
    let max = null;
    for (let value of values) {
        if (min === null || value < min) {
            min = value;
        }
        if (max === null || value > max) {
            max = value;
        }
    }
    if (min === null || max === null) {
        return null;
    }
    return [min, max];
}
