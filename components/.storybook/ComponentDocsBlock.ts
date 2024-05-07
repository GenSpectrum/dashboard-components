import { Source, useOf } from '@storybook/blocks';
import { createElement, type FunctionComponent } from 'react';
import z from 'zod';
import { type Parameters } from '@storybook/web-components';

const componentDocsSchema = z.object({
    /** The custom tag name of the component. */
    tag: z.string(),
    /** Whether the component expects children that it should render. */
    expectsChildren: z.boolean(),
    /** Whether the component opens a shadow DOM. */
    opensShadowDom: z.boolean(),
    /** A short code snippet example of how to use the component. */
    codeExample: z.string(),
});

type ComponentDocs = z.infer<typeof componentDocsSchema>;

export type ParametersWithComponentDocs = { componentDocs: ComponentDocs } & Parameters;

export function withComponentDocs(parameters: ParametersWithComponentDocs) {
    return parameters;
}

/**
 * This is a custom "block" that Storybook can use in the docs pages.
 * https://storybook.js.org/docs/api/doc-block-useof
 *
 * It must be a React component, but we must not use JSX, because then it would get transpiled to a Preact component.
 */
export const ComponentDocsBlock: FunctionComponent = () => {
    const resolvedOf = useOf('meta', ['meta']);

    const parsedComponentDocs = componentDocsSchema.safeParse(resolvedOf.preparedMeta.parameters?.componentDocs);

    if (!parsedComponentDocs.success) {
        return createElement(ParsingError, { error: parsedComponentDocs.error.message });
    }

    let componentDocs = parsedComponentDocs.data;

    return createElement(
        'div',
        null,
        createElement('h2', null, 'Properties'),
        createElement(PropertiesTable, { componentDocs }),
        createElement('h2', null, 'Code Example'),
        createElement(Source, { code: componentDocs.codeExample }),
    );
};

const ParsingError: FunctionComponent<{ error: string }> = ({ error }) => {
    console.log(error);
    return createElement(
        'div',
        null,
        createElement('h2', null, 'Parsing Error'),
        createElement(
            'div',
            null,
            'This is an error in the definition of the story. To autogenerate docs, the parameters need componentDocs.',
        ),
        createElement('pre', null, error),
        createElement(
            'div',
            null,
            'Make sure that the Meta object of the corresponding story has "parameters.componentDocs" with the correct shape. ' +
                'Use the function "withComponentDocs" to create correct parameters.',
        ),
    );
};

const PropertiesTable: FunctionComponent<{ componentDocs: ComponentDocs }> = ({ componentDocs }) => {
    return createElement(
        'table',
        null,
        createElement(
            'tbody',
            null,
            createElement(
                'tr',
                null,
                createElement('td', null, 'custom element tag'),
                createElement('td', null, createElement('code', null, componentDocs.tag)),
            ),
            createElement(
                'tr',
                null,
                createElement('td', null, 'expects children'),
                createElement('td', null, componentDocs.expectsChildren.toString()),
            ),
            createElement(
                'tr',
                null,
                createElement('td', null, 'opens shadow dom'),
                createElement('td', null, componentDocs.opensShadowDom.toString()),
            ),
        ),
    );
};
