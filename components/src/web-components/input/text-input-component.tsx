import { customElement, property } from 'lit/decorators.js';

import { TextInput } from '../../preact/textInput/text-input';
import { PreactLitAdapter } from '../PreactLitAdapter';

/**
 * @fires {CustomEvent<Record<string, string>>} gs-text-input-changed - When the text input has changed
 */
@customElement('gs-text-input')
export class TextInputComponent extends PreactLitAdapter {
    @property()
    initialValue: string | undefined = '';

    @property()
    lapisField = '';

    @property()
    placeholderText: string | undefined = '';

    override render() {
        return (
            <TextInput
                lapisField={this.lapisField}
                placeholderText={this.placeholderText}
                initialValue={this.initialValue}
            />
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-text-input': TextInputComponent;
    }

    interface HTMLElementEventMap {
        'gs-text-input-changed': CustomEvent<Record<string, string>>;
    }
}
