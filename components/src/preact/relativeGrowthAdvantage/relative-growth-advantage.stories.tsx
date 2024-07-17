import denominator from './__mockData__/denominatorFilter.json';
import numerator from './__mockData__/numeratorFilter.json';
import { RelativeGrowthAdvantage, type RelativeGrowthAdvantageProps } from './relative-growth-advantage';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import { LapisUrlContext } from '../LapisUrlContext';

export default {
    title: 'Visualization/RelativeGrowthAdvantage',
    component: RelativeGrowthAdvantage,
    parameters: {
        fetchMock: {},
    },
    argTypes: {
        numerator: { control: 'object' },
        denominator: { control: 'object' },
        generationTime: { control: 'number' },
        views: {
            options: ['line'],
            control: { type: 'check' },
        },
        width: { control: 'text' },
        height: { control: 'text' },
        yAxisMaxConfig: { control: 'object' },
    },
};

export const Primary = {
    render: (args: RelativeGrowthAdvantageProps) => (
        <LapisUrlContext.Provider value={LAPIS_URL}>
            <RelativeGrowthAdvantage
                numeratorFilter={args.numeratorFilter}
                denominatorFilter={args.denominatorFilter}
                generationTime={args.generationTime}
                views={args.views}
                width={args.width}
                height={args.height}
                lapisDateField={args.lapisDateField}
                yAxisMaxConfig={args.yAxisMaxConfig}
            />
        </LapisUrlContext.Provider>
    ),
    args: {
        numerator: { country: 'Switzerland', pangoLineage: 'B.1.1.7', dateFrom: '2020-12-01', dateTo: '2021-03-01' },
        denominator: { country: 'Switzerland', dateFrom: '2020-12-01', dateTo: '2021-03-01' },
        generationTime: 7,
        views: ['line'],
        width: '100%',
        height: '700px',
        lapisDateField: 'date',
        yAxisMaxConfig: {
            linear: 1,
            logarithmic: 1,
        },
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'numerator',
                        url: AGGREGATED_ENDPOINT,
                        body: {
                            country: 'Switzerland',
                            pangoLineage: 'B.1.1.7',
                            dateFrom: '2020-12-01',
                            dateTo: '2021-03-01',
                            fields: ['date'],
                        },
                    },
                    response: {
                        status: 200,
                        body: numerator,
                    },
                },
                {
                    matcher: {
                        name: 'denominator',
                        url: AGGREGATED_ENDPOINT,
                        body: {
                            country: 'Switzerland',
                            dateFrom: '2020-12-01',
                            dateTo: '2021-03-01',
                            fields: ['date'],
                        },
                    },
                    response: {
                        status: 200,
                        body: denominator,
                    },
                },
            ],
        },
    },
};
