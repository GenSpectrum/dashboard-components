import { customElement, property } from 'lit/decorators.js';

import { TextInput } from '../../preact/textInput/text-input';
import { PreactLitAdapter } from '../PreactLitAdapter';

@customElement('gs-text-input')
export class TextInputComponent extends PreactLitAdapter {
    @property()
    lapisField = '';

    @property()
    placeholderText = '';

    override render() {
        return <TextInput lapisField={this.lapisField} placeholderText={this.placeholderText} />;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-text-input': TextInputComponent;
    }
}
