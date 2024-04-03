import { createContext } from '@lit/context';

import { type ReferenceGenome } from '../lapisApi/ReferenceGenome';

export const referenceGenomeContext = createContext<ReferenceGenome>('reference-genome-context');
