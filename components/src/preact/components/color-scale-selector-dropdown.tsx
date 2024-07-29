import { type FunctionComponent } from 'preact';

import { ColorScaleSelector, type ColorScaleSelectorProps } from './color-scale-selector';
import { Dropdown } from './dropdown';

export type ColorScaleSelectorDropdownProps = ColorScaleSelectorProps;

export const ColorScaleSelectorDropdown: FunctionComponent<ColorScaleSelectorDropdownProps> = ({
    colorScale,
    setColorScale,
}) => {
    return (
        <div className='w-20'>
            <Dropdown buttonTitle={`Color scale`} placement={'bottom-start'}>
                <ColorScaleSelector colorScale={colorScale} setColorScale={setColorScale} />
            </Dropdown>
        </div>
    );
};
