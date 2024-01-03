export type NumberFields<S> = keyof S & { [P in keyof S]: S[P] extends number ? P : never }[keyof S];
