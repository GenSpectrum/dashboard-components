import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Task } from '@lit/task';
import { consume } from '@lit/context';
import { lapisContext } from './lapis-context';
import { FetchAggregatedQuery } from './query/FetchAggregatedQuery';

/**
 * @fires country-changed - Indicates when the country changes
 */
@customElement('country-filter')
export class CountryFilter extends LitElement {
    @property()
    country = '';

    @consume({ context: lapisContext })
    lapis: string = '';

    private fetchingTask = new Task(this, {
        task: async ([lapis], { signal }) => {
            const query = new FetchAggregatedQuery<{
                country: string | null;
            }>({}, ['country']);
            const dataset = await query.evaluate(lapis, signal);
            return dataset.content
                .filter((row) => row.country !== null)
                .map((row) => row.country!)
                .sort();
        },
        args: () => [this.lapis],
    });

    override render() {
        return this.fetchingTask.render({
            pending: () => html`
                <input type="text" .value="${this.country}" @input="${this.onInput}" disabled />
                <button @click="${this.submitCountry}">Submit</button>
            `,
            complete: (countries) => html`
                <input type="text" .value="${this.country}" @input="${this.onInput}" list="countries" />
                <datalist id="countries">
                    ${countries.map((country) => html`<option value="${country}"></option>`)}
                </datalist>
                <button @click="${this.submitCountry}">Submit</button>
            `,
            error: (e) => html`<p>Error: ${e}</p>`,
        });
    }

    onInput(event: Event) {
        const input = event.target as HTMLInputElement;
        this.country = input.value;
    }

    submitCountry() {
        this.dispatchEvent(new CustomEvent('country-changed', { detail: this.country }));
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'country-filter': CountryFilter;
    }
}
