/**
 * Those are helpers to make sure that types are equal.
 *
 * #### Why do we need this?
 *
 * The custom element manifest does not fully resolve the types of properties,
 * so Storybook will only show non-resolved types (such as `View[]`).
 * To give users full type information, we have to inline the types in the web component definitions.
 * These assertions help us to make sure that the inlined type is equal to the type
 * that is defined in the Preact components.
 */

export type Expect<T extends true> = T;
export type IsAssignable<X, Y> = X extends Y ? true : false;
export type And<X, Y> = X extends true ? (Y extends true ? true : false) : false;
export type Equals<X, Y> = And<IsAssignable<X, Y>, IsAssignable<Y, X>>;
