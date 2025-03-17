import { h } from 'preact';
import { useState } from 'preact/hooks';
import TooltipPro from '../components/tooltip';
import {ColorsRGB} from '../shared/charts/colors';
import * as fs from 'fs';
import * as path from 'path';

const gffData = [
    { start: 97, end: 465, label: 'capsid', color: '#E57373' },
    { start: 466, end: 966, label: 'prM', color: '#81C784' },
    { start: 967, end: 2469, label: 'env', color: '#64B5F6' },
    { start: 2470, end: 3525, label: 'NS1', color: '#FFD54F' },
    { start: 3526, end: 4218, label: 'NS2A', color: '#BA68C8' },
    { start: 4219, end: 4611, label: 'NS2B', color: '#4DD0E1' },
];

let genomeLength = 11029;

const max_chunk_number = 20;
let min_chunk_size = genomeLength / max_chunk_number;
let max_chunk_size = 10 ** Math.round(Math.log(min_chunk_size) / Math.log(10));
let num_chunks = Math.round(genomeLength / max_chunk_size);
let chunks = [];
for (let i = 0; i < num_chunks; i++) {
    chunks.push({ start: i * max_chunk_size, end: (i + 1) * max_chunk_size });
}

interface CDSFeature {
  start: number;
  end: number;
  label: string;
  color: string;
}

function parseGFF3(filePath: string):CDSFeature[] {
  // const response = await fetch(filePath);
  // const content = await response.text();
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  const cdsFeatures: CDSFeature[] = [];
  let colorIndex = 0;

  for (const line of lines) {
    if (line.startsWith('#') || line.trim() === '') {continue}

    const fields = line.split('\t');
    if (fields.length < 9) {continue}

    const [seqid, source, type, startStr, endStr, score, strand, phase, attributes] = fields;

    if (type !== 'CDS') {continue}

    const start = parseInt(startStr, 10);
    const end = parseInt(endStr, 10);

    // Extract label from attributes (try product= or Name=)
    let label = 'CDS';
    const attrPairs = attributes.split(';');
    for (const pair of attrPairs) {
      if (pair.startsWith('product=')) {
        label = pair.replace('product=', '');
        break;
      } else if (pair.startsWith('Name=')) {
        label = pair.replace('Name=', '');
      }
    }

    // Assign a color from the palette
    const ColorPalette = Object.keys(ColorsRGB);
    const color = ColorPalette[colorIndex % ColorPalette.length];
    colorIndex++;

    cdsFeatures.push({ start, end, label, color });
  }

  return cdsFeatures;
}


function getTooltipPosition(cds_start: number, cds_end: number, genomeLength: number) {
    const tooltipY = cds_start + (cds_end - cds_start) / 2 < genomeLength / 2 ? 'start' : 'end';
    return `bottom-${tooltipY}` as const;
}

const GenomeTrackViewer = () => {

    return (
        <div class='p-4'>
            <h2 class='text-xl font-semibold mb-2'>Genome Track Viewer</h2>
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
                                    <th className='font-medium' scope='row'>Start</th>
                                    <td>{cds.start}</td>
                                </tr>
                                <tr>
                                    <th className='font-medium' scope='row'>End</th>
                                    <td>{cds.end}</td>
                                </tr>
                                <tr>
                                    <th className='font-medium' scope='row'>Length</th>
                                    <td>{cds.end - cds.start}</td>
                                </tr>
                            </tbody>
                        </div>
                    );
                    return (
                        <TooltipPro
                            content={tooltipContent}
                            position={position}
                            key={idx}
                            tooltipStyle={{
                                left: `${leftPercent}%`,
                            }}
                        >
                            <div
                                key={idx}
                                class='absolute text-xs text-white rounded px-1 py-0.5 cursor-pointer hover:opacity-80 shadow-md'
                                style={{
                                    left: `${leftPercent}%`,
                                    width: `${widthPercent}%`,
                                    backgroundColor: cds.color,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {cds.label}
                            </div>
                        </TooltipPro>
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

export default GenomeTrackViewer;
