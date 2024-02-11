/**
 * NumberFields<S> is a type that represents the keys of an object S that have a number value.
 * For example, given `type Person = { age: number }`, it holds `'age' extends NumberFields<Person>`.
 */
export type NumberFields<S> = keyof S & { [P in keyof S]: S[P] extends number ? P : never }[keyof S];

/**
 * MappedType<K, T> is a type that represents an object with keys of type K and values of type T.
 */
export type MappedType<K extends string | number | symbol, T> = { [P in K]: T };

/**
 * MappedNumber<K> is a type that represents an object with keys of type K and values of type number.
 */
export type MappedNumber<K extends string | number | symbol> = MappedType<K, number>;
