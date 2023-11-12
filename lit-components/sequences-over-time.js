var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Task } from '@lit/task';
import { getGlobalDataManager } from "./data";
let SequencesOverTime = class SequencesOverTime extends LitElement {
    constructor() {
        super(...arguments);
        this.country = '';
        this.fetchingTask = new Task(this, {
            task: async ([country], { signal }) => getGlobalDataManager().getSequencesPerYear(country, signal),
            args: () => [this.country]
        });
    }
    validateProps() {
        return this.country !== '';
    }
    render() {
        if (!this.validateProps()) {
            return html `
        Errors: properties are not valid.
      `;
        }
        return this.fetchingTask.render({
            pending: () => html `
        <h1>Sequences over time</h1>
        Loading...
      `,
            complete: (data) => html `
        <h1>Sequences over time</h1>
        ${JSON.stringify(data)}
      `,
            error: (e) => html `<p>Error: ${e}</p>`
        });
    }
};
SequencesOverTime.styles = css `
    :host {
      display: block;
      border: solid 3px gray;
      padding: 16px;
      max-width: 800px;
    }
  `;
__decorate([
    property()
], SequencesOverTime.prototype, "country", void 0);
SequencesOverTime = __decorate([
    customElement('sequences-over-time')
], SequencesOverTime);
export { SequencesOverTime };
//# sourceMappingURL=sequences-over-time.js.map