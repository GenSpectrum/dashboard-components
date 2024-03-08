import { LitElement, unsafeCSS } from 'lit';
import style from './tailwind.css?inline';

import './tailwind.css';

const tailwindElementCss = unsafeCSS(style);

export function TailwindElement(additionalStyle?: string): typeof LitElement {
    const styles = [tailwindElementCss];
    if (additionalStyle) {
        styles.push(unsafeCSS(additionalStyle));
    }

    class TailwindLitElement extends LitElement {
        static override styles = styles;
    }

    return TailwindLitElement;
}
