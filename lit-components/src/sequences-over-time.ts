import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {Task} from '@lit/task';
import {getGlobalDataManager} from "./query/data";
import {FetchAggregatedQuery} from "./query/FetchAggregatedQuery";
import {MapQuery} from "./query/MapQuery";
import {GroupByQuery} from "./query/GroupByQuery";

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
    task: async ([country], {signal}) => {
      const fetchQuery = new FetchAggregatedQuery<{date: string | null}>({country}, ['date']);
      const mapQuery = new MapQuery(
        fetchQuery,
        (d) => {
          let year: number | null = null;
          if (d.date !== null) {
            year = new Date(d.date).getFullYear();
          }
          return {
            year,
            count: d.count
          }
        }
      );
      const groupByQuery = new GroupByQuery(
        mapQuery,
        'year',
        (values) => {
          let count = 0;
          for (let v of values) {
            count += v.count;
          }
          return {
            year: values[0].year,
            count
          }
        }
      );
      return getGlobalDataManager().evaluateQuery(groupByQuery, signal)
    },
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
        <sequences-over-time-chart .data=${data.content}></sequences-over-time-chart>
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
