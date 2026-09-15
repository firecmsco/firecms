import { isPrototypePollutingKey, pathTraversesPrototype } from "./prototype_keys";

/**
 * The own value at `key` when it is an object to descend into. An inherited one is
 * never returned: `{}["toString"]` is `Object.prototype.toString`, and a header
 * `toString.call` walked into it and replaced `.call` on the built-in for the whole
 * tab. A primitive is not returned either, since a property can't be set on one.
 */
function ownObjectAt(parent: Record<string, any>, key: string | number): object | undefined {
    if (!Object.prototype.hasOwnProperty.call(parent, key)) return undefined;
    const value = parent[key];
    return typeof value === "object" && value !== null ? value : undefined;
}

/**
 * Take an object with keys of type `address.street`, `address.city` and
 * convert it to an object with nested objects like `{ address: { street: ..., city: ... } }`
 *
 * Keys here are the header row of an uploaded file. A `__proto__` segment is
 * skipped rather than written, and every step descends only into objects this
 * function created (or the file supplied), never into an inherited value, so
 * `constructor.prototype.x` is just three nested names.
 * @param flatObj
 */
export function unflattenObject(flatObj: { [key: string]: any }) {
    return Object.keys(flatObj).reduce((nestedObj, key) => {
        if (pathTraversesPrototype(key)) {
            console.warn(`Skipping column "${key}": a header may not reach the prototype chain`);
            return nestedObj;
        }
        let currentObj = nestedObj;
        const keyParts = key.split(".");
        keyParts.forEach((keyPart, i) => {

            if (/^[\w]+\[\d+\]$/.test(keyPart)) {
                const mainPropertyName = keyPart.slice(0, keyPart.indexOf("["));
                const index = parseInt(keyPart.slice(keyPart.indexOf("[") + 1, keyPart.indexOf("]")));

                if (!Array.isArray(ownObjectAt(currentObj, mainPropertyName))) {
                    currentObj[mainPropertyName] = []
                }

                if (i !== keyParts.length - 1) {
                    currentObj[mainPropertyName][index] = ownObjectAt(currentObj[mainPropertyName], index) ?? {};
                    currentObj = currentObj[mainPropertyName][index];
                } else {
                    currentObj[mainPropertyName][index] = flatObj[key];
                }
            } else if (i !== keyParts.length - 1) {
                currentObj[keyPart] = ownObjectAt(currentObj, keyPart) ?? {};
                currentObj = currentObj[keyPart];
            } else {
                currentObj[keyPart] = flatObj[key];
            }

        });
        return nestedObj;
    }, {} as { [key: string]: any });
}

/**
 * Parse each cell that holds JSON (`"true"`, `"40"`, `"[1,2]"`) into its value;
 * anything else is kept as it is.
 */
export function mapJsonParse(obj: Record<string, any>) {
    return Object.keys(obj).reduce((acc: Record<string, any>, key) => {
        // Same header row, same setter: `acc["__proto__"] = value` replaces the
        // accumulator's prototype instead of adding a column.
        if (isPrototypePollutingKey(key)) {
            console.warn(`Skipping column "${key}": a header may not reach the prototype chain`);
            return acc;
        }
        try {
            acc[key] = JSON.parse(obj[key]);
        } catch (e) {
            acc[key] = obj[key];
        }
        return acc;
    }, {});
}
