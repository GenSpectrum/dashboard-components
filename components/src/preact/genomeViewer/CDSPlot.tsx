import { type FunctionComponent } from 'preact';

import { type CDSFeature } from './loadGff3';
import Tooltip from '../components/tooltip';
import { singleGraphColorRGBByName } from '../shared/charts/colors';

const max_chunk_number = 20;

function getTooltipPosition(cds_start: number, cds_end: number, genomeLength: number) {
    const tooltipY = cds_start + (cds_end - cds_start) / 2 < genomeLength / 2 ? 'start' : 'end';
    return `bottom-${tooltipY}` as const;
}

function getChunks(genomeLength: number) {
    const min_chunk_size = genomeLength / max_chunk_number;
    const max_chunk_size = 10 ** Math.round(Math.log(min_chunk_size) / Math.log(10));
    const num_chunks = Math.round(genomeLength / max_chunk_size);
    const chunks = [];
    for (let i = 0; i < num_chunks; i++) {
        chunks.push({ start: i * max_chunk_size, end: (i + 1) * max_chunk_size });
    }
    return chunks;
}

interface CDSProps {
    gffData: CDSFeature[];
    genomeLength: number;
}

const CDSPlot: FunctionComponent<CDSProps> = (componentProps) => {
    const { gffData, genomeLength } = componentProps;
    const chunks = getChunks(genomeLength);
    return (
        <div class='p-4'>
            <h2 class='text-xl font-semibold mb-2'>Genome Data Viewer</h2>
            <div class='relative border-t border-gray-400 h-20 w-full'>
                {/* CDS blocks */}
                {gffData.map((cds, idx) => {
                    const widthPercent = ((cds.end - cds.start) / genomeLength) * 100;
                    const leftPercent = (cds.start / genomeLength) * 100;
                    const position = getTooltipPosition(cds.start, cds.end, genomeLength);
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
                                    <td>{cds.start}</td>
                                </tr>
                                <tr>
                                    <th className='font-medium' scope='row'>
                                        End
                                    </th>
                                    <td>{cds.end}</td>
                                </tr>
                                <tr>
                                    <th className='font-medium' scope='row'>
                                        Length
                                    </th>
                                    <td>{cds.end - cds.start}</td>
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
                {chunks.map((chunk, idx) => {
                    const widthPercent = ((chunk.end - chunk.start) / genomeLength) * 100;
                    const leftPercent = (chunk.start / genomeLength) * 100;
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
                            {chunk.start}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CDSPlot;
