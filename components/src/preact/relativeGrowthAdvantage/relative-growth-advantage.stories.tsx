import { LapisUrlContext } from '../LapisUrlContext';
import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import numerator from './__mockData__/numerator.json';
import denominator from './__mockData__/denominator.json';
import { RelativeGrowthAdvantage, RelativeGrowthAdvantageProps } from './relative-growth-advantage';

export default {
    title: 'Example/RelativeGrowthAdvantage',
    component: RelativeGrowthAdvantage,
    parameters: {
        fetchMock: {},
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
            />
        </LapisUrlContext.Provider>
    ),
    args: {
        numerator: { country: 'Switzerland', pangoLineage: 'B.1.1.7', dateFrom: '2020-12-01', dateTo: '2021-03-01' },
        denominator: { country: 'Switzerland', dateFrom: '2020-12-01', dateTo: '2021-03-01' },
        generationTime: 7,
        views: ['line'],
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'numerator',
                        url: AGGREGATED_ENDPOINT,
                        query: {
                            country: 'Switzerland',
                            pangoLineage: 'B.1.1.7',
                            dateFrom: '2020-12-01',
                            dateTo: '2021-03-01',
                            fields: 'date',
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
                        query: {
                            country: 'Switzerland',
                            dateFrom: '2020-12-01',
                            dateTo: '2021-03-01',
                            fields: 'date',
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
