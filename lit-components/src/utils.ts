export function getMinMaxString(values: Iterable<string | null>): [string, string] {
    let min = '';
    let max = '';
    for (let value of values) {
        if (value === null) {
            continue;
        }
        if (min === '' || value < min) {
            min = value;
        }
        if (max === '' || value > max) {
            max = value;
        }
    }
    return [min, max];
}
