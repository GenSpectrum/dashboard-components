import { FunctionComponent } from 'preact';

export interface CsvDownloadButtonProps {
    label?: string;
    filename?: string;
    getData: () => Record<string, string | number | boolean | null>[];
    className?: string;
}

export const CsvDownloadButton: FunctionComponent<CsvDownloadButtonProps> = ({
    label = 'Download',
    filename = 'data.csv',
    getData,
    className,
}) => {
    const download = () => {
        const content = getDownloadContent();
        const blob = new Blob([content], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getDownloadContent = () => {
        const data = getData();
        const keys = getDataKeys(data);
        const header = `${keys.join(',')}\n`;
        const rows = data.map((row) => keys.map((key) => row[key]).join(',')).join('\n');
        return header + rows;
    };

    const getDataKeys = (data: Record<string, string | number | boolean | null>[]) => {
        const keysSet = data
            .map((row) => Object.keys(row))
            .reduce((accumulatedKeys, keys) => {
                keys.forEach((key) => accumulatedKeys.add(key));
                return accumulatedKeys;
            }, new Set<string>());

        return [...keysSet];
    };

    return (
        <button className={className} onClick={download}>
            {label}
        </button>
    );
};
