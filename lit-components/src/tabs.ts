import { LitElement, html, css } from 'lit';
import { customElement, property, queryAssignedElements } from 'lit/decorators.js';

@customElement('gs-tab')
export class Tab extends LitElement {
    static override styles = css`
        :host {
            display: none;
        }
        :host([active]) {
            display: block;
        }
    `;

    @property({ type: Boolean, reflect: true })
    active = false;

    override render() {
        return html`<slot></slot>`;
    }
}

@customElement('gs-tabs')
export class Tabs extends LitElement {
    static override styles = css`
        .tabs {
            margin-bottom: 10px;
        }
        .tab {
            cursor: pointer;
            display: inline-block;
            padding: 5px 10px;
            border: 1px solid black;
            border-bottom: none;
        }
        .active {
            font-weight: bold;
        }
    `;

    @queryAssignedElements({})
    tabElements!: Tab[];

    @property({ type: Number })
    activeTabIndex = 0;

    override render() {
        const tabs = Array.from(this.children) as Tab[];
        return html`
            <div class="tabs">
                ${tabs.map(
                    (tab, index) => html`
                        <div
                            class="tab ${this.activeTabIndex === index ? 'active' : ''}"
                            @click="${() => this.selectTab(index)}"
                        >
                            ${tab.getAttribute('title')}
                        </div>
                    `,
                )}
            </div>
            <slot></slot>
        `;
    }

    selectTab(selectedIndex: number) {
        this.activeTabIndex = selectedIndex;
        this.tabElements.forEach((tab, index) => {
            tab.active = index === selectedIndex;
        });
    }
}
