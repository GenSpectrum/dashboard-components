import { customElement, property, query } from 'lit/decorators.js';
import { html, LitElement } from 'lit';

/**
 * @fires change - Indicates when the value changes
 */
@customElement('gs-select')
export class GsSelect extends LitElement {
    @property({ type: Array })
    items: { label: string; value: string; disabled?: boolean }[] = [];

    @property({ type: String })
    selected: string = '';

    @query('select') select!: HTMLSelectElement;

    @property({ type: String })
    selectStyle = '';

    private onChange(event: Event) {
        const value = (event.target as HTMLSelectElement).value;
        this.dispatchEvent(new CustomEvent('selectChange', { detail: { value } }));
    }

    override updated(changedProperties: Map<string | number | symbol, unknown>) {
        this.setDomValueOfSelectAfterUpdateSinceLitRenderDoesNot();
        super.updated(changedProperties);
    }

    private setDomValueOfSelectAfterUpdateSinceLitRenderDoesNot() {
        this.select.value = this.selected;
    }

    override createRenderRoot() {
        return this;
    }

    override render() {
        return html`
            <select class="select ${this.selectStyle}" @change="${this.onChange}">
                ${this.items.map(
                    (item) =>
                        html` <option
                            value="${item.value}"
                            ?selected="${this.selected === item.value}"
                            ?disabled="${item.disabled}"
                        >
                            ${item.label}
                        </option>`,
                )}
            </select>
        `;
    }
}
