/**
 * Replaces `@property` rules in a CSSStyleSheet with a `:host` rule.
 *
 * Tailwind uses `@property` rules, but they don't work in the shadow DOM.
 * https://github.com/tailwindlabs/tailwindcss/issues/15005
 *
 * Inspired by https://github.com/tailwindlabs/tailwindcss/issues/15005#issuecomment-2737489813
 */
export function replaceCssProperties(styleSheet: CSSStyleSheet) {
    const properties: string[] = [];

    [...styleSheet.cssRules]
        .map((rule, index) => [rule, index] as const)
        .reverse()
        .forEach(([rule, index]) => {
            if (rule instanceof CSSPropertyRule && rule.initialValue !== null) {
                styleSheet.deleteRule(index);
                properties.push(`${rule.name}: ${rule.initialValue}`);
            }
        });

    if (properties.length > 0) {
        styleSheet.insertRule(`:host { ${properties.join('; ')} }`);
    }
}
