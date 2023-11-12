import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {Task} from '@lit/task';
import {getGlobalDataManager} from "./data";

@customElement('sequences-over-time')
export class SequencesOverTime extends LitElement {
  static override styles = css`
    :host {
      display: block;
      border: solid 3px gray;
      padding: 16px;
      max-width: 800px;
    }
  `;

  @property()
  country = '';

  private validateProps() {
    return this.country !== '';
  }

  private fetchingTask = new Task(this, {
    task: async ([country], {signal}) => getGlobalDataManager().getSequencesPerYear(country, signal),
    args: () => [this.country]
  })

  override render() {
    if (!this.validateProps()) {
      return html`
        Errors: properties are not valid.
      `;
    }

    return this.fetchingTask.render({
      pending: () => html`
        <h1>Sequences over time</h1>
        Loading...
      `,
      complete: (data) => html`
        <h1>Sequences over time</h1>
        ${JSON.stringify(data)}
      `,
      error: (e) => html`<p>Error: ${e}</p>`
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sequences-over-time': SequencesOverTime;
  }
}
