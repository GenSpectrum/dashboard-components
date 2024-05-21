import { referenceGenomeResponse } from './ReferenceGenome';
import {
    aggregatedResponse,
    insertionsResponse,
    type LapisBaseRequest,
    lapisError,
    type MutationsRequest,
    mutationsResponse,
    problemDetail,
    type ProblemDetail,
} from './lapisTypes';
import { type SequenceType } from '../types';

export class UnknownLapisError extends Error {
    constructor(
        message: string,
        public readonly status: number,
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
    ) {
        super(message);
        this.name = 'LapisError';
    }
}

export async function fetchAggregated(lapisUrl: string, body: LapisBaseRequest, signal?: AbortSignal) {
    const response = await fetch(aggregatedEndpoint(lapisUrl), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal,
    });

    await handleErrors(response);

    return aggregatedResponse.parse(await response.json());
}

export async function fetchInsertions(
    lapisUrl: string,
    body: LapisBaseRequest,
    sequenceType: SequenceType,
    signal?: AbortSignal,
) {
    const response = await fetch(insertionsEndpoint(lapisUrl, sequenceType), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal,
    });

    await handleErrors(response);

    return insertionsResponse.parse(await response.json());
}

export async function fetchSubstitutionsOrDeletions(
    lapisUrl: string,
    body: MutationsRequest,
    sequenceType: SequenceType,
    signal?: AbortSignal,
) {
    const response = await fetch(substitutionsOrDeletionsEndpoint(lapisUrl, sequenceType), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal,
    });

    await handleErrors(response);

    return mutationsResponse.parse(await response.json());
}

export async function fetchReferenceGenome(lapisUrl: string, signal?: AbortSignal) {
    const response = await fetch(referenceGenomeEndpoint(lapisUrl), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        signal,
    });

    await handleErrors(response);
    return referenceGenomeResponse.parse(await response.json());
}

const handleErrors = async (response: Response) => {
    if (!response.ok) {
        if (response.status >= 400 && response.status < 500) {
            const json = await response.json();

            const lapisErrorResult = lapisError.safeParse(json);
            if (lapisErrorResult.success) {
                throw new LapisError(
                    response.statusText + lapisErrorResult.data.error.detail,
                    response.status,
                    lapisErrorResult.data.error,
                );
            }

            const problemDetailResult = problemDetail.safeParse(json);
            if (problemDetailResult.success) {
                throw new LapisError(
                    response.statusText + problemDetailResult.data.detail,
                    response.status,
                    problemDetailResult.data,
                );
            }

            throw new UnknownLapisError(`${response.statusText}: ${JSON.stringify(json)}`, response.status);
        }
        throw new UnknownLapisError(`${response.statusText}: ${response.status}`, response.status);
    }
};

export const aggregatedEndpoint = (lapisUrl: string) => `${lapisUrl}/sample/aggregated`;
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
