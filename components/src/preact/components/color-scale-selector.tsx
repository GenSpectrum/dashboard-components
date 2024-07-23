import { type FunctionComponent } from 'preact';

import { MinMaxRangeSlider } from './min-max-range-slider';
import { type GraphColor, singleGraphColorRGBByName } from '../shared/charts/colors';
import { formatProportion } from '../shared/table/formatProportion';

export interface ColorScale {
    min: number;
    max: number;
    color: GraphColor;
}

export interface ColorScaleSelectorProps {
    colorScale: ColorScale;
    setColorScale: (colorScale: ColorScale) => void;
}

export const ColorScaleSelector: FunctionComponent<ColorScaleSelectorProps> = ({ colorScale, setColorScale }) => {
    const colorDisplayCss = `w-10 h-8 border border-gray-200 mx-2 text-xs flex items-center justify-center`;

    return (
        <div className='flex items-center'>
            <div
                style={{
                    backgroundColor: singleGraphColorRGBByName(colorScale.color, 0),
                    color: 'black',
                }}
                className={colorDisplayCss}
            >
                {formatProportion(colorScale.min, 0)}
            </div>
            <div className='w-64'>
                <MinMaxRangeSlider
                    min={colorScale.min * 100}
                    max={colorScale.max * 100}
                    setMin={(percentage) => {
                        setColorScale({ ...colorScale, min: percentage / 100 });
                    }}
                    setMax={(percentage) => {
                        setColorScale({ ...colorScale, max: percentage / 100 });
                    }}
                />
            </div>
            <div
                style={{
                    backgroundColor: singleGraphColorRGBByName(colorScale.color, 1),
                    color: 'white',
                }}
                className={colorDisplayCss}
            >
                {formatProportion(colorScale.max, 0)}
            </div>
        </div>
    );
};

export const getColorWithingScale = (value: number, colorScale: ColorScale) => {
    if (colorScale.min === colorScale.max) {
        return singleGraphColorRGBByName(colorScale.color, 0);
    }

    const colorRange = colorScale.max - colorScale.min;

    const alpha = (value - colorScale.min) / colorRange;

    return singleGraphColorRGBByName(colorScale.color, alpha);
};

export const getTextColorForScale = (value: number, colorScale: ColorScale) => {
    if (colorScale.min === colorScale.max) {
        return 'black';
    }

    const colorRange = colorScale.max - colorScale.min;

    const alpha = (value - colorScale.min) / colorRange;

    return alpha <= 0.5 ? 'black' : 'white';
};
