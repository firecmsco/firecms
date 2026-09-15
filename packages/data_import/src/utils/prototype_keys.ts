/**
 * The one key an import must never write with `obj[key] = value`.
 *
 * Import keys come from the uploaded file (its header row, or its JSON keys), so
 * they are attacker data. `obj["__proto__"] = value` is the prototype setter rather
 * than an own property. `constructor` and `prototype` are ordinary names as long as
 * nothing walks into an inherited value, and `unflattenObject` walks own values
 * only: a column called `constructor` is a real column (a Formula 1 results table
 * has one), and dropping it lost data.
 */
export function isPrototypePollutingKey(key: string): boolean {
    return key === "__proto__";
}

/**
 * Whether any segment of a dotted or indexed path (`a.__proto__.b`, `__proto__[0]`)
 * is that key.
 */
export function pathTraversesPrototype(path: string): boolean {
    return path.split(/[.[\]]/).some(isPrototypePollutingKey);
}
