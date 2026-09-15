import { isPrototypePollutingKey, pathTraversesPrototype } from "./prototype_keys";

/**
 * Take an object with keys of type `address.street`, `address.city` and
 * convert it to an object with nested objects like `{ address: { street: ..., city: ... } }`
 *
 * Keys here are the header row of an uploaded file, so a column that would walk
 * onto the prototype chain (`__proto__.polluted`, `constructor.prototype.x`) is
 * skipped rather than written.
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

                if (!currentObj[mainPropertyName]) {
                    currentObj[mainPropertyName] = []
                }

                if (i !== keyParts.length - 1) {
                    currentObj[mainPropertyName][index] = currentObj[mainPropertyName][index] || {};
                    currentObj = currentObj[mainPropertyName][index];
                } else {
                    currentObj[mainPropertyName][index] = flatObj[key];
                }
            } else if (i !== keyParts.length - 1) {
                currentObj[keyPart] = currentObj[keyPart] || {};
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
