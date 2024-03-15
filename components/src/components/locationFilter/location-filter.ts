import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
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

    @state()
    private unknownLocation = false;

    private fetchingTask = new Task(this, {
        task: async ([lapis], { signal }) => fetchAutocompletionList(this.fields, lapis, signal),
        args: () => [this.lapis],
    });

    override render() {
        return this.fetchingTask.render({
            pending: () => html`
                <form class="flex">
                    <input
                        type="text"
                        class="input input-bordered flex-grow"
                        .value="${this.value}"
                        @input="${this.onInput}"
                        disabled
                    />
                    <button class="btn ml-1" disabled>Loading...</button>
                </form>
            `,
            complete: (data) => html`
                <form class="flex">
                    <input
                        type="text"
                        class="input input-bordered flex-grow ${this.unknownLocation && 'border-2 border-error'}"
                        .value="${this.value}"
                        @input="${(event: Event) => this.onInput(event, data)}"
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
                    <button
                        class="btn btn-primary ml-1"
                        @click="${(event: PointerEvent) => {
                            event.preventDefault();
                            this.submit(data);
                        }}"
                    >
                        Submit
                    </button>
                </form>
            `,
            error: (e) => html`<p>Error: ${e}</p>`,
        });
    }

    private onInput(event: Event, data: Record<string, string>[]) {
        const input = event.target as HTMLInputElement;
        this.value = input.value;
        if (this.unknownLocation) {
            const eventDetail = this.parseLocation(this.value);
            if (this.hasMatchingEntry(data, eventDetail)) {
                this.unknownLocation = false;
            }
        }
    }

    private submit(data: Record<string, string>[]) {
        const eventDetail = this.parseLocation(this.value);

        if (this.hasMatchingEntry(data, eventDetail)) {
            this.unknownLocation = false;
            this.dispatchEvent(
                new CustomEvent('gs-location-changed', {
                    detail: eventDetail,
                    bubbles: true,
                }),
            );
        } else {
            this.unknownLocation = true;
        }
    }

    private parseLocation(location: string): Record<string, string> {
        const fieldValues = location.split('/').map((part) => part.trim());
        return fieldValues.reduce((acc, fieldValue, i) => ({ ...acc, [this.fields[i]]: fieldValue }), {});
    }

    private hasMatchingEntry(data: Record<string, string>[], eventDetail: Record<string, string>) {
        const matchingEntries = Object.entries(eventDetail)
            .filter(([, value]) => value !== undefined)
            .reduce((filteredData, [key, value]) => filteredData.filter((it) => it[key] === value), data);

        return matchingEntries.length > 0;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-location-filter': LocationFilter;
    }
}
