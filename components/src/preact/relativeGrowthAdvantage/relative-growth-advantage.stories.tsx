import denominator from './__mockData__/denominator.json';
import numerator from './__mockData__/numerator.json';
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
        headline: { control: 'text' },
    },
};

export const Primary = {
    render: (args: RelativeGrowthAdvantageProps) => (
        <LapisUrlContext.Provider value={LAPIS_URL}>
            <RelativeGrowthAdvantage
                numerator={args.numerator}
                denominator={args.denominator}
                generationTime={args.generationTime}
                views={args.views}
                width={args.width}
                height={args.height}
                headline={args.headline}
                lapisDateField={args.lapisDateField}
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
        headline: 'Relative growth advantage',
        lapisDateField: 'date',
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
