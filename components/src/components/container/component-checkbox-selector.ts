import { customElement, property } from 'lit/decorators.js';
import { html } from 'lit';
import { TailwindElement } from '../../tailwind-element';

export type CheckboxItem = {
    label: string;
    checked: boolean;
};

@customElement('gs-component-checkbox-selector')
export class ComponentCheckboxSelector extends TailwindElement() {
    @property({ type: Array })
    items: CheckboxItem[] = [];

    @property({ type: String })
    label = 'label';

    @property({ type: Object })
    setItems: (items: CheckboxItem[]) => void = () => {};

    override render() {
        return html`
            <div class="dropdown">
                <div tabindex="0" role="button" class="btn btn-xs">${this.label}</div>
                <ul tabindex="0" class="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box">
                    ${this.items.map(
                        (item, index) => html`
                            <li class="flex flex-row items-center">
                                <label>
                                    <input
                                        type="checkbox"
                                        id="item-${index}"
                                        ?checked=${item.checked}
                                        @change=${() => {
                                            this.items[index].checked = !this.items[index].checked;
                                            this.setItems(this.items);
                                        }}
                                    />
                                    ${item.label}
                                </label>
                            </li>
                        `,
                    )}
                </ul>
            </div>
        `;
    }
}
