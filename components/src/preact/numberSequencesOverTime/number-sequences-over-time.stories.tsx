import { NumberSequencesOverTime, type NumberSequencesOverTimeProps } from './number-sequences-over-time';

export default {
    title: 'Visualization/NumberSequencesOverTime',
    component: NumberSequencesOverTime,
    parameters: {
        fetchMock: {},
    },
};

const Template = {
    render: (args: NumberSequencesOverTimeProps) => (
        <NumberSequencesOverTime
            lapisFilter={args.lapisFilter}
            views={args.views}
            width={args.width}
            height={args.height}
            headline={args.headline}
        />
    ),
};

export const Table = {
    ...Template,
};
