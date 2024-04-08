import { http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';

import { aggregatedEndpoint } from './src/lapisApi/lapisApi';
import type { LapisBaseRequest } from './src/lapisApi/lapisTypes';

export const DUMMY_LAPIS_URL = 'http://lapis.dummy';

export const testServer = setupServer();

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
                const actualBody = JSON.stringify(await request.json());
                const expectedBody = JSON.stringify(body);
                if (actualBody !== JSON.stringify(body)) {
                    throw new Error(`Expected body: ${expectedBody}, actual body: ${actualBody}`);
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
