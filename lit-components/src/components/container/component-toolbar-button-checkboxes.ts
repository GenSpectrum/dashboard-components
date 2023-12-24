import { customElement, property } from 'lit/decorators.js';
import { css, html, LitElement } from 'lit';
import './component-toolbar-button';
import { tooltip } from '../tooltip';

@customElement('gs-component-toolbar-button-checkboxes')
export class ComponentToolbarButton extends LitElement {
    static override styles = css`
        .options {
            display: flex;
            flex-direction: column;
        }
    `;

    @property({ type: Array })
    options: string[] = [];

    @property({ type: Function })
    renderButtonLabel: (options: string[]) => string = (options) => options.join(', ');

    @property({ type: Array })
    selected: string[] = [];

    override render() {
        const tooltipContent = html`
            <div class="options">
                ${this.options.map(
                    (option) => html`
                        <label>
                            <input
                                type="checkbox"
                                value=${option}
                                ?checked=${this.selected.includes(option)}
                                @change=${(e: Event) => {
                                    const checked = (e.target as HTMLInputElement).checked;
                                    this.dispatchEvent(new CustomEvent('change', { detail: { option, checked } }));
                                }}
                            />
                            ${option}
                        </label>
                    `,
                )}
            </div>
        `;

        return html`
            <gs-component-toolbar-button ${tooltip(tooltipContent)}>
                ${this.renderButtonLabel(this.selected)}
            </gs-component-toolbar-button>
        `;
    }
}

export const renderAllNoneOrCommaSeparated = (numberOfAllOptions: number, prefix = '') => {
    return (options: string[]) => {
        if (options.length === numberOfAllOptions) {
            return prefix + 'all';
        }
        if (options.length === 0) {
            return prefix + 'none';
        }
        return prefix + options.join(', ');
    };
};
