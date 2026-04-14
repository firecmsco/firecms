import { findCommonInitialStringInPath } from "../strings";
import { InferencePropertyBuilderProps } from "../types";
import { Property } from "@rebasepro/types";

export function buildReferenceProperty({
    name,
    totalDocsCount,
    valuesResult
}: InferencePropertyBuilderProps): Property {

    const property: Property = {
        name: name ?? "",
        type: "reference",
        path: findCommonInitialStringInPath(valuesResult) ?? "!!!FIX_ME!!!"
    };

    return property;
}
