import z, { type ZodTypeAny } from 'zod';

export const orderByType = z.enum(['ascending', 'descending']);

export const orderBy = z.object({
    field: z.string(),
    type: orderByType,
});

const filterValue = z.union([z.string(), z.number(), z.boolean(), z.null(), z.undefined(), z.array(z.string())]);

const dateRange = z.object({
    dateFrom: z.string(),
    dateTo: z.string(),
});

export const lapisBaseRequest = z
    .object({
        limit: z.number().optional(),
        offset: z.number().optional(),
        fields: z.array(z.string()).optional(),
        orderBy: z.array(orderBy).optional(),
    })
    .catchall(filterValue);
export type LapisBaseRequest = z.infer<typeof lapisBaseRequest>;

export const mutationsRequest = lapisBaseRequest.extend({ minProportion: z.number().optional() });
export type MutationsRequest = z.infer<typeof mutationsRequest>;

const mutationProportionCount = z.object({
    mutation: z.string(),
    proportion: z.number(),
    count: z.number(),
    sequenceName: z.union([z.string(), z.null()]),
    mutationFrom: z.string(),
    mutationTo: z.string(),
    position: z.number(),
});
export const mutationsResponse = makeLapisResponse(z.array(mutationProportionCount));
export type MutationsResponse = z.infer<typeof mutationsResponse>;

export const mutationsOverTimeRequest = z.object({
    filters: z.record(filterValue),
    downloadAsFile: z.boolean().optional(),
    downloadFileBasename: z.string().optional(),
    compression: z.enum(['gzip', 'none']).optional(),
    includeMutations: z.array(z.string()).optional(),
    dateRanges: z.array(dateRange).optional(),
    dateField: z.string().optional(),
});
export type MutationsOverTimeRequest = z.infer<typeof mutationsOverTimeRequest>;

export const mutationsOverTimeResponse = makeLapisResponse(
    z.object({
        mutations: z.array(z.string()),
        dateRanges: z.array(dateRange),
        data: z.array(
            z.array(
                z.object({
                    count: z.number(),
                    coverage: z.number(),
                }),
            ),
        ),
        totalCountsByDateRange: z.array(z.number()),
    }),
);
export type MutationsOverTimeResponse = z.infer<typeof mutationsOverTimeResponse>;

const insertionCount = z.object({
    insertion: z.string(),
    count: z.number(),
    insertedSymbols: z.string(),
    position: z.number(),
    sequenceName: z.union([z.string(), z.null()]),
});
export const insertionsResponse = makeLapisResponse(z.array(insertionCount));

const baseResponseValueSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export const aggregatedItem = z.object({ count: z.number() }).catchall(baseResponseValueSchema);
export const aggregatedResponse = makeLapisResponse(z.array(aggregatedItem));
export type AggregatedItem = z.infer<typeof aggregatedItem>;

export const detailsItem = z.object({}).catchall(baseResponseValueSchema);
export const detailsResponse = makeLapisResponse(z.array(detailsItem));
export type DetailsItem = z.infer<typeof detailsItem>;

function makeLapisResponse<T extends ZodTypeAny>(data: T) {
    return z.object({
        data,
    });
}

export const problemDetail = z.object({
    title: z.string().optional(),
    status: z.number(),
    detail: z.string().optional(),
    type: z.string(),
    instance: z.string().optional(),
});

export type ProblemDetail = z.infer<typeof problemDetail>;

export const lapisError = z.object({
    error: problemDetail,
});
