/**
 * Keys an import must never write with `obj[key] = value`.
 *
 * Import keys come from the uploaded file (its header row, or its JSON keys), so
 * they are attacker data. `obj["__proto__"] = value` is the prototype setter rather
 * than an own property, and walking `constructor` then `prototype` from a plain
 * object reaches `Object.prototype`: a column named `__proto__.polluted` or
 * `constructor.prototype.polluted` would write onto every object in the tab.
 */
const PROTOTYPE_KEYS = new Set(["__proto__", "constructor", "prototype"]);

export function isPrototypePollutingKey(key: string): boolean {
    return PROTOTYPE_KEYS.has(key);
}

/**
 * Whether any segment of a dotted or indexed path (`a.__proto__.b`, `__proto__[0]`)
 * is one of those keys.
 */
export function pathTraversesPrototype(path: string): boolean {
    return path.split(/[.[\]]/).some(segment => PROTOTYPE_KEYS.has(segment));
}
