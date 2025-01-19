import { type AssertionError } from 'node:assert';

import { type DefaultBodyType, http, type StrictRequest } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, expect } from 'vitest';

import { aggregatedEndpoint, detailsEndpoint, substitutionsOrDeletionsEndpoint } from './src/lapisApi/lapisApi';
import { type LapisBaseRequest, type MutationsRequest, type MutationsResponse } from './src/lapisApi/lapisTypes';

export const DUMMY_LAPIS_URL = 'http://lapis.dummy';

export const testServer = setupServer();

function getError(assertionError: AssertionError) {
    return `${assertionError.message} - expected: ${JSON.stringify(assertionError.expected)} - actual ${JSON.stringify(assertionError.actual)}`;
}

export const lapisRequestMocks = {
    aggregated: (
        body: LapisBaseRequest,
        response: {
            data: (Record<string, string | number | null> & { count: number })[];
        },
        statusCode: number = 200,
    ) => {
        testServer.use(
            http.post(aggregatedEndpoint(DUMMY_LAPIS_URL), async ({ request }) => {
                const actualBody = await request.json();
                try {
                    expect(actualBody, 'Request body did not match').to.deep.equal(body);
                } catch (error) {
                    return new Response(
                        JSON.stringify({
                            error: getError(error as AssertionError),
                        }),
                        {
                            status: 400,
                        },
                    );
                }
                return new Response(JSON.stringify(response), {
                    status: statusCode,
                });
            }),
        );
    },
    multipleAggregated: (
        expectedRequests: {
            body: LapisBaseRequest;
            response: {
                data: (Record<string, string | number | null> & { count: number })[];
            };
        }[],
    ) => {
        testServer.use(http.post(aggregatedEndpoint(DUMMY_LAPIS_URL), resolver(expectedRequests)));
    },
    details: (
        body: LapisBaseRequest,
        response: {
            data: Record<string, string | number | boolean | null>[];
        },
        statusCode: number = 200,
    ) => {
        testServer.use(http.post(detailsEndpoint(DUMMY_LAPIS_URL), resolver([{ body, response, statusCode }])));
    },
    multipleMutations: (
        expectedRequests: {
            body: MutationsRequest;
            response: MutationsResponse;
        }[],
        sequenceType: 'nucleotide' | 'amino acid',
    ) => {
        testServer.use(
            http.post(substitutionsOrDeletionsEndpoint(DUMMY_LAPIS_URL, sequenceType), resolver(expectedRequests)),
        );
    },
};

function resolver(
    expectedRequests: {
        body: unknown;
        response: unknown;
        statusCode?: number;
    }[],
) {
    return async ({ request }: { request: StrictRequest<DefaultBodyType> }) => {
        const actualBody = await request.json();

        const errors = [];
        for (const { body, response, statusCode } of expectedRequests) {
            try {
                expect(actualBody, 'Request body did not match').to.deep.equal(body);
            } catch (error) {
                errors.push(error);
                continue;
            }
            return new Response(JSON.stringify(response), {
                status: statusCode ?? 200,
            });
        }

        return new Response(
            JSON.stringify({
                error: errors.map((error) => getError(error as AssertionError)),
            }),
            {
                status: 400,
            },
        );
    };
}

beforeAll(() => testServer.listen({ onUnhandledRequest: 'warn' }));

afterAll(() => testServer.close());

afterEach(() => testServer.resetHandlers());
