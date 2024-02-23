import { html } from 'lit';
import { Meta, StoryObj } from '@storybook/web-components';
import { renderAllNoneOrCommaSeparated } from './component-toolbar-button-checkboxes';

const meta: Meta = {
    title: 'Toolbar/Toolbar button checkboxes',
    component: 'gs-component-toolbar-button-checkboxes',
    argTypes: {
        options: {
            options: ['firstOption', 'secondOption'],
            control: { type: 'check' },
            defaultValue: ['firstOption'],
        },
        selected: {
            options: ['firstOption', 'secondOption'],
            control: { type: 'check' },
            defaultValue: ['firstOption'],
        },
        prefix: {
            control: { type: 'text' },
            defaultValue: 'somePrefix: ',
        },
    },
};

export default meta;

const Template: StoryObj = {
    render: (args) =>
        html` <gs-component-toolbar-button-checkboxes
            .options=${args.options}
            .renderButtonLabel=${renderAllNoneOrCommaSeparated(args.options.length, args.prefix)}
            .selected=${args.selected}
        >
        </gs-component-toolbar-button-checkboxes>`,
};

export const ButtonCheckboxesStory = {
    ...Template,
    args: {
        options: ['firstOption', 'secondOption'],
        selected: ['firstOption'],
        prefix: 'somePrefix: ',
    },
};
