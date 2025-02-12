import { consume } from '@lit/context';
import { type PropertyValues, ReactiveElement } from '@lit/reactive-element';
import { unsafeCSS } from 'lit';
import { render } from 'preact';
import { type JSXInternal } from 'preact/src/jsx';

import { lapisContext } from './lapis-context';
import { referenceGenomeContext } from './reference-genome-context';
import { type ReferenceGenome } from '../lapisApi/ReferenceGenome';
import { LapisUrlContextProvider } from '../preact/LapisUrlContext';
import { INITIAL_REFERENCE_GENOMES, ReferenceGenomeContext } from '../preact/ReferenceGenomeContext';
import minMaxPercentSliderCss from '../preact/components/min-max-percent-slider.css?inline';
import tailwindStyle from '../styles/tailwind.css?inline';

import '../styles/tailwind.css';
import '../preact/components/min-max-percent-slider.css';

const tailwindElementCss = unsafeCSS(tailwindStyle);
const minMaxPercentSliderElementCss = unsafeCSS(minMaxPercentSliderCss);

export abstract class PreactLitAdapter extends ReactiveElement {
    static override styles = [tailwindElementCss, minMaxPercentSliderElementCss];

    /**
     * @internal
     * The URL of the Lapis instance.
     *
     * This component must be a child of a `gs-app` component.
     * This value will automatically be injected by the parent `gs-app` component.
     */
    @consume({ context: lapisContext })
    lapis: string = '';

    /**
     * @internal
     * The reference genomes of the underlying organism.
     * These will be fetched from the Lapis instance.
     *
     * This component must be a child of a `gs-app` component.
     * This value will automatically be injected by the parent `gs-app` component.
     */
    @consume({ context: referenceGenomeContext, subscribe: true })
    referenceGenome: ReferenceGenome = INITIAL_REFERENCE_GENOMES;

    override update(changedProperties: PropertyValues) {
        const vdom = (
            <LapisUrlContextProvider value={this.lapis}>
                <ReferenceGenomeContext.Provider value={this.referenceGenome}>
                    {this.render()}
                </ReferenceGenomeContext.Provider>
            </LapisUrlContextProvider>
        );
        super.update(changedProperties);
        render(vdom, this.renderRoot);
    }

    protected abstract render(): JSXInternal.Element;
}
