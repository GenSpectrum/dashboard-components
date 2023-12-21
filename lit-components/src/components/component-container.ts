import { LitElement, html, css } from 'lit';
import { customElement, property, queryAssignedElements } from 'lit/decorators.js';

@customElement('gs-component-tab')
export class ComponentTab extends LitElement {
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

@customElement('gs-component-toolbar')
export class ComponentToolbar extends LitElement {
    static override styles = css`
        :host {
            display: none;
        }
        :host([active]) {
            padding: 2px 2px 2px 0;
            display: flex;
            flex-direction: row;
            justify-content: flex-end;
            gap: 4px;
        }
    `;

    @property({ type: Boolean, reflect: true })
    active = false;

    override render() {
        return html`
            <slot></slot>
            <gs-component-toolbar-button
                @click="${() =>
                    this.dispatchEvent(
                        new CustomEvent('toolbarclick', { detail: 'info', bubbles: true, composed: true }),
                    )}"
                >&#9432;</gs-component-toolbar-button
            >
        `;
    }
}

@customElement('gs-component-info')
export class ComponentInfo extends LitElement {
    static override styles = css`
        :host {
            display: none;
        }
        :host([active]) {
            display: block;
            padding: 5px;
        }
    `;

    @property({ type: Boolean, reflect: true })
    active = false;

    override render() {
        return html`<slot></slot>`;
    }
}

@customElement('gs-component-toolbar-button')
export class ComponentToolbarButton extends LitElement {
    static override styles = css`
        button {
            font-size: x-small;
            height: 20px;
        }
    `;

    override render() {
        return html`<button><slot></slot></button>`;
    }
}

@customElement('gs-component-container')
export class ComponentContainer extends LitElement {
    static override styles = css`
        :host {
            display: block;
            max-width: 800px;
        }
        .tabs {
            display: flex;
            flex-direction: row;
            border: 1px solid black;
            border-top: none;
        }
        .tab {
            cursor: pointer;
            display: inline-block;
            padding: 5px 10px;
            position: relative;
        }
        .tab:not(:first-child):before {
            content: '';
            position: absolute;
            left: 0;
            bottom: 20%;
            height: 60%;
            border-left: 1px solid gray;
        }
        .active {
            font-weight: bold;
        }
        .content {
            display: block;
            border: solid 3px gray;
            padding: 16px;
            position: relative;
        }
        .bottom-bar {
            display: flex;
            flex-direction: row;
            align-items: flex-start;
        }
        .toolbar {
            flex-grow: 1;
            border-bottom: solid 1px gray;
        }
        .info {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: white;
            overflow: auto;
            display: none;
        }
        .info[data-active='true'] {
            display: block;
        }
    `;

    @queryAssignedElements({ slot: 'content' })
    tabElements!: ComponentTab[];

    @queryAssignedElements({ slot: 'toolbar' })
    toolbarElements!: ComponentToolbar[];

    @queryAssignedElements({ slot: 'info' })
    infoElements!: ComponentToolbar[];

    @property({ type: Number })
    activeTabIndex = 0;

    @property({ type: Boolean })
    infoOpen = false;

    override render() {
        console.log(this.infoOpen);
        const tabs = Array.from(this.children).filter((c) => c.tagName === 'GS-COMPONENT-TAB') as ComponentTab[];
        return html`
            <div class="content">
                <slot name="content"></slot>
                <div class="info" data-active=${this.infoOpen}>
                    <slot name="info"></slot>
                </div>
            </div>
            <div class="bottom-bar">
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
                <div
                    class="toolbar"
                    @toolbarclick="${(e: any) => {
                        if (e.detail === 'info') {
                            this.toggleInfo();
                        }
                    }}"
                >
                    <slot name="toolbar"></slot>
                </div>
            </div>
        `;
    }

    toggleInfo() {
        if (this.infoOpen) {
            this.closeInfo();
        } else {
            this.openInfo();
        }
    }

    openInfo() {
        this.infoElements.forEach((info, index) => {
            info.active = index === this.activeTabIndex;
        });
        this.infoOpen = true;
    }

    closeInfo() {
        this.infoElements.forEach((info) => {
            info.active = false;
        });
        this.infoOpen = false;
    }

    selectTab(selectedIndex: number) {
        this.activeTabIndex = selectedIndex;
        this.toolbarElements.forEach((toolbar, index) => {
            toolbar.active = index === selectedIndex;
        });
        this.tabElements.forEach((tab, index) => {
            tab.active = index === this.activeTabIndex;
        });
        this.closeInfo();
    }
}
