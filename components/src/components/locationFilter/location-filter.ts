import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Task } from '@lit/task';
import { consume } from '@lit/context';
import { lapisContext } from '../../lapis-context';
import { TailwindElement } from '../../tailwind-element';
import { fetchAutocompletionList } from './fetchAutocompletionList';

/**
 * @fires gs-location-changed - Indicates when the location changes
 */
@customElement('gs-location-filter')
export class LocationFilter extends TailwindElement() {
    @property()
    value = '';

    @property({ type: Array })
    fields: string[] = [];

    @consume({ context: lapisContext })
    lapis: string = '';

    private fetchingTask = new Task(this, {
        task: async ([lapis], { signal }) => fetchAutocompletionList(this.fields, lapis, signal),
        args: () => [this.lapis],
    });

    override render() {
        return this.fetchingTask.render({
            pending: () => html`
                <div class="flex">
                    <input
                        type="text"
                        class="input input-bordered flex-grow"
                        .value="${this.value}"
                        @input="${this.onInput}"
                        disabled
                    />
                    <button class="btn ml-1" disabled>Loading...</button>
                </div>
            `,
            complete: (data) => html`
                <div class="flex">
                    <input
                        type="text"
                        class="input input-bordered flex-grow"
                        .value="${this.value}"
                        @input="${this.onInput}"
                        list="countries"
                    />
                    <datalist id="countries">
                        ${data.map(
                            (v) =>
                                html` <option
                                    value="${this.fields
                                        .map((field) => v[field])
                                        .filter((value) => value !== null)
                                        .join(' / ')}"
                                ></option>`,
                        )}
                    </datalist>
                    <button class="btn btn-primary ml-1" @click="${() => this.submit(data)}">Submit</button>
                </div>
            `,
            error: (e) => html`<p>Error: ${e}</p>`,
        });
    }

    onInput(event: Event) {
        const input = event.target as HTMLInputElement;
        this.value = input.value;
    }

    submit(_data: unknown) {
        // TODO #70
        // if (data.regions.includes(this.value)) {
        //     this.dispatchEvent(
        //         new CustomEvent('gs-location-changed', {
        //             detail: { region: this.value, country: undefined },
        //             bubbles: true,
        //         }),
        //     );
        // } else if (data.countries.includes(this.value)) {
        //     this.dispatchEvent(
        //         new CustomEvent('gs-location-changed', {
        //             detail: { region: undefined, country: this.value },
        //             bubbles: true,
        //         }),
        //     );
        // }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-location-filter': LocationFilter;
    }
}
