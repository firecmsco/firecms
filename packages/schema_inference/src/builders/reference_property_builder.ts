import { InferencePropertyBuilderProps } from "../types";
import { findCommonInitialStringInPath } from "../strings";
import { Property } from "../cms_types";

export function buildReferenceProperty({
                                        totalDocsCount,
                                        valuesResult
                                    }: InferencePropertyBuilderProps): Property {

    const property: Property = {
        type: "reference",
        path: findCommonInitialStringInPath(valuesResult) ?? "!!!FIX_ME!!!",
        editable: true
    };

    return property;
}
