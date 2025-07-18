import { referenceGenomeResponse } from './ReferenceGenome';
import {
    aggregatedResponse,
    detailsResponse,
    insertionsResponse,
    type LapisBaseRequest,
    lapisError,
    type MutationsRequest,
    mutationsResponse,
    problemDetail,
    type ProblemDetail,
} from './lapisTypes';
import { type SequenceType } from '../types';
import { lineageDefinitionResponseSchema } from './LineageDefinition';

export class UnknownLapisError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly requestedData: string,
    ) {
        super(message);
        this.name = 'UnknownLapisError';
    }
}

export class LapisError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly problemDetail: ProblemDetail,
        public readonly requestedData: string,
    ) {
        super(message);
        this.name = 'LapisError';
    }
}

export async function fetchAggregated(lapisUrl: string, body: LapisBaseRequest, signal?: AbortSignal) {
    const response = await callLapis(
        aggregatedEndpoint(lapisUrl),
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            signal,
        },
        'aggregated data',
    );

    return aggregatedResponse.parse(await response.json());
}

export async function fetchDetails(lapisUrl: string, body: LapisBaseRequest, signal?: AbortSignal) {
    const response = await fetch(detailsEndpoint(lapisUrl), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal,
    });

    await handleErrors(response, 'aggregated data');

    return detailsResponse.parse(await response.json());
}

export async function fetchInsertions(
    lapisUrl: string,
    body: LapisBaseRequest,
    sequenceType: SequenceType,
    signal?: AbortSignal,
) {
    const response = await callLapis(
        insertionsEndpoint(lapisUrl, sequenceType),
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            signal,
        },
        `${sequenceType} insertions`,
    );

    return insertionsResponse.parse(await response.json());
}

export async function fetchSubstitutionsOrDeletions(
    lapisUrl: string,
    body: MutationsRequest,
    sequenceType: SequenceType,
    signal?: AbortSignal,
) {
    const response = await callLapis(
        substitutionsOrDeletionsEndpoint(lapisUrl, sequenceType),
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            signal,
        },
        `${sequenceType} mutations`,
    );

    return mutationsResponse.parse(await response.json());
}

export async function fetchReferenceGenome(lapisUrl: string, signal?: AbortSignal) {
    const response = await callLapis(
        referenceGenomeEndpoint(lapisUrl),
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            signal,
        },
        'the reference genomes',
    );

    return referenceGenomeResponse.parse(await response.json());
}

export async function fetchLineageDefinition({
    lapisUrl,
    lapisField,
    signal,
}: {
    lapisUrl: string;
    lapisField: string;
    signal?: AbortSignal;
}) {
    const response = await callLapis(
        lineageDefinitionEndpoint(lapisUrl, lapisField),
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            signal,
        },
        `${lapisField} lineage definition`,
    );

    return lineageDefinitionResponseSchema.parse(await response.json());
}

async function callLapis(
    input: Parameters<typeof fetch>[0],
    init: Parameters<typeof fetch>[1],
    requestedDataName: string,
) {
    try {
        const response = await fetch(input, init);

        await handleErrors(response, requestedDataName);
        return response;
    } catch (error) {
        const message = error instanceof Error ? error.message : `${error}`;
        throw new UnknownLapisError(`Failed to connect to LAPIS: ${message}`, 500, requestedDataName);
    }
}

const handleErrors = async (response: Response, requestedData: string) => {
    if (!response.ok) {
        if (response.status >= 400 && response.status < 500) {
            const json = (await response.json()) as unknown;

            const lapisErrorResult = lapisError.safeParse(json);
            if (lapisErrorResult.success) {
                throw new LapisError(
                    response.statusText + (lapisErrorResult.data.error.detail ?? ''),
                    response.status,
                    lapisErrorResult.data.error,
                    requestedData,
                );
            }

            const problemDetailResult = problemDetail.safeParse(json);
            if (problemDetailResult.success) {
                throw new LapisError(
                    response.statusText + (problemDetailResult.data.detail ?? ''),
                    response.status,
                    problemDetailResult.data,
                    requestedData,
                );
            }

            throw new UnknownLapisError(
                `${response.statusText}: ${JSON.stringify(json)}`,
                response.status,
                requestedData,
            );
        }
        throw new UnknownLapisError(`${response.statusText}: ${response.status}`, response.status, requestedData);
    }
};

export const aggregatedEndpoint = (lapisUrl: string) => `${lapisUrl}/sample/aggregated`;
export const detailsEndpoint = (lapisUrl: string) => `${lapisUrl}/sample/details`;
export const insertionsEndpoint = (lapisUrl: string, sequenceType: SequenceType) => {
    return sequenceType === 'amino acid'
        ? `${lapisUrl}/sample/aminoAcidInsertions`
        : `${lapisUrl}/sample/nucleotideInsertions`;
};
export const substitutionsOrDeletionsEndpoint = (lapisUrl: string, sequenceType: SequenceType) => {
    return sequenceType === 'amino acid'
        ? `${lapisUrl}/sample/aminoAcidMutations`
        : `${lapisUrl}/sample/nucleotideMutations`;
};
export const referenceGenomeEndpoint = (lapisUrl: string) => `${lapisUrl}/sample/referenceGenome`;
export const lineageDefinitionEndpoint = (lapisUrl: string, lapisField: string) =>
    `${lapisUrl}/sample/lineageDefinition/${lapisField}`;
