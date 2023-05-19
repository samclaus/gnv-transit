
/**
 * Takes a type T as an argument and yields a type with the same fields but they
 * are all writable. This is very useful for classes where you want to expose
 * their properties/fields to outside code as "read-only", but inside of the class
 * you want to forcefully tell TypeScript "no I am going to update this field even
 * though it is read-only for everyone else".
 */
export type CastAwayReadonly<T> = {
    -readonly [Field in keyof T]: T[Field];
};
