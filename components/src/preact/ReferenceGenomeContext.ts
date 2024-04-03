import { createContext } from 'preact';

import { type ReferenceGenome } from '../lapisApi/ReferenceGenome';

export const ReferenceGenomeContext = createContext<ReferenceGenome>({ nucleotideSequences: [], genes: [] });
