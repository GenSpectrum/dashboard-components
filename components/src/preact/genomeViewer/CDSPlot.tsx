import { type FunctionComponent } from 'preact';
import { useMemo, useState } from 'preact/hooks';

import { type CDSFeature } from './loadGff3';
import { MinMaxRangeSlider } from '../components/min-max-range-slider';
import Tooltip from '../components/tooltip';
import { singleGraphColorRGBByName } from '../shared/charts/colors';

const max_tick_number = 20;

function getTicks(zoomStart: number, zoomEnd: number) {
    const length = zoomEnd - zoomStart;
    const min_tick_size = length / max_tick_number;
    let max_tick_size = 10 ** Math.round(Math.log(min_tick_size) / Math.log(10));
    const num_ticks = Math.round(length / max_tick_size);
    if (num_ticks > max_tick_number) {
        if (num_ticks > 2 * max_tick_number) {
            max_tick_size = max_tick_size * 5;
        } else {
            max_tick_size = max_tick_size * 2;
        }
    }
    const ticks = [];

    const offset = Math.ceil(zoomStart / max_tick_size);
    ticks.push({ start: zoomStart, end: zoomStart + max_tick_size - (zoomStart % max_tick_size) });
    for (let i = 0; i <= num_ticks; i++) {
        const start = i * max_tick_size + offset * max_tick_size;
        if (start >= zoomEnd) {
            break;
        }
        const end = (i + 1) * max_tick_size + offset * max_tick_size;
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
}

const XAxis: FunctionComponent<XAxisProps> = (componentProps) => {
    const { zoomStart, zoomEnd } = componentProps;

    const ticks = useMemo(() => getTicks(zoomStart, zoomEnd), [zoomStart, zoomEnd]);
    const visibleRegionLength = useMemo(() => zoomEnd - zoomStart, [zoomStart, zoomEnd]);
    return (
        <>
            {ticks.map((tick, idx) => {
                const widthPercent = ((tick.end - tick.start) / visibleRegionLength) * 100;
                const leftPercent = ((tick.start - zoomStart) / visibleRegionLength) * 100;
                return (
                    <div
                        key={idx}
                        class='absolute text-xs text-black px-1 py-0.5 cursor-pointer hover:opacity-80 border-l border-r border-gray-400 border-t'
                        style={{
                            left: `${leftPercent}%`,
                            width: `${widthPercent}%`,
                            top: '1.5rem',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {tick.start}
                    </div>
                );
            })}
        </>
    );
};

function getTooltipPosition(cds_start: number, cds_end: number, genomeLength: number) {
    const tooltipY = cds_start + (cds_end - cds_start) / 2 < genomeLength / 2 ? 'start' : 'end';
    return `bottom-${tooltipY}` as const;
}

interface CDSBarsProps {
    gffData: CDSFeature[];
    zoomStart: number;
    zoomEnd: number;
}

const CDSBars: FunctionComponent<CDSBarsProps> = (componentProps) => {
    const { gffData, zoomStart, zoomEnd } = componentProps;
    const visibleRegionLength = useMemo(() => zoomEnd - zoomStart, [zoomStart, zoomEnd]);
    return (
        <>
            {gffData.map((cds, idx) => {
                const start = Math.max(cds.start, zoomStart);
                const end = Math.min(cds.end, zoomEnd);
                if (start >= end) {
                    return null;
                }
                const widthPercent = ((end - start) / visibleRegionLength) * 100;
                const leftPercent = ((start - zoomStart) / visibleRegionLength) * 100;
                const position = getTooltipPosition(start, end, visibleRegionLength);
                const tooltipContent = (
                    <div>
                        <p>
                            <span className='font-bold'>{cds.label}</span>
                        </p>
                        <tbody>
                            <tr>
                                <th className='font-medium' scope='row'>
                                    Start
                                </th>
                                <td>{start}</td>
                            </tr>
                            <tr>
                                <th className='font-medium' scope='row'>
                                    End
                                </th>
                                <td>{end}</td>
                            </tr>
                            <tr>
                                <th className='font-medium' scope='row'>
                                    Length
                                </th>
                                <td>{end - start}</td>
                            </tr>
                        </tbody>
                    </div>
                );
                return (
                    <Tooltip
                        content={tooltipContent}
                        position={position}
                        key={idx}
                        tooltipStyle={{
                            left: `${leftPercent}%`,
                        }}
                        full={false}
                    >
                        <div
                            key={idx}
                            class='absolute text-xs text-white rounded px-1 py-0.5 cursor-pointer hover:opacity-80 shadow-md'
                            style={{
                                left: `${leftPercent}%`,
                                width: `${widthPercent}%`,
                                backgroundColor: singleGraphColorRGBByName(cds.color),
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {cds.label}
                        </div>
                    </Tooltip>
                );
            })}
        </>
    );
};

interface CDSProps {
    gffData: CDSFeature[];
    genomeLength: number;
}

const CDSPlot: FunctionComponent<CDSProps> = (componentProps) => {
    const { gffData, genomeLength } = componentProps;

    const [zoomStart, setZoomStart] = useState(0);
    const [zoomEnd, setZoomEnd] = useState(genomeLength);

    const updateZoomStart = (newStart: number) => {
        if (newStart <= zoomEnd - 100) {
          setZoomStart(newStart);
        }
      };
      
      const updateZoomEnd = (newEnd: number) => {
        if (newEnd >= zoomStart + 100) {
          setZoomEnd(newEnd);
        }
      };

    return (
        <div class='p-4'>
            <h2 class='text-xl font-semibold mb-2'>Genome Data Viewer</h2>
            <div class='relative h-20 w-full'>
                <CDSBars gffData={gffData} zoomStart={zoomStart} zoomEnd={zoomEnd} />
                <XAxis zoomStart={zoomStart} zoomEnd={zoomEnd} />
            </div>
            <div class='relative h-20 w-full'>
                <MinMaxRangeSlider
                    min={zoomStart}
                    max={zoomEnd}
                    setMin={updateZoomStart}
                    setMax={updateZoomEnd}
                    rangeMin={0}
                    rangeMax={genomeLength}
                    step={1}
                />
                <XAxis zoomStart={0} zoomEnd={genomeLength} />
            </div>
        </div>
    );
};

export default CDSPlot;
