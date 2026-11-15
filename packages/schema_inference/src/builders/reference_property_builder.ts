import { InferencePropertyBuilderProps } from "../types.js";
import { findCommonInitialStringInPath } from "../strings.js";
import { Property } from "../cms_types.js";

export function buildReferenceProperty({
                                        totalDocsCount,
                                        valuesResult
                                    }: InferencePropertyBuilderProps): Property {

    const property: Property = {
        dataType: "reference",
        path: findCommonInitialStringInPath(valuesResult) ?? "!!!FIX_ME!!!",
        editable: true
    };

    return property;
}
