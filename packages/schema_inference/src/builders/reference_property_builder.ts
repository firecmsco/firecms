import { findCommonInitialStringInPath } from "../strings";
import { InferencePropertyBuilderProps } from "../types";
import { Property } from "@firecms/types";

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
