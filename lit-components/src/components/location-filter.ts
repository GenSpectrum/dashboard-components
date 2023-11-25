import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Task } from '@lit/task';
import { consume } from '@lit/context';
import { lapisContext } from '../lapis-context';
import { FetchAggregatedQuery } from '../query/FetchAggregatedQuery';

type Locations = {
    regions: string[];
    countries: string[];
};

/**
 * @fires location-changed - Indicates when the location changes
 */
@customElement('gs-location-filter')
export class LocationFilter extends LitElement {
    @property()
    value = '';

    @consume({ context: lapisContext })
    lapis: string = '';

    private fetchingTask = new Task(this, {
        task: async ([lapis], { signal }) => {
            const regionQuery = new FetchAggregatedQuery<{
                region: string | null;
            }>({}, ['region']);
            const countryQuery = new FetchAggregatedQuery<{
                country: string | null;
            }>({}, ['country']);
            const regions = await regionQuery.evaluate(lapis, signal);
            const countries = await countryQuery.evaluate(lapis, signal);
            return {
                regions: regions.content
                    .filter((v) => v !== null)
                    .map((row) => row.region!)
                    .sort(),
                countries: countries.content
                    .filter((v) => v !== null)
                    .map((row) => row.country!)
                    .sort(),
            };
        },
        args: () => [this.lapis],
    });

    override render() {
        return this.fetchingTask.render({
            pending: () => html`
                <input type="text" .value="${this.value}" @input="${this.onInput}" disabled />
                <button @click="${this.submit}">Submit</button>
            `,
            complete: (data) => html`
                <input type="text" .value="${this.value}" @input="${this.onInput}" list="countries" />
                <datalist id="countries">
                    ${[...data.regions, ...data.countries].map((v) => html`<option value="${v}"></option>`)}
                </datalist>
                <button @click="${() => this.submit(data)}">Submit</button>
            `,
            error: (e) => html`<p>Error: ${e}</p>`,
        });
    }

    onInput(event: Event) {
        const input = event.target as HTMLInputElement;
        this.value = input.value;
    }

    submit(data: Locations) {
        if (data.regions.includes(this.value)) {
            this.dispatchEvent(
                new CustomEvent('location-changed', { detail: { region: this.value, country: undefined } }),
            );
        } else if (data.countries.includes(this.value)) {
            this.dispatchEvent(
                new CustomEvent('location-changed', { detail: { region: undefined, country: this.value } }),
            );
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-location-filter': LocationFilter;
    }
}
