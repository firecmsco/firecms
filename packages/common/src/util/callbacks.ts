import { EntityCallbacks, Properties } from "@firecms/types";
import { mergeDeep } from "./objects";

/**
 * Helper function to recursively check if there are any callbacks in the properties.
 */
function hasPropertyCallbacks(properties: Properties, callbackName: "afterRead" | "beforeSave"): boolean {
    if (!properties) return false;
    for (const property of Object.values(properties)) {
        if (property.callbacks?.[callbackName]) return true;
        if (property.type === "map" && property.properties) {
            if (hasPropertyCallbacks(property.properties, callbackName)) return true;
        } else if (property.type === "array" && property.of) {
            const ofs = Array.isArray(property.of) ? property.of : [property.of];
            for (const of of ofs) {
                if (of.callbacks?.[callbackName]) return true;
                if (of.type === "map" && of.properties && hasPropertyCallbacks(of.properties, callbackName)) return true;
            }
        }
    }
    return false;
}

/**
 * Recursively process properties to apply field-level hooks.
 */
async function processProperties(
    properties: Properties,
    values: any,
    previousValues: any,
    propsContext: any,
    callbackName: "afterRead" | "beforeSave"
): Promise<any> {
    if (!values || typeof values !== "object") return values;

    let result = { ...values };

    for (const [key, property] of Object.entries(properties)) {
        if (result[key] === undefined) continue;

        let currentValue = result[key];
        let previousValue = previousValues?.[key];

        // 1. Array Property
        if (property.type === "array" && Array.isArray(currentValue)) {
            // We only support traversing single-type arrays for hooks currently to avoid complex union matching
            if (property.of && !Array.isArray(property.of)) {
                currentValue = await Promise.all(currentValue.map(async (item, index) => {
                    const prevItem = Array.isArray(previousValue) ? previousValue[index] : undefined;
                    // Mock a properties object to process a single item
                    const singlePropData = { "_tmp": property.of } as Properties;
                    const res = await processProperties(singlePropData, { "_tmp": item }, { "_tmp": prevItem }, propsContext, callbackName);
                    return res["_tmp"];
                }));
            }
        }
        // 2. Map Property
        else if (property.type === "map" && property.properties && typeof currentValue === "object") {
            currentValue = await processProperties(property.properties, currentValue, previousValue, propsContext, callbackName);
        }

        // 3. Property's own callback
        if (property.callbacks?.[callbackName]) {
            const cbRes = await Promise.resolve(property.callbacks[callbackName]({
                ...propsContext,
                value: currentValue,
                previousValue
            }));
            if (cbRes !== undefined) {
                currentValue = cbRes;
            }
        }

        result[key] = currentValue;
    }
    return result;
}

/**
 * Helper function to extract field-level PropertyCallbacks from a properties schema
 * and wrap them into an EntityCallbacks object recursively.
 */
export const buildPropertyCallbacks = (properties: Properties): EntityCallbacks | undefined => {
    if (!properties) return undefined;

    const propertyCallbacks: EntityCallbacks = {};

    if (hasPropertyCallbacks(properties, "afterRead")) {
        propertyCallbacks.afterRead = async (props) => {
            const processedValues = await processProperties(
                properties,
                props.entity.values,
                props.entity.values,
                props,
                "afterRead"
            );
            return { ...props.entity, values: processedValues };
        };
    }

    if (hasPropertyCallbacks(properties, "beforeSave")) {
        propertyCallbacks.beforeSave = async (props) => {
            return await processProperties(
                properties,
                props.values,
                props.previousValues,
                props,
                "beforeSave"
            );
        };
    }

    return Object.keys(propertyCallbacks).length > 0 ? propertyCallbacks : undefined;
};
