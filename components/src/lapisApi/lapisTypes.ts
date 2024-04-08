import z, { type ZodTypeAny } from 'zod';

export const orderByType = z.enum(['ascending', 'descending']);

export const orderBy = z.object({
    field: z.string(),
    type: orderByType,
});

export const lapisBaseRequest = z
    .object({
        limit: z.number().optional(),
        offset: z.number().optional(),
        fields: z.array(z.string()).optional(),
        orderBy: z.array(orderBy).optional(),
    })
    .catchall(z.union([z.boolean(), z.undefined(), z.string(), z.number(), z.null(), z.array(z.string())]));
export type LapisBaseRequest = z.infer<typeof lapisBaseRequest>;

export const mutationsRequest = lapisBaseRequest.extend({ minProportion: z.number().optional() });
export type MutationsRequest = z.infer<typeof mutationsRequest>;

const mutationProportionCount = z.object({
    mutation: z.string(),
    proportion: z.number(),
    count: z.number(),
});
export const mutationsResponse = makeLapisResponse(z.array(mutationProportionCount));

const insertionCount = z.object({
    insertion: z.string(),
    count: z.number(),
});
export const insertionsResponse = makeLapisResponse(z.array(insertionCount));

export const aggregatedItem = z.object({ count: z.number() }).catchall(z.union([z.string(), z.number(), z.null()]));
export const aggregatedResponse = makeLapisResponse(z.array(aggregatedItem));
export type AggregatedItem = z.infer<typeof aggregatedItem>;

function makeLapisResponse<T extends ZodTypeAny>(data: T) {
    return z.object({
        data,
    });
}
