import { LitElement } from 'lit';
/**
 * @fires country-changed - Indicates when the country changes
 */
export declare class CountryFilter extends LitElement {
    country: string;
    render(): import("lit-html").TemplateResult<1>;
    onInput(event: Event): void;
    submitCountry(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'country-filter': CountryFilter;
    }
}
//# sourceMappingURL=country-filter.d.ts.map