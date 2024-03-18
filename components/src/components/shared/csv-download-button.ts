import { customElement, property } from 'lit/decorators.js';
import { html } from 'lit';
import { TailwindElement } from '../../tailwind-element';

@customElement('gs-component-csv-download-button')
export class CsvDownloadButton extends TailwindElement() {
    @property({ type: String })
    label = 'Download';

    @property({ type: String })
    filename = 'data.csv';

    @property({ attribute: false })
    getData: () => Record<string, string | number | boolean | null>[] = () => [];

    override render() {
        const download = () => {
            const content = this.getDownloadContent();
            const blob = new Blob([content], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = this.filename;
            a.click();
            URL.revokeObjectURL(url);
        };

        return html` <button @click=${download}>${this.label}</button>`;
    }

    private getDownloadContent() {
        const data = this.getData();
        const keys = getDataKeys(data);
        const header = keys.join(',') + '\n';
        const rows = data.map((row) => keys.map((key) => row[key]).join(',')).join('\n');
        return header + rows;
    }
}

function getDataKeys(data: Record<string, string | number | boolean | null>[]) {
    const keysSet = data
        .map((row) => Object.keys(row))
        .reduce((accumulatedKeys, keys) => {
            keys.forEach((key) => accumulatedKeys.add(key));
            return accumulatedKeys;
        }, new Set<string>());

    return [...keysSet];
}
