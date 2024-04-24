import { type AssertionError } from 'node:assert';

import { http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, expect } from 'vitest';

import { aggregatedEndpoint } from './src/lapisApi/lapisApi';
import type { LapisBaseRequest } from './src/lapisApi/lapisTypes';

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
};

beforeAll(() => testServer.listen({ onUnhandledRequest: 'warn' }));

afterAll(() => testServer.close());

afterEach(() => testServer.resetHandlers());
