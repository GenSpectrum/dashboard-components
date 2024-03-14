import { http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';

export const DUMMY_LAPIS_URL = 'http://lapis.dummy';

export const testServer = setupServer();

export const lapisRequestMocks = {
    aggregated: (
        urlParams: URLSearchParams,
        response: {
            data: (Record<string, string | number | null> & { count: number })[];
        },
        statusCode: number = 200,
    ) => {
        testServer.use(
            http.get(`${DUMMY_LAPIS_URL}/aggregated`, ({ request }) => {
                const actualSearchParams = request.url.split('?')[1] || '';
                if (urlParams.toString() !== actualSearchParams) {
                    throw Error(`Expected URLSearchParams ${urlParams.toString()} but got ${actualSearchParams}`);
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
