import { customElement, property } from 'lit/decorators.js';
import { html, TemplateResult } from 'lit';
import { TailwindElement } from '../../tailwind-element';
import '../shared/csv-download-button';

type Tab = {
    title: string;
    content: TemplateResult;
};

@customElement('gs-component-tabs')
export class ComponentTabs extends TailwindElement() {
    @property({ type: Array })
    tabs: Tab[] = [];

    @property({ type: Object })
    toolbar: TemplateResult | undefined = undefined;

    override render() {
        const tabNames = this.tabs.map((tab) => tab.title).join(', ');

        const tabElements = this.tabs.map((tab, index) => {
            return html`
                <input
                    type="radio"
                    name=${tabNames}
                    role="tab"
                    class="tab"
                    aria-label=${tab.title}
                    ?checked=${index === 0}
                />
                <div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-1">
                    ${tab.content}
                </div>
            `;
        });

        return html` <div role="tablist" class="tabs tabs-lifted">${tabElements} ${this.getToolbar()}</div>`;
    }

    private getToolbar() {
        if (this.toolbar === undefined) {
            return html``;
        }
        return html`<div class="m-1 col-[9999]">${this.toolbar}</div>`;
    }
}
