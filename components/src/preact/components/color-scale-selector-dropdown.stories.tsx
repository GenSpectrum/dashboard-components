import { type Meta, type StoryObj } from '@storybook/preact';
import { type FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';

import { type ColorScale } from './color-scale-selector';
import { ColorScaleSelectorDropdown, type ColorScaleSelectorDropdownProps } from './color-scale-selector-dropdown';
import { ProportionSelector } from './proportion-selector';

const meta: Meta<ColorScaleSelectorDropdownProps> = {
    title: 'Component/Color scale selector dropdown',
    component: ProportionSelector,
    parameters: { fetchMock: {} },
};

export default meta;

const WrapperWithState: FunctionComponent = () => {
    const [colorScale, setColorScale] = useState<ColorScale>({ min: 0, max: 1, color: 'indigo' });

    return <ColorScaleSelectorDropdown colorScale={colorScale} setColorScale={setColorScale} />;
};

export const ColorScaleSelectorStory: StoryObj<ColorScaleSelectorDropdownProps> = {
    render: () => {
        return <WrapperWithState />;
    },
};
