import {
    DefaultSelectedViewBuilder,
    DefaultSelectedViewParams,
    PropertiesOrBuilders,
    PropertyOrBuilder
} from "../types";
import { isPropertyBuilder } from "./entities";

export function sortProperties<M extends Record<string, any>>(properties: PropertiesOrBuilders<M>, propertiesOrder?: (keyof M)[]): PropertiesOrBuilders<M> {
    try {
        const propertiesKeys = Object.keys(properties);
        const allPropertiesOrder = propertiesOrder ?? propertiesKeys;
        return allPropertiesOrder
            .map((key) => {
                if (properties[key as keyof M]) {
                    const property = properties[key] as PropertyOrBuilder;
                    if (!isPropertyBuilder(property) && property?.dataType === "map" && property.properties) {
                        return ({
                            [key]: {
                                ...property,
                                properties: sortProperties(property.properties, property.propertiesOrder)
                            }
                        });
                    } else {
                        return ({ [key]: property });
                    }
                } else {
                    return undefined;
                }
            })
            .filter((a) => a !== undefined)
            .reduce((a: any, b: any) => ({ ...a, ...b }), {}) as PropertiesOrBuilders<M>;
    } catch (e) {
        console.error("Error sorting properties", e);
        return properties;
    }
}

export function resolveDefaultSelectedView(
    defaultSelectedView: string | DefaultSelectedViewBuilder | undefined,
    params: DefaultSelectedViewParams
) {
    if (!defaultSelectedView) {
        return undefined;
    } else if (typeof defaultSelectedView === "string") {
        return defaultSelectedView;
    } else {
        return defaultSelectedView(params);
    }
}
