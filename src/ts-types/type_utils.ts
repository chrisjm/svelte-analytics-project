export type MapValue<T> = T extends Map<any, infer U> ? U : never;
export type SetValue<T> = T extends Set<infer U> ? U : never;
export type ArrayValue<T> = T extends Array<infer U> ? U : never;

export type Present<T> = Exclude<T, null | undefined>;
/** Remove null and undefined from all members of this object */
export type KeysPresent<T, U extends keyof T = keyof T> = {
  [P in U]-?: P extends U ? Present<T[P]> : never;
} &
  { [P in Exclude<keyof T, U>]: P extends U ? never : T[P] };

/** The set of keys in T with values that match the type of U */
export type FilteredKeys<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];
