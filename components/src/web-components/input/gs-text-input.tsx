import { customElement, property } from 'lit/decorators.js';

import { TextInput } from '../../preact/textInput/text-input';
import { PreactLitAdapter } from '../PreactLitAdapter';

/**
 *
 * ## Context
 *
 * This component provides a text input field to specify filters for arbitrary fields of this LAPIS instance.
 *
 * @fires {CustomEvent<Record<string, string>>} gs-text-input-changed
 * Fired when the input field is changed.
 * The `details` of this event contain an object with the `lapisField` as key and the input value as value.
 * Example:
 * ```
 * {
 *  "host": "Homo sapiens"
 * }
 *  ```
 */
@customElement('gs-text-input')
export class TextInputComponent extends PreactLitAdapter {
    /**
     * The initial value to use for this text input.
     */
    @property()
    initialValue: string = '';

    /**
     * Required.
     *
     * The LAPIS field name to use for this text input.
     * The field must exist on this LAPIS instance.
     */
    @property()
    lapisField = '';

    /**
     * The placeholder text to display in the input field.
     */
    @property()
    placeholderText: string = '';

    /**
     * The width of the component.
     *
     * Visit https://genspectrum.github.io/dashboards-components/?path=/docs/components-size-of-components--docs for more information.
     */
    @property({ type: String })
    width: string = '100%';

    override render() {
        return (
            <TextInput
                lapisField={this.lapisField}
                placeholderText={this.placeholderText}
                initialValue={this.initialValue}
                width={this.width}
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
