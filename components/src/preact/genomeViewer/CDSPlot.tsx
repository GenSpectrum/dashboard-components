import { Fragment, type FunctionComponent } from 'preact';
import { useMemo, useState } from 'preact/hooks';

import { type CDSFeature } from './loadGff3';
import { useDispatchFinishedLoadingEvent } from '../../utils/useDispatchFinishedLoadingEvent';
import { MinMaxRangeSlider } from '../components/min-max-range-slider';
import Tooltip from '../components/tooltip';
import { singleGraphColorRGBByName } from '../shared/charts/colors';

const MAX_TICK_NUMBER = 20;
const MIN_TICK_NUMBER = 2;

function getMaxTickNumber(fullWidth: number): number {
    const baseValue = 1000;

    const normalizedRatio = fullWidth / baseValue;

    const ticks = Math.round(MAX_TICK_NUMBER * normalizedRatio);
    return Math.max(MIN_TICK_NUMBER, Math.min(MAX_TICK_NUMBER, ticks));
}

function getTicks(zoomStart: number, zoomEnd: number, fullWidth: number) {
    const maxTickNumber = getMaxTickNumber(fullWidth);
    const length = zoomEnd - zoomStart;
    const minTickSize = length / maxTickNumber;
    let maxTickSize = 10 ** Math.round(Math.log(minTickSize) / Math.log(10));
    const numTicks = Math.round(length / maxTickSize);
    if (numTicks > maxTickNumber) {
        if (numTicks > 2 * maxTickNumber) {
            maxTickSize = maxTickSize * 5;
        } else {
            maxTickSize = maxTickSize * 2;
        }
    }
    const ticks = [];

    const offset = Math.ceil(zoomStart / maxTickSize);
    ticks.push({ start: zoomStart, end: zoomStart + maxTickSize - (zoomStart % maxTickSize) });
    for (let i = 0; i <= numTicks; i++) {
        const start = i * maxTickSize + offset * maxTickSize;
        if (start >= zoomEnd) {
            break;
        }
        const end = (i + 1) * maxTickSize + offset * maxTickSize;
        if (end > zoomEnd) {
            ticks.push({ start, end: zoomEnd });
            break;
        }
        ticks.push({ start, end });
    }
    return ticks;
}

interface XAxisProps {
    zoomStart: number;
    zoomEnd: number;
    fullWidth: number;
}

const XAxis: FunctionComponent<XAxisProps> = (componentProps) => {
    const { zoomStart, zoomEnd, fullWidth } = componentProps;

    const ticks = useMemo(() => getTicks(zoomStart, zoomEnd, fullWidth), [zoomStart, zoomEnd, fullWidth]);
    const visibleRegionLength = zoomEnd - zoomStart;
    const averageWidth = visibleRegionLength / ticks.length;
    return (
        <div className={'h-6 relative'}>
            {ticks.map((tick, idx) => {
                const width = tick.end - tick.start;
                const widthPercent = (width / visibleRegionLength) * 100;
                const leftPercent = ((tick.start - zoomStart) / visibleRegionLength) * 100;
                return (
                    <div
                        key={idx}
                        class='absolute text-xs text-black px-1 hover:opacity-80 border-l border-r border-gray-400 border-t'
                        style={{
                            left: `calc(${leftPercent}% - 1px)`,
                            width: `calc(${widthPercent}% - 1px)`,
                        }}
                    >
                        {width >= averageWidth ? tick.start : ''}
                    </div>
                );
            })}
        </div>
    );
};

function getTooltipPosition(cds_start: number, cds_end: number, genomeLength: number) {
    const tooltipY = cds_start + (cds_end - cds_start) / 2 < genomeLength / 2 ? 'start' : 'end';
    return `bottom-${tooltipY}` as const;
}

interface TooltipContentProps {
    cds: CDSFeature;
}

const TooltipContent: FunctionComponent<TooltipContentProps> = (componentProps) => {
    const { cds } = componentProps;
    const cdsLength = cds.positions.reduce((acc, pos) => acc + pos.end - pos.start, 0);
    const cdsCoordinates = cds.positions.map((pos) => `${pos.start}-${pos.end}`).join(', ');
    return (
        <>
            <p>
                <span className='font-bold'>{cds.label}</span>
            </p>
            <table>
                <tbody>
                    <tr>
                        <th className='font-medium px-2 text-right'>CDS Length</th>
                        <td>{cdsLength}</td>
                    </tr>
                    <tr>
                        <th className='font-medium px-2 text-right'>CDS Coordinates</th>
                        <td>{cdsCoordinates}</td>
                    </tr>
                </tbody>
            </table>
        </>
    );
};

interface CDSBarsProps {
    gffData: CDSFeature[][];
    zoomStart: number;
    zoomEnd: number;
}

const CDSBars: FunctionComponent<CDSBarsProps> = (componentProps) => {
    const { gffData, zoomStart, zoomEnd } = componentProps;
    const visibleRegionLength = zoomEnd - zoomStart;
    return (
        <>
            {gffData.map((data, listId) => (
                <div className={'w-full h-6 relative'} key={listId}>
                    {data.map((cds, idx) => (
                        <Fragment key={idx}>
                            {cds.positions.map((position, posIdx) => {
                                const start = Math.max(position.start, zoomStart);
                                const end = Math.min(position.end, zoomEnd);

                                if (start >= end) {
                                    return null;
                                }

                                const widthPercent = ((end - start) / visibleRegionLength) * 100;
                                const leftPercent = ((start - zoomStart) / visibleRegionLength) * 100;
                                const tooltipPosition = getTooltipPosition(start, end, visibleRegionLength);
                                return (
                                    <Tooltip
                                        content={<TooltipContent cds={cds} />}
                                        position={tooltipPosition}
                                        key={`${idx}-${posIdx}`}
                                        tooltipStyle={{ left: `${leftPercent}%` }}
                                    >
                                        <div
                                            className='absolute text-xs text-white rounded px-1 py-0.5 cursor-pointer hover:opacity-80 shadow-md'
                                            style={{
                                                left: `${leftPercent}%`,
                                                width: `${widthPercent}%`,
                                                backgroundColor: singleGraphColorRGBByName(cds.color),
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {cds.label}
                                        </div>
                                    </Tooltip>
                                );
                            })}
                        </Fragment>
                    ))}
                </div>
            ))}
        </>
    );
};

interface CDSProps {
    gffData: CDSFeature[][];
    genomeLength: number;
    width: number;
}

const CDSPlot: FunctionComponent<CDSProps> = (componentProps) => {
    const ref = useDispatchFinishedLoadingEvent();

    const { gffData, genomeLength, width } = componentProps;

    const [zoomStart, setZoomStart] = useState(0);
    const [zoomEnd, setZoomEnd] = useState(genomeLength);

    const updateZoomStart = (newStart: number) => {
        setZoomStart(newStart);
    };

    const updateZoomEnd = (newEnd: number) => {
        setZoomEnd(newEnd);
    };

    return (
        <div ref={ref} class='p-4'>
            <CDSBars gffData={gffData} zoomStart={zoomStart} zoomEnd={zoomEnd} />
            <XAxis zoomStart={zoomStart} zoomEnd={zoomEnd} fullWidth={width} />
            <div class='relative w-full h-5'>
                <MinMaxRangeSlider
                    min={zoomStart}
                    max={zoomEnd}
                    setMin={updateZoomStart}
                    setMax={updateZoomEnd}
                    rangeMin={0}
                    rangeMax={genomeLength}
                    step={1}
                />
            </div>
            <XAxis zoomStart={0} zoomEnd={genomeLength} fullWidth={width} />
        </div>
    );
};

export default CDSPlot;
